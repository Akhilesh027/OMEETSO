import tls from "tls";
import net from "net";
import fs from "fs";
import path from "path";
import { env } from "../../../config/env";

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  encoding?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export const OMEETSO_LOGO_URL = "https://omeetso.in/logo.png";
export const OMEETSO_LOGO_CID = "cid:omeetso-logo";

let cachedLogoBase64 = "";

/**
 * Wraps a Base64 string into 76-character lines in compliance with RFC 2045 MIME specifications.
 */
function wrapBase64(b64: string, maxLineLength = 76): string {
  const lines: string[] = [];
  for (let i = 0; i < b64.length; i += maxLineLength) {
    lines.push(b64.slice(i, i + maxLineLength));
  }
  return lines.join("\r\n");
}

/**
 * Loads and caches the official Omeetso logo in Base64 format from local assets or remote fallback.
 */
export async function getOmeetsoLogoBase64(): Promise<string> {
  if (cachedLogoBase64) return cachedLogoBase64;

  const candidatePaths = [
    path.resolve(__dirname, "../../../../../frontend/public/logo.png"),
    path.resolve(__dirname, "../../../../frontend/public/logo.png"),
    path.resolve(process.cwd(), "../frontend/public/logo.png"),
    path.resolve(process.cwd(), "frontend/public/logo.png"),
    path.resolve(process.cwd(), "public/logo.png"),
    path.resolve(__dirname, "assets/logo.png"),
    path.resolve(__dirname, "../assets/logo.png")
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        if (buf && buf.length > 0) {
          cachedLogoBase64 = buf.toString("base64");
          return cachedLogoBase64;
        }
      }
    } catch {}
  }

  // Network fallback if running in a decoupled container environment
  try {
    const res = await fetch("https://omeetso.in/logo.png");
    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      cachedLogoBase64 = Buffer.from(arrayBuf).toString("base64");
      return cachedLogoBase64;
    }
  } catch (err: any) {
    console.warn("[Email] Warning: Unable to fetch remote logo for inline CID attachment:", err?.message || err);
  }

  return "";
}

/**
 * Pure Node.js SMTP sender over TLS (Port 465) or STARTTLS (Port 587)
 * Zero external dependencies required.
 */
async function sendViaSmtpSocket(
  host: string,
  port: number,
  user: string,
  pass: string,
  from: string,
  fromName: string,
  to: string,
  subject: string,
  html: string,
  authMethod: "LOGIN" | "PLAIN" = "LOGIN",
  inlineLogoBase64?: string,
  attachments?: EmailAttachment[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (res: { success: boolean; messageId?: string; error?: string }) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutTimer);
        try {
          socket?.end();
          socket?.destroy();
        } catch { /* ignore */ }
        resolve(res);
      }
    };

    let socket: any = null;
    const timeoutTimer = setTimeout(() => {
      finish({ success: false, error: `SMTP timeout after 8s connecting to ${host}:${port}` });
    }, 8000);

    try {
      socket = tls.connect(
        {
          host,
          port,
          servername: host,
          rejectUnauthorized: false, // Prevents self-signed cert issues
        },
        () => {
          // Connected securely
        }
      );
    } catch (err: any) {
      clearTimeout(timeoutTimer);
      return resolve({ success: false, error: `Connection failed: ${err.message}` });
    }

    socket.setTimeout(8000);
    socket.on("timeout", () => {
      clearTimeout(timeoutTimer);
      finish({ success: false, error: `SMTP socket timeout on ${host}:${port}` });
    });

    socket.on("error", (err: any) => {
      clearTimeout(timeoutTimer);
      finish({ success: false, error: `SMTP socket error: ${err.message}` });
    });

    let buffer = "";
    let step = 0;

    socket.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const code = parseInt(line.slice(0, 3), 10);
        const isLastLine = line.charAt(3) === " ";

        if (!isLastLine && (line.charAt(3) === "-" || isNaN(code))) {
          continue; // Multiline response continuation
        }

        handleSmtpResponse(code, line);
      }
    });

    const sendCmd = (cmd: string) => {
      if (!socket.destroyed) {
        socket.write(cmd + "\r\n");
      }
    };

    const handleSmtpResponse = (code: number, line: string) => {
      try {
        switch (step) {
          case 0:
            // Expecting 220 Greeting
            if (code === 220) {
              step = 1;
              sendCmd("EHLO omeetso.in");
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `Unexpected greeting: ${line}` });
            }
            break;

          case 1:
            // Expecting 250 after EHLO
            if (code === 250) {
              if (authMethod === "PLAIN") {
                step = 4; // Skip to expecting 235
                const plainAuth = Buffer.from(`\0${user}\0${pass}`).toString("base64");
                sendCmd(`AUTH PLAIN ${plainAuth}`);
              } else {
                step = 2;
                sendCmd("AUTH LOGIN");
              }
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `EHLO failed: ${line}` });
            }
            break;

          case 2:
            // Expecting 334 (Username prompt in Base64)
            if (code === 334) {
              step = 3;
              sendCmd(Buffer.from(user).toString("base64"));
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `AUTH LOGIN rejected: ${line}` });
            }
            break;

          case 3:
            // Expecting 334 (Password prompt in Base64)
            if (code === 334) {
              step = 4;
              sendCmd(Buffer.from(pass).toString("base64"));
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `Username rejected: ${line}` });
            }
            break;

          case 4:
            // Expecting 235 Authentication succeeded
            if (code === 235) {
              step = 5;
              sendCmd(`MAIL FROM:<${from}>`);
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `SMTP Authentication (${authMethod}) failed: ${line}` });
            }
            break;

          case 5:
            // Expecting 250 after MAIL FROM
            if (code === 250) {
              step = 6;
              sendCmd(`RCPT TO:<${to}>`);
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `MAIL FROM rejected: ${line}` });
            }
            break;

          case 6:
            // Expecting 250 after RCPT TO
            if (code === 250) {
              step = 7;
              sendCmd("DATA");
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `RCPT TO rejected: ${line}` });
            }
            break;

          case 7:
            // Expecting 354 Start mail input
            if (code === 354) {
              step = 8;
              const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@omeetso.in>`;
              const dateStr = new Date().toUTCString();

              let rawMail = "";
              const hasAttachments = Boolean(attachments && attachments.length > 0);
              const hasInlineLogo = Boolean(inlineLogoBase64 && html.includes("cid:omeetso-logo"));

              if (hasAttachments) {
                const mixedBoundary = `----=_Mixed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const relatedBoundary = `----=_Related_${Date.now()}_${Math.random().toString(36).slice(2)}`;

                const headers = [
                  `From: "${fromName}" <${from}>`,
                  `To: <${to}>`,
                  `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
                  `Date: ${dateStr}`,
                  `Message-ID: ${messageId}`,
                  `MIME-Version: 1.0`,
                  `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
                  `X-Mailer: Omeetso Platform Mailer 1.0`
                ].join("\r\n");

                let htmlBodyPart = "";
                if (hasInlineLogo) {
                  htmlBodyPart = [
                    `--${mixedBoundary}`,
                    `Content-Type: multipart/related; boundary="${relatedBoundary}"`,
                    ``,
                    `--${relatedBoundary}`,
                    `Content-Type: text/html; charset=UTF-8`,
                    `Content-Transfer-Encoding: 8bit`,
                    ``,
                    html,
                    ``,
                    `--${relatedBoundary}`,
                    `Content-Type: image/png; name="logo.png"`,
                    `Content-Transfer-Encoding: base64`,
                    `Content-ID: <omeetso-logo>`,
                    `Content-Disposition: inline; filename="logo.png"`,
                    ``,
                    wrapBase64(inlineLogoBase64!),
                    ``,
                    `--${relatedBoundary}--`
                  ].join("\r\n");
                } else {
                  const fallbackHtml = html.replace(/cid:omeetso-logo/g, OMEETSO_LOGO_URL);
                  htmlBodyPart = [
                    `--${mixedBoundary}`,
                    `Content-Type: text/html; charset=UTF-8`,
                    `Content-Transfer-Encoding: 8bit`,
                    ``,
                    fallbackHtml
                  ].join("\r\n");
                }

                const attachmentParts: string[] = [];
                for (const att of (attachments || [])) {
                  let attBuf: Buffer | null = null;
                  if (att.content) {
                    attBuf = Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content, (att.encoding as any) || "utf-8");
                  } else if (att.path && fs.existsSync(att.path)) {
                    try {
                      attBuf = fs.readFileSync(att.path);
                    } catch {}
                  }
                  if (attBuf && attBuf.length > 0) {
                    const cType = att.contentType || "application/octet-stream";
                    const safeName = (att.filename || "attachment.pdf").replace(/["\r\n]/g, "_");
                    attachmentParts.push([
                      `--${mixedBoundary}`,
                      `Content-Type: ${cType}; name="${safeName}"`,
                      `Content-Transfer-Encoding: base64`,
                      `Content-Disposition: attachment; filename="${safeName}"`,
                      ``,
                      wrapBase64(attBuf.toString("base64")),
                      ``
                    ].join("\r\n"));
                  }
                }

                const allParts = [htmlBodyPart, ...attachmentParts].join("\r\n\r\n");
                rawMail = `${headers}\r\n\r\n${allParts}\r\n--${mixedBoundary}--\r\n.\r\n`;
              } else if (hasInlineLogo) {
                const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const headers = [
                  `From: "${fromName}" <${from}>`,
                  `To: <${to}>`,
                  `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
                  `Date: ${dateStr}`,
                  `Message-ID: ${messageId}`,
                  `MIME-Version: 1.0`,
                  `Content-Type: multipart/related; boundary="${boundary}"`,
                  `X-Mailer: Omeetso Platform Mailer 1.0`
                ].join("\r\n");

                const mimeBody = [
                  `--${boundary}`,
                  `Content-Type: text/html; charset=UTF-8`,
                  `Content-Transfer-Encoding: 8bit`,
                  ``,
                  html,
                  ``,
                  `--${boundary}`,
                  `Content-Type: image/png; name="logo.png"`,
                  `Content-Transfer-Encoding: base64`,
                  `Content-ID: <omeetso-logo>`,
                  `Content-Disposition: inline; filename="logo.png"`,
                  ``,
                  wrapBase64(inlineLogoBase64!),
                  ``,
                  `--${boundary}--`
                ].join("\r\n");

                rawMail = `${headers}\r\n\r\n${mimeBody}\r\n.\r\n`;
              } else {
                const fallbackHtml = html.replace(/cid:omeetso-logo/g, OMEETSO_LOGO_URL);
                const headers = [
                  `From: "${fromName}" <${from}>`,
                  `To: <${to}>`,
                  `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
                  `Date: ${dateStr}`,
                  `Message-ID: ${messageId}`,
                  `MIME-Version: 1.0`,
                  `Content-Type: text/html; charset=UTF-8`,
                  `Content-Transfer-Encoding: 8bit`,
                  `X-Mailer: Omeetso Platform Mailer 1.0`
                ].join("\r\n");

                rawMail = `${headers}\r\n\r\n${fallbackHtml}\r\n.\r\n`;
              }

              socket.write(rawMail);
            } else {
              clearTimeout(timeoutTimer);
              finish({ success: false, error: `DATA command rejected: ${line}` });
            }
            break;

          case 8:
            // Expecting 250 OK message queued
            clearTimeout(timeoutTimer);
            if (code === 250) {
              sendCmd("QUIT");
              finish({ success: true, messageId: line });
            } else {
              finish({ success: false, error: `Message delivery rejected: ${line}` });
            }
            break;
        }
      } catch (err: any) {
        clearTimeout(timeoutTimer);
        finish({ success: false, error: `Error during SMTP handshake: ${err.message}` });
      }
    };
  });
}

