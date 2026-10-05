import tls from "tls";
import net from "net";
import fs from "fs";
import path from "path";
import { env } from "../../../config/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
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
  inlineLogoBase64?: string
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
              if (inlineLogoBase64 && html.includes("cid:omeetso-logo")) {
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
                  wrapBase64(inlineLogoBase64),
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
        logoBase64
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

const OMEETSO_LOGO_URL = "https://omeetso.in/logo.png";

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
  const adminEmail = (env.ADMIN_NOTIFICATION_EMAIL || "akhileshreddy027@gmail.com").trim();
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