/**
 * Core SMTP email dispatcher that resolves candidate mail hosts,
 * connects via TLS (port 465), and authenticates via PLAIN / LOGIN.
 */
export async function dispatchEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const user = (env.SMTP_USER || "info@omeetso.in").trim().replace(/^["']|["']$/g, "");
  const pass = (env.SMTP_PASS || "Dlns@2021").trim().replace(/^["']|["']$/g, "");
  const from = (env.SMTP_FROM || "info@omeetso.in").trim().replace(/^["']|["']$/g, "");
  const fromName = (env.SMTP_FROM_NAME || "Omeetso").trim().replace(/^["']|["']$/g, "");

  const rawCandidates: { host: string; port: number }[] = [];

  if (env.SMTP_HOST) {
    rawCandidates.push({ host: env.SMTP_HOST.trim(), port: Number(env.SMTP_PORT) || 465 });
  }

  try {
    const dns = await import("dns");
    const mxRecords = await dns.promises.resolveMx("omeetso.in");
    for (const record of mxRecords.sort((a, b) => a.priority - b.priority)) {
      const exchange = record.exchange.toLowerCase();
      if (exchange.includes("titan")) {
        rawCandidates.push({ host: "smtp.titan.email", port: 465 });
      } else if (exchange.includes("zoho.in")) {
        rawCandidates.push({ host: "smtppro.zoho.in", port: 465 });
      } else if (exchange.includes("zoho")) {
        rawCandidates.push({ host: "smtp.zoho.com", port: 465 });
      } else if (exchange.includes("google") || exchange.includes("gmail")) {
        rawCandidates.push({ host: "smtp.gmail.com", port: 465 });
      } else if (exchange.includes("secureserver")) {
        rawCandidates.push({ host: "smtpout.secureserver.net", port: 465 });
      } else if (exchange.includes("hostinger")) {
        rawCandidates.push({ host: "smtp.hostinger.com", port: 465 });
      } else {
        rawCandidates.push({ host: exchange, port: 465 });
      }
    }
  } catch (err: any) {
    console.warn("[SMTP] MX lookup failed:", err.message);
  }

  rawCandidates.push({ host: "smtp.hostinger.com", port: 465 });
  rawCandidates.push({ host: "smtp.titan.email", port: 465 });
  rawCandidates.push({ host: "mail.omeetso.in", port: 465 });

  const hostCandidates = rawCandidates.filter(
    (c, index, self) => index === self.findIndex((t) => t.host === c.host && t.port === c.port)
  );

  let lastError = "No hosts attempted";

  const logoBase64 = await getOmeetsoLogoBase64();

  for (const candidate of hostCandidates) {
    for (const authMethod of ["PLAIN", "LOGIN"] as const) {
      const result = await sendViaSmtpSocket(
        candidate.host,
        candidate.port,
        user,
        pass,
        from,
        fromName,
        options.to,
        options.subject,
        options.html,
        authMethod,
        logoBase64,
        options.attachments
      );

      if (result.success) {
        console.log(`[SMTP] Email successfully sent to ${options.to} via ${candidate.host}:${candidate.port} [${authMethod}]`);
        return result;
      }

      lastError = result.error || "Delivery failed";
    }
  }

  return { success: false, error: lastError };
}

/**
 * Renders a standardized, responsive email header with the official Omeetso logo
 */
function renderEmailHeader(options: {
  portalUrl: string;
  badgeText?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeColor?: string;
  subtitle?: string;
  isAdmin?: boolean;
}): string {
  const badgeHtml = options.badgeText
    ? `
      <div style="margin-top: 14px;">
        <span style="display: inline-block; padding: 5px 14px; background-color: ${options.badgeBg || "#eff6ff"}; border: 1px solid ${options.badgeBorder || "#bfdbfe"}; border-radius: 9999px; font-size: 11px; font-weight: 700; color: ${options.badgeColor || "#1d4ed8"}; text-transform: uppercase; letter-spacing: 0.6px;">
          ${options.badgeText}
        </span>
      </div>
    `
    : "";

  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-bottom: 1px solid #f1f5f9; padding: 30px 24px 22px 24px;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="vertical-align: middle;">
                <a href="${options.portalUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="${OMEETSO_LOGO_CID}" alt="Omeetso" width="155" style="display: block; width: 155px; max-width: 155px; height: auto; border: 0; outline: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 900; color: #1e3a8a;" />
                </a>
              </td>
              ${
                options.isAdmin
                  ? `<td style="vertical-align: middle; padding-left: 12px; border-left: 2px solid #e2e8f0;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; color: #475569; letter-spacing: 1px; text-transform: uppercase;">ADMIN DISPATCH</span>
                    </td>`
                  : ""
              }
            </tr>
          </table>
          ${badgeHtml}
        </td>
      </tr>
    </table>
  `;
}

/**
 * Renders a standardized, compliant email footer with correct legal entity details and links
 */
function renderEmailFooter(options: {
  portalUrl: string;
  securityNote?: string;
  recipientEmail?: string;
  isAdmin?: boolean;
}): string {
  const currentYear = new Date().getFullYear();

  const securityNoteHtml = options.securityNote
    ? `<p style="margin: 0 0 14px 0; font-size: 11px; line-height: 1.5; color: #64748b;">${options.securityNote}</p>`
    : "";

  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 24px;">
      <tr>
        <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #64748b;">
          <p style="margin: 0 0 10px 0; font-weight: 700; color: #1e293b; font-size: 13px;">
            Omeetso • India's Hyperlocal Marketplace
          </p>
          <p style="margin: 0 0 14px 0; font-size: 12px;">
            <a href="${options.portalUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">Home</a>
            &nbsp;&nbsp;•&nbsp;&nbsp;
            <a href="${options.portalUrl}/help" style="color: #2563eb; text-decoration: none; font-weight: 600;">Help Centre</a>
            &nbsp;&nbsp;•&nbsp;&nbsp;
            <a href="${options.portalUrl}/safety" style="color: #2563eb; text-decoration: none; font-weight: 600;">Safety Centre</a>
            &nbsp;&nbsp;•&nbsp;&nbsp;
            <a href="${options.portalUrl}/terms" style="color: #2563eb; text-decoration: none; font-weight: 600;">Terms</a>
            &nbsp;&nbsp;•&nbsp;&nbsp;
            <a href="${options.portalUrl}/privacy" style="color: #2563eb; text-decoration: none; font-weight: 600;">Privacy</a>
            &nbsp;&nbsp;•&nbsp;&nbsp;
            <a href="${options.portalUrl}/contact" style="color: #2563eb; text-decoration: none; font-weight: 600;">Contact</a>
          </p>

          ${securityNoteHtml}

          <p style="margin: 8px 0 4px 0; font-size: 11px; color: #94a3b8;">
            Operated by <strong>DIGITALNESS INDUSTRIES LLP</strong> • Uppal, Hyderabad, Telangana, India
          </p>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #94a3b8;">
            Support: <a href="mailto:info@omeetso.in" style="color: #64748b; text-decoration: underline;">info@omeetso.in</a> &nbsp;|&nbsp; Web: <a href="${options.portalUrl}" style="color: #64748b; text-decoration: underline;">omeetso.in</a>
          </p>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">
            © ${currentYear} DIGITALNESS INDUSTRIES LLP. All rights reserved.
          </p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 500;">
            Made with ❤️ in India
          </p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Dispatches a styled Verification OTP email to the recipient
 */
export async function sendVerificationOtpEmail(
  toEmail: string,
  otpCode: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `${otpCode} is your Omeetso Email Verification Code`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "🛡️ Shield Trust Verification",
    badgeBg: "#eff6ff",
    badgeBorder: "#bfdbfe",
    badgeColor: "#1d4ed8"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email because an email verification request was initiated for your Omeetso profile. Never share your OTP with anyone, including Omeetso staff."
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Omeetso Email Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Main Content -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 30px 32px;">
                <tr>
                  <td align="center">
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3;">
                      Verify Your Email Address
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; max-width: 440px;">
                      Enter the one-time verification code below to verify your email address and increase your seller credibility rating.
                    </p>

                    <!-- OTP Code Box -->
                    <div style="margin: 20px auto 22px auto; padding: 20px 24px; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 16px; max-width: 290px; text-align: center;">
                      <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                        VERIFICATION CODE
                      </div>
                      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; margin: 0; line-height: 1.2;">
                        ${otpCode}
                      </div>
                    </div>

                    <!-- Trust Points Tag -->
                    <div style="margin-bottom: 24px;">
                      <span style="display: inline-block; padding: 8px 18px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; color: #065f46; font-size: 13px; font-weight: 700;">
                        ✓ +15 Trust Points will be awarded to your profile
                      </span>
                    </div>

                    <!-- Alert Notice -->
                    <div style="padding: 14px 18px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; text-align: left; font-size: 13px; color: #92400e; margin-bottom: 26px; line-height: 1.5;">
                      ⏱️ This code is valid for <strong>10 minutes</strong>. For your security, never share this OTP with anyone, including Omeetso representatives.
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                      If you did not initiate this verification request, please ignore this email or contact support at <a href="mailto:info@omeetso.in" style="color: #2563eb; text-decoration: none; font-weight: 600;">info@omeetso.in</a>.
                    </p>
                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: toEmail, subject, html });
}

/**
 * Dispatches a warm, branded welcome email to newly registered users
 */
export async function sendUserWelcomeEmail(
  toEmail: string,
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const displayName = userName && userName.trim() ? userName.trim() : "Valued Member";
  const subject = `Welcome to Omeetso, ${displayName}! 🎉`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "👋 Welcome to Neighborhood Commerce",
    badgeBg: "#f0fdf4",
    badgeBorder: "#bbf7d0",
    badgeColor: "#15803d"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email because you recently registered an account on Omeetso. Have questions? Our support team is here to help at info@omeetso.in."
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Omeetso</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; line-height: 1.3;">
                      Welcome to Omeetso, ${displayName}! 🎉
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 28px 0; text-align: center;">
                      We're thrilled to have you! Omeetso connects you with verified neighbors, local businesses, job opportunities, and professional services right in your locality with <strong>0% commission</strong>.
                    </p>

                    <!-- Features -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px;">
                            <tr>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                <div style="font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">
                                  🛍️ Buy & Sell Nearby with Zero Commission
                                </div>
                                <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                                  List electronics, vehicles, furniture, and fashion. Connect directly with authentic local buyers via call or WhatsApp.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px;">
                            <tr>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                <div style="font-size: 14px; font-weight: 700; color: #7c3aed; margin-bottom: 4px;">
                                  💼 Local Jobs & Hiring
                                </div>
                                <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                                  Discover nearby job openings or hire skilled local candidates across office, retail, tech, and skilled trades.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px;">
                            <tr>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                <div style="font-size: 14px; font-weight: 700; color: #c2410c; margin-bottom: 4px;">
                                  🏢 Neighborhood Stores & Services
                                </div>
                                <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                                  Browse local retail stores, home repair experts, beauty salons, tutors, and professional home services with customer reviews.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px;">
                            <tr>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                <div style="font-size: 14px; font-weight: 700; color: #047857; margin-bottom: 4px;">
                                  🛡️ Shield Trust Verification
                                </div>
                                <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                                  Verify your email and government ID to earn verified badges, unlock extra trust points, and stand out in search results.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 12px 0;">
                      <tr>
                        <td align="center">
                          <a href="${portalUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                            Start Exploring Omeetso &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: toEmail, subject, html });
}

export interface AdminAlertOptions {
  eventType: "listing_created" | "job_posted" | "business_registered" | "service_registered" | "user_registered";
  title: string;
  summary: string;
  details: Record<string, string | number | undefined | null>;
  link?: string;
  actionText?: string;
}

/**
 * Dispatches an instant administrator alert email to configured admin address
 * for critical events (new listings, jobs, businesses, services, new users).
 */
export async function sendAdminAlertEmail(
  options: AdminAlertOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const adminEmail = (env.ADMIN_NOTIFICATION_EMAIL || "info@omeetso.in").trim();
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const eventBadgeMap: Record<AdminAlertOptions["eventType"], { label: string; bg: string; border: string; color: string; icon: string }> = {
    listing_created: { label: "NEW LISTING SUBMITTED", bg: "#f0f9ff", border: "#bae6fd", color: "#0284c7", icon: "🛍️" },
    job_posted: { label: "NEW JOB POSTED", bg: "#faf5ff", border: "#e9d5ff", color: "#9333ea", icon: "💼" },
    business_registered: { label: "NEW BUSINESS REGISTERED", bg: "#fff7ed", border: "#fed7aa", color: "#ea580c", icon: "🏢" },
    service_registered: { label: "NEW SERVICE CREATED", bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a", icon: "🛠️" },
    user_registered: { label: "NEW USER REGISTERED", bg: "#eef2ff", border: "#c7d2fe", color: "#4f46e5", icon: "👤" }
  };

  const badge = eventBadgeMap[options.eventType] || { label: "SYSTEM ALERT", bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb", icon: "🔔" };
  const subject = `[Omeetso Admin] ${badge.icon} ${options.title}`;

  const detailRows = Object.entries(options.details)
    .filter(([_, val]) => val !== undefined && val !== null && val !== "")
    .map(([key, val], idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
        <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: capitalize; width: 38%; vertical-align: top;">
          ${key.replace(/([A-Z])/g, " $1").trim()}
        </td>
        <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700; word-break: break-word;">
          ${String(val)}
        </td>
      </tr>
    `).join("");

  const actionButton = options.link ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 10px 0;">
      <tr>
        <td align="center">
          <a href="${options.link}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);" target="_blank">
            ${options.actionText || "View in Admin Dashboard &rarr;"}
          </a>
        </td>
      </tr>
    </table>
  ` : "";

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: `${badge.icon} ${badge.label}`,
    badgeBg: badge.bg,
    badgeBorder: badge.border,
    badgeColor: badge.color,
    isAdmin: true
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: `Automated internal admin alert dispatched to ${adminEmail}. Generated by Omeetso backend event dispatcher.`,
    isAdmin: true
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 30px 28px;">
                <tr>
                  <td>
                    <h1 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; line-height: 1.4;">
                      ${options.title}
                    </h1>
                    <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 22px 0;">
                      ${options.summary}
                    </p>

                    <!-- Details Table -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                      <tbody>
                        ${detailRows}
                      </tbody>
                    </table>

                    ${actionButton}
                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: adminEmail, subject, html });
}

export interface ListingSubmittedEmailOptions {
  toEmail: string;
  sellerName?: string;
  listingTitle: string;
  listingPrice: string;
  listingUrl: string;
  listingCategory?: string;
  listingLocation?: string;
  imageUrl?: string;
}

/**
 * Dispatches a confirmation email to the seller when their listing is submitted,
 * clearly stating "Your listing has been successfully submitted." with all existing listing details.
 */
export async function sendListingSubmittedEmail(
  options: ListingSubmittedEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const sellerDisplayName = options.sellerName && options.sellerName.trim() ? options.sellerName.trim() : "Valued Seller";
  const subject = `Your listing "${options.listingTitle}" has been successfully submitted!`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "⏳ Submission Received",
    badgeBg: "#eff6ff",
    badgeBorder: "#bfdbfe",
    badgeColor: "#1d4ed8"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email confirmation because you submitted a listing on Omeetso. Our moderation team reviews submissions promptly to maintain a safe, trusted community."
  });

  const imageHtml = options.imageUrl
    ? `
      <div style="margin-bottom: 22px; text-align: center;">
        <img src="${options.imageUrl}" alt="${options.listingTitle}" style="max-width: 100%; max-height: 250px; border-radius: 14px; object-fit: cover; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" />
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Listing Has Been Successfully Submitted</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <!-- Clear Confirmation Message Banner -->
                    <div style="padding: 16px 20px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; text-align: center; margin-bottom: 24px;">
                      <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                        STATUS: SUBMISSION RECEIVED
                      </div>
                      <h1 style="font-size: 20px; font-weight: 800; color: #065f46; margin: 0; line-height: 1.3;">
                        Your listing has been successfully submitted.
                      </h1>
                    </div>

                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Hello <strong>${sellerDisplayName}</strong>, thank you for publishing on Omeetso! Your listing has been received and is currently under review by our moderation team.
                    </p>

                    ${imageHtml}

                    <!-- Product Summary Card (With Existing Content) -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                            PRODUCT DETAILS
                          </div>
                          <div style="font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.4; margin-bottom: 8px;">
                            ${options.listingTitle}
                          </div>
                          <div style="margin-bottom: 14px;">
                            <span style="font-size: 24px; font-weight: 900; color: #1e40af; letter-spacing: -0.5px;">
                              ${options.listingPrice}
                            </span>
                          </div>

                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 8px;">
                            <tr>
                              ${options.listingCategory ? `
                              <td style="font-size: 12px; color: #64748b; padding-right: 12px;">
                                <strong style="color: #334155;">Category:</strong> ${options.listingCategory}
                              </td>
                              ` : ""}
                              ${options.listingLocation ? `
                              <td style="font-size: 12px; color: #64748b;">
                                <strong style="color: #334155;">Location:</strong> ${options.listingLocation}
                              </td>
                              ` : ""}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                      <tr>
                        <td align="center">
                          <a href="${options.listingUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                            View Submitted Listing &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Review Information Section -->
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px 20px;">
                      <div style="font-size: 13px; font-weight: 800; color: #166534; margin-bottom: 10px;">
                        📌 What happens next?
                      </div>
                      <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #374151; line-height: 1.8;">
                        <li><strong>Moderation Review:</strong> Listings are typically verified within 15–30 minutes during business hours.</li>
                        <li><strong>Instant Notification:</strong> You will receive an approval email the moment your listing goes live.</li>
                        <li><strong>Editing Anytime:</strong> You can update price, photos, or details anytime from your seller dashboard.</li>
                      </ul>
                    </div>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: options.toEmail, subject, html });
}

export interface ListingApprovedEmailOptions {
  toEmail: string;
  sellerName?: string;
  listingTitle: string;
  listingPrice: string;
  listingUrl: string;
  listingCategory?: string;
  listingLocation?: string;
  imageUrl?: string;
}

/**
 * Dispatches a branded listing approval confirmation email to the seller
 * after a product listing has been approved by admin moderation.
 */
export async function sendListingApprovedEmail(
  options: ListingApprovedEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const sellerDisplayName = options.sellerName && options.sellerName.trim() ? options.sellerName.trim() : "Valued Seller";
  const subject = `🎉 Approved & Live: "${options.listingTitle}" is now active on Omeetso!`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "✅ Product Approved & Live",
    badgeBg: "#f0fdf4",
    badgeBorder: "#bbf7d0",
    badgeColor: "#15803d"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email confirmation because your product listing was reviewed and approved by Omeetso moderation. You can manage your listing anytime in your seller dashboard."
  });

  const imageHtml = options.imageUrl
    ? `
      <div style="margin-bottom: 22px; text-align: center;">
        <img src="${options.imageUrl}" alt="${options.listingTitle}" style="max-width: 100%; max-height: 250px; border-radius: 14px; object-fit: cover; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" />
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Listing is Approved!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; line-height: 1.3;">
                      Your Listing is Now Live! 🎉
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Hello <strong>${sellerDisplayName}</strong>, great news! Your product listing has passed moderation checks and is now visible to buyers across your neighborhood on Omeetso.
                    </p>

                    ${imageHtml}

                    <!-- Product Highlight Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                            STATUS: ACTIVE & PUBLISHED
                          </div>
                          <div style="font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.4; margin-bottom: 8px;">
                            ${options.listingTitle}
                          </div>
                          <div style="margin-bottom: 14px;">
                            <span style="font-size: 24px; font-weight: 900; color: #15803d; letter-spacing: -0.5px;">
                              ${options.listingPrice}
                            </span>
                          </div>

                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 8px;">
                            <tr>
                              ${options.listingCategory ? `
                              <td style="font-size: 12px; color: #64748b; padding-right: 12px;">
                                <strong style="color: #334155;">Category:</strong> ${options.listingCategory}
                              </td>
                              ` : ""}
                              ${options.listingLocation ? `
                              <td style="font-size: 12px; color: #64748b;">
                                <strong style="color: #334155;">Location:</strong> ${options.listingLocation}
                              </td>
                              ` : ""}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                      <tr>
                        <td align="center">
                          <a href="${options.listingUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);">
                            View Live Product &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Seller Tips Section -->
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px 20px;">
                      <div style="font-size: 13px; font-weight: 800; color: #166534; margin-bottom: 10px;">
                        💡 Tips to Sell Faster on Omeetso:
                      </div>
                      <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #374151; line-height: 1.8;">
                        <li><strong>Fast Responses:</strong> Keep WhatsApp notifications on to respond promptly to potential buyers.</li>
                        <li><strong>Share with Friends:</strong> Share your listing link in neighborhood WhatsApp groups or social networks.</li>
                        <li><strong>Safe Transactions:</strong> Always prefer meeting in safe public spaces and verify payment before handover.</li>
                      </ul>
                    </div>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: options.toEmail, subject, html });
}

export interface JobSubmissionConfirmationEmailOptions {
  employerEmail: string;
  employerName?: string;
  jobTitle: string;
  companyName: string;
  jobCategory?: string;
  jobType?: string;
  location?: string;
  submittedAt?: string;
  jobId?: string;
}

export async function sendJobSubmissionConfirmationEmail(
  options: JobSubmissionConfirmationEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!options.employerEmail) return { success: false, error: "Employer email is required" };
  const employerDisplayName = options.employerName?.trim() || "Valued Employer";
  const subject = `Job Submission Received: "${options.jobTitle}" awaiting review`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "⏳ Submission Received",
    badgeBg: "#fef3c7",
    badgeBorder: "#fde68a",
    badgeColor: "#b45309"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email because you submitted a job vacancy on Omeetso. Our moderation team reviews all job postings to ensure safe, legitimate opportunities for our community."
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Job Submission Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; line-height: 1.3;">
                      Job Submission Received ⏳
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Hello <strong>${employerDisplayName}</strong>, thank you for posting your job vacancy on Omeetso! Your job posting for <strong>${options.jobTitle}</strong> at <strong>${options.companyName}</strong> has been received and is currently under review by our admin moderation team.
                    </p>

                    <!-- Notice banner -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;">
                      <tr>
                        <td style="font-size: 13px; color: #92400e; line-height: 1.5;">
                          <strong>Moderation in Progress:</strong> To maintain high hiring standards, our team reviews all listings before they go live. Once approved, your listing will be published immediately to candidates.
                        </td>
                      </tr>
                    </table>

                    <!-- Job Summary Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 140px; font-weight: 600;">Job Title:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.jobTitle}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Company:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.companyName}</td>
                            </tr>
                            ${options.jobType ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Employment Type:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.jobType}</td>
                            </tr>` : ""}
                            ${options.location ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.location}</td>
                            </tr>` : ""}
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Submitted On:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.submittedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Review Status:</td>
                              <td style="padding: 6px 0; font-size: 13px;">
                                <span style="display: inline-block; padding: 4px 10px; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 9999px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">PENDING APPROVAL</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px;">
                      <tr>
                        <td align="center">
                          <a href="${portalUrl}/my/employer/jobs" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                            View Employer Dashboard &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: options.employerEmail, subject, html });
}

export interface JobApprovalEmailOptions {
  employerEmail: string;
  employerName?: string;
  jobTitle: string;
  companyName: string;
  jobId: string;
  approvedAt?: string;
  jobType?: string;
  location?: string;
}

export async function sendJobApprovalEmail(
  options: JobApprovalEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!options.employerEmail) return { success: false, error: "Employer email is required" };
  const employerDisplayName = options.employerName?.trim() || "Valued Employer";
  const subject = `🎉 Approved & Live: "${options.jobTitle}" is now active on Omeetso!`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "✅ Job Approved & Live",
    badgeBg: "#f0fdf4",
    badgeBorder: "#bbf7d0",
    badgeColor: "#15803d"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email because your job posting on Omeetso was verified and approved by our moderation team. You can manage applications anytime in your employer dashboard."
  });

  const jobLiveUrl = `${portalUrl}/job/${options.jobId}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Job Posting is Approved & Live!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; line-height: 1.3;">
                      Your Job is Live! 🎉
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Hello <strong>${employerDisplayName}</strong>, great news! Your job listing for <strong>${options.jobTitle}</strong> at <strong>${options.companyName}</strong> has been approved by the Omeetso moderation team. It is now published live and actively receiving applications from candidates.
                    </p>

                    <!-- Job Summary Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 140px; font-weight: 600;">Job Title:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.jobTitle}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Company:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.companyName}</td>
                            </tr>
                            ${options.location ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.location}</td>
                            </tr>` : ""}
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Approved On:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.approvedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Status:</td>
                              <td style="padding: 6px 0; font-size: 13px;">
                                <span style="display: inline-block; padding: 4px 10px; background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 9999px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">ACTIVE & PUBLISHED</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px;">
                      <tr>
                        <td align="center">
                          <a href="${jobLiveUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(22,163,74,0.25); margin-bottom: 12px;">
                            View Live Job Listing &rarr;
                          </a>
                          <div style="margin-top: 8px;">
                            <a href="${portalUrl}/my/employer/jobs" target="_blank" style="color: #2563eb; font-size: 13px; font-weight: 600; text-decoration: underline;">
                              Open Employer Applicant Dashboard &rarr;
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: options.employerEmail, subject, html });
}

export interface JobApplicationConfirmationEmailOptions {
  candidateEmail: string;
  candidateName?: string;
  candidatePhone?: string;
  jobTitle: string;
  companyName: string;
  appliedDate?: string;
  status?: string;
  jobId?: string;
  resumeFileName?: string;
  experience?: string;
  noticePeriod?: string;
  jobLocation?: string;
}

export async function sendJobApplicationConfirmationEmail(
  options: JobApplicationConfirmationEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!options.candidateEmail) return { success: false, error: "Candidate email is required" };
  const candidateDisplayName = options.candidateName?.trim() || "Candidate";
  const subject = `✅ Application Received & Follow-Up Guide: "${options.jobTitle}" at ${options.companyName}`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "📋 Application Received & Confirmed",
    badgeBg: "#eff6ff",
    badgeBorder: "#bfdbfe",
    badgeColor: "#1d4ed8"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email because you submitted an application for a vacancy on Omeetso. Track your application status anytime from your candidate portal."
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Received & Follow-Up Guide</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; line-height: 1.3;">
                      Application Successfully Submitted! 🎯
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Hello <strong>${candidateDisplayName}</strong>, thank you for applying! Your application has been directly delivered to the hiring team at <strong>${options.companyName}</strong>.
                    </p>

                    <!-- Application Summary Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 14px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                            Application Receipt &amp; Details
                          </h3>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 140px; font-weight: 600;">Position:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.jobTitle}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Company:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.companyName}</td>
                            </tr>
                            ${options.jobLocation ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.jobLocation}</td>
                            </tr>` : ""}
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Applied Date:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.appliedDate || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                            </tr>
                            ${options.resumeFileName ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Resume Attached:</td>
                              <td style="padding: 6px 0; font-size: 13px; color: #1e40af; font-weight: 700;">📄 ${options.resumeFileName}</td>
                            </tr>` : ""}
                            ${options.experience ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Experience / Notice:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.experience} • ${options.noticePeriod || "Immediate"}</td>
                            </tr>` : ""}
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Current Status:</td>
                              <td style="padding: 6px 0; font-size: 13px;">
                                <span style="display: inline-block; padding: 4px 12px; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 9999px; font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">${options.status || "APPLIED"} (Under Review)</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Follow-up Guide Section -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 22px; margin-bottom: 26px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 6px;">
                            🚀 What Happens Next? Follow-Up Guide
                          </h3>
                          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #14532d; line-height: 1.7;">
                            <li style="margin-bottom: 8px;">
                              <strong>1. Recruiter Review Timeline:</strong> Employers typically review incoming applications within <strong>24 to 72 business hours</strong>.
                            </li>
                            <li style="margin-bottom: 8px;">
                              <strong>2. Keep Your Phone &amp; Email Active:</strong> If shortlisted, the hiring team may reach out to you via call, SMS, or WhatsApp on <strong>${options.candidatePhone || "your contact number"}</strong> for a preliminary phone interview.
                            </li>
                            <li style="margin-bottom: 8px;">
                              <strong>3. Track Status in Real-Time:</strong> Check your live application progress in your Omeetso candidate dashboard anytime. You will receive an instant notification when your status updates to Shortlisted, Interview Scheduled, or Hired.
                            </li>
                            <li>
                              <strong>4. Preparation Tip:</strong> Review the vacancy requirements, brush up on relevant key skills, and keep your past project achievements ready for discussion.
                            </li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px;">
                      <tr>
                        <td align="center">
                          <a href="${portalUrl}/my/jobs" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); margin: 6px;">
                            Track Application in Dashboard &rarr;
                          </a>
                          <a href="${portalUrl}/jobs" target="_blank" style="display: inline-block; background-color: #f1f5f9; color: #1e293b; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 24px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 6px;">
                            Explore More Jobs &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: options.candidateEmail, subject, html });
}

export interface NewJobApplicationNotificationEmailOptions {
  employerEmail: string;
  employerName?: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  candidatePhone?: string;
  candidateEmail?: string;
  candidateExperience?: string;
  appliedDate?: string;
  jobId?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  city?: string;
  area?: string;
  currentRole?: string;
  currentCompany?: string;
  currentSalary?: number | string;
  expectedSalary?: number | string;
  noticePeriod?: string;
  education?: string;
  skills?: string[];
  summary?: string;
  screeningAnswers?: Array<{ questionText?: string; question?: string; answer: any }>;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export async function sendNewJobApplicationNotificationEmail(
  options: NewJobApplicationNotificationEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!options.employerEmail) return { success: false, error: "Employer email is required" };
  const employerDisplayName = options.employerName?.trim() || "Valued Employer";
  const subject = `👤 New Application Received: ${options.candidateName} applied for "${options.jobTitle}"`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  // Prepare resume download URL
  let resumeDownloadUrl = "";
  if (options.resumeUrl) {
    if (options.resumeUrl.startsWith("http://") || options.resumeUrl.startsWith("https://")) {
      resumeDownloadUrl = options.resumeUrl;
    } else if (options.resumeUrl.startsWith("/")) {
      resumeDownloadUrl = `${portalUrl}${options.resumeUrl}`;
    } else if (!options.resumeUrl.startsWith("data:")) {
      resumeDownloadUrl = `${portalUrl}/${options.resumeUrl}`;
    }
  }

  // Build file attachment if resume is accessible
  const attachments: EmailAttachment[] = [];
  if (options.resumeUrl) {
    try {
      const fileName = options.resumeFileName || "Candidate_Resume.pdf";
      if (options.resumeUrl.startsWith("data:")) {
        const parts = options.resumeUrl.split(",");
        if (parts.length > 1) {
          attachments.push({
            filename: fileName,
            content: Buffer.from(parts[1], "base64"),
            contentType: "application/pdf"
          });
        }
      } else if (options.resumeUrl.startsWith("http://") || options.resumeUrl.startsWith("https://")) {
        try {
          const res = await fetch(options.resumeUrl);
          if (res.ok) {
            const arr = await res.arrayBuffer();
            attachments.push({
              filename: fileName,
              content: Buffer.from(arr),
              contentType: "application/pdf"
            });
          }
        } catch (fetchErr: any) {
          console.warn("[Email] Warning: Unable to fetch remote resume for email attachment:", fetchErr?.message || fetchErr);
        }
      } else {
        // Local file check
        const candidatePaths = [
          path.resolve(process.cwd(), options.resumeUrl.replace(/^\//, "")),
          path.resolve(process.cwd(), "uploads", options.resumeUrl.replace(/^\/uploads\//, "")),
          path.resolve(__dirname, "../../../../../frontend/public", options.resumeUrl.replace(/^\//, ""))
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            attachments.push({
              filename: fileName,
              path: p,
              contentType: "application/pdf"
            });
            break;
          }
        }
      }
    } catch (attErr: any) {
      console.warn("[Email] Warning: Failed to prepare resume attachment:", attErr?.message || attErr);
    }
  }

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "💼 New Candidate Application",
    badgeBg: "#eef2ff",
    badgeBorder: "#c7d2fe",
    badgeColor: "#4338ca"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email because a job seeker submitted an application to your active vacancy on Omeetso. Review and manage candidates directly in your employer portal."
  });

  const skillsHtml = (options.skills && options.skills.length > 0)
    ? options.skills.map((s) => `<span style="display: inline-block; padding: 4px 10px; background-color: #e0e7ff; color: #3730a3; border-radius: 6px; font-weight: 700; margin: 3px; font-size: 11px;">${s}</span>`).join(" ")
    : '<span style="color: #94a3b8; font-style: italic;">Not specified</span>';

  const screeningHtml = (options.screeningAnswers && options.screeningAnswers.length > 0)
    ? options.screeningAnswers.map((sa, idx) => `
      <div style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #334155;">Q${idx + 1}: ${sa.questionText || sa.question || "Screening Question"}</p>
        <p style="margin: 0; font-size: 13px; color: #0f172a; font-weight: 600;">Answer: ${String(sa.answer || "N/A")}</p>
      </div>
    `).join("")
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Job Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; line-height: 1.3;">
                      New Candidate Application! 👤
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Hello <strong>${employerDisplayName}</strong>, you have received a new application for your vacancy <strong>${options.jobTitle}</strong> at <strong>${options.companyName}</strong>.
                    </p>

                    <!-- Quick Action Card for Resume & Pipeline -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 16px; padding: 20px; margin-bottom: 24px; color: #ffffff;">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #e0e7ff;">
                            Quick Candidate Actions:
                          </p>
                          ${resumeDownloadUrl ? `
                          <a href="${resumeDownloadUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #312e81; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 22px; border-radius: 10px; margin: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            📄 View &amp; Download Resume (${options.resumeFileName || "PDF"}) &rarr;
                          </a>` : ""}
                          <a href="${portalUrl}/my/employer/jobs" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 22px; border-radius: 10px; margin: 4px; border: 1px solid rgba(255,255,255,0.25);">
                            👥 Open Candidate Dashboard &rarr;
                          </a>
                          ${attachments.length > 0 ? `
                          <p style="margin: 12px 0 0 0; font-size: 11px; color: #c7d2fe; font-weight: 600;">
                            📎 The candidate's resume has also been attached to this email as a PDF file.
                          </p>` : ""}
                        </td>
                      </tr>
                    </table>

                    <!-- Complete Candidate Profile Dossier -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                            Candidate Profile Snapshot
                          </h3>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 140px; font-weight: 600;">Candidate Name:</td>
                              <td style="padding: 6px 0; font-size: 15px; color: #0f172a; font-weight: 800;">${options.candidateName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Applied Position:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.jobTitle}</td>
                            </tr>
                            ${options.currentRole ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Current Role:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.currentRole} ${options.currentCompany ? `at ${options.currentCompany}` : ""}</td>
                            </tr>` : ""}
                            ${options.candidateExperience ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Experience:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.candidateExperience}</td>
                            </tr>` : ""}
                            ${options.noticePeriod ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Notice Period:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.noticePeriod}</td>
                            </tr>` : ""}
                            ${options.education ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Education:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.education}</td>
                            </tr>` : ""}
                            ${options.city ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.area ? `${options.area}, ` : ""}${options.city}</td>
                            </tr>` : ""}
                            ${(options.currentSalary || options.expectedSalary) ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Salary (Cur / Exp):</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.currentSalary ? `₹${options.currentSalary}` : "N/A"} &rarr; ${options.expectedSalary ? `₹${options.expectedSalary}` : "Negotiable"}</td>
                            </tr>` : ""}
                            ${options.candidatePhone ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Phone Number:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                                <a href="tel:${options.candidatePhone.replace(/[^0-9+]/g, "")}" style="color: #2563eb; text-decoration: none;">📞 ${options.candidatePhone}</a>
                              </td>
                            </tr>` : ""}
                            ${options.candidateEmail ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Email Address:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                                <a href="mailto:${options.candidateEmail}" style="color: #2563eb; text-decoration: none;">✉️ ${options.candidateEmail}</a>
                              </td>
                            </tr>` : ""}
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Submitted On:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.appliedDate || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                            </tr>
                          </table>

                          <!-- Skills -->
                          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #475569;">Key Candidate Skills:</p>
                            <div>${skillsHtml}</div>
                          </div>

                          <!-- Candidate Summary Note -->
                          ${options.summary ? `
                          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #475569;">Candidate Summary / Note:</p>
                            <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; font-style: italic;">"${options.summary}"</p>
                          </div>` : ""}

                          <!-- Screening Questions -->
                          ${screeningHtml ? `
                          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #475569;">Screening Questionnaire Responses:</p>
                            ${screeningHtml}
                          </div>` : ""}

                          <!-- External Portfolio / Social Links -->
                          ${(options.portfolioUrl || options.linkedinUrl || options.githubUrl) ? `
                          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 12px;">
                            <p style="margin: 0 0 6px 0; font-weight: 700; color: #475569;">External Profiles:</p>
                            ${options.portfolioUrl ? `<a href="${options.portfolioUrl}" target="_blank" style="margin-right: 12px; color: #2563eb; text-decoration: none; font-weight: 700;">🌐 Portfolio</a>` : ""}
                            ${options.linkedinUrl ? `<a href="${options.linkedinUrl}" target="_blank" style="margin-right: 12px; color: #0a66c2; text-decoration: none; font-weight: 700;">💼 LinkedIn</a>` : ""}
                            ${options.githubUrl ? `<a href="${options.githubUrl}" target="_blank" style="color: #0f172a; text-decoration: none; font-weight: 700;">🐙 GitHub</a>` : ""}
                          </div>` : ""}

                        </td>
                      </tr>
                    </table>

                    <!-- Review in Dashboard CTA -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px;">
                      <tr>
                        <td align="center">
                          <a href="${portalUrl}/my/employer/jobs" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #4338ca); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79,70,229,0.25);">
                            Review &amp; Schedule Interview in Dashboard &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: options.employerEmail, subject, html, attachments });
}


export interface StoreVerificationApprovalEmailOptions {
  ownerEmail: string;
  ownerName?: string;
  storeName: string;
  storeId: string;
  slug?: string;
  gstin?: string;
  category?: string;
  location?: string;
  verifiedAt?: string;
}

export async function sendStoreVerificationApprovalEmail(
  options: StoreVerificationApprovalEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!options.ownerEmail) return { success: false, error: "Store owner email is required" };
  const ownerDisplayName = options.ownerName?.trim() || "Store Owner";
  const subject = `🎉 Congratulations! Your store "${options.storeName}" has been successfully verified on Omeetso`;
  const portalUrl = (env.CLIENT_USER_URL || "https://omeetso.in").replace(/\/$/, "");

  const headerHtml = renderEmailHeader({
    portalUrl,
    badgeText: "🛡️ Official Store Verified",
    badgeBg: "#f0fdf4",
    badgeBorder: "#bbf7d0",
    badgeColor: "#15803d"
  });

  const footerHtml = renderEmailFooter({
    portalUrl,
    securityNote: "You received this email because your business verification documents were verified and approved by the Omeetso Merchant Moderation team."
  });

  const storePublicUrl = `${portalUrl}/store/${options.slug || options.storeId}`;
  const storeManageUrl = `${portalUrl}/store/manage/${options.slug || options.storeId}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Store Has Been Successfully Verified!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td>
              ${headerHtml}

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 34px 32px 28px 32px;">
                <tr>
                  <td>
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; line-height: 1.3;">
                      Store Verified Successfully! 🎉
                    </h1>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      Dear <strong>${ownerDisplayName}</strong>, Congratulations! 🎉 We’re delighted to inform you that your store <strong>"${options.storeName}"</strong> has been successfully verified on Omeetso.
                    </p>

                    <!-- Trust Announcement Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <div style="font-size: 13px; color: #166534; line-height: 1.5; font-weight: 600;">
                            🛡️ <strong>Verified Store Badge Awarded:</strong> Your store now prominently displays the official blue Verified Store badge across all search results, neighborhood categories, and public storefront pages. Local buyers can now shop with complete trust!
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Store Details Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 140px; font-weight: 600;">Store Name:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${options.storeName}</td>
                            </tr>
                            ${options.category ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Category:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.category}</td>
                            </tr>` : ""}
                            ${options.location ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.location}</td>
                            </tr>` : ""}
                            ${options.gstin ? `
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">GSTIN / Reg No:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-family: monospace; font-weight: 700;">${options.gstin}</td>
                            </tr>` : ""}
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Verified On:</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${options.verifiedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Status:</td>
                              <td style="padding: 6px 0; font-size: 13px;">
                                <span style="display: inline-block; padding: 4px 10px; background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 9999px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">VERIFIED STORE PARTNER</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px;">
                      <tr>
                        <td align="center">
                          <a href="${storePublicUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(22,163,74,0.25); margin-bottom: 12px;">
                            View Your Verified Storefront &rarr;
                          </a>
                          <div style="margin-top: 8px;">
                            <a href="${storeManageUrl}" target="_blank" style="color: #2563eb; font-size: 13px; font-weight: 600; text-decoration: underline;">
                              Open Store Management Dashboard &rarr;
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({ to: options.ownerEmail, subject, html });
}

/**
 * Verifies SMTP connection and authentication, printing the result to console.
 */
export async function verifySmtpConnection(): Promise<boolean> {
  const host = env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(env.SMTP_PORT) || 465;
  const user = env.SMTP_USER || "info@omeetso.in";
  const pass = env.SMTP_PASS || "";

  // Warm up official logo Base64 cache for inline CID embedding
  getOmeetsoLogoBase64().then((b64) => {
    if (b64) {
      console.log(`[Email] ✅ Official Omeetso logo cached for inline CID embedding (${Math.round(b64.length / 1024)} KB Base64)`);
    }
  }).catch(() => {});

  if (!user || !pass) {
    console.warn(`[Email/SMTP] ⚠️ SMTP user or password is not configured in .env`);
    return false;
  }

  return new Promise<boolean>((resolve) => {
    let resolved = false;
    let socket: any = null;

    const finish = (success: boolean, msg: string) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        try {
          socket?.end();
          socket?.destroy();
        } catch {}
        if (success) {
          console.log(`[Email/SMTP] ✅ Connected and authenticated successfully to ${host}:${port} as ${user}`);
        } else {
          console.warn(`[Email/SMTP] ❌ Connection failed on ${host}:${port}: ${msg}`);
        }
        resolve(success);
      }
    };

    const timer = setTimeout(() => {
      finish(false, "Connection timed out after 10s");
    }, 10000);

    try {
      socket = tls.connect(
        {
          host,
          port,
          servername: host,
          rejectUnauthorized: false
        },
        () => {
          // TLS handshake established
        }
      );
    } catch (e: any) {
      return finish(false, `TLS connect error: ${e.message}`);
    }

    socket.setTimeout(10000);
    socket.on("timeout", () => finish(false, "Socket timeout"));
    socket.on("error", (e: any) => finish(false, `Socket error: ${e.message}`));

    let buffer = "";
    let step = 0;

    socket.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const code = parseInt(line.slice(0, 3), 10);
        const isLastLine = line.charAt(3) === " ";

        if (!isLastLine && (line.charAt(3) === "-" || isNaN(code))) {
          continue;
        }

        if (step === 0 && code === 220) {
          step = 1;
          socket.write("EHLO omeetso.in\r\n");
        } else if (step === 1 && code === 250) {
          step = 2;
          socket.write("AUTH LOGIN\r\n");
        } else if (step === 2 && code === 334) {
          step = 3;
          socket.write(Buffer.from(user).toString("base64") + "\r\n");
        } else if (step === 3 && code === 334) {
          step = 4;
          socket.write(Buffer.from(pass).toString("base64") + "\r\n");
        } else if (step === 4) {
          if (code === 235) {
            try { socket.write("QUIT\r\n"); } catch {}
            finish(true, "Authentication successful");
          } else {
            finish(false, `Authentication rejected (${line})`);
          }
        }
      }
    });
  });
}



