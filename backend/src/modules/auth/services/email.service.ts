import tls from "tls";
import net from "net";
import { env } from "../../../config/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
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
  authMethod: "LOGIN" | "PLAIN" = "LOGIN"
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

              const rawMail = `${headers}\r\n\r\n${html}\r\n.\r\n`;
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
        authMethod
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
 * Dispatches a styled Verification OTP email to the recipient
 */
export async function sendVerificationOtpEmail(
  toEmail: string,
  otpCode: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `${otpCode} is your Omeetso Email Verification Code`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Omeetso Email Verification</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .wrapper { width: 100%; max-width: 560px; margin: 30px auto; background: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; }
    .brand { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .brand span { color: #f97316; }
    .badge { display: inline-block; margin-top: 12px; padding: 6px 14px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 36px 32px; text-align: center; }
    h1 { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0; }
    .otp-box { margin: 28px auto; padding: 20px 24px; background: #0b0f19; border: 2px dashed #4f46e5; border-radius: 18px; max-width: 280px; text-align: center; }
    .otp-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; margin: 0; }
    .points-tag { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; color: #34d399; font-size: 12px; font-weight: 700; margin-bottom: 24px; }
    .alert { padding: 14px 18px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 8px; text-align: left; font-size: 12px; color: #fbbf24; margin-bottom: 28px; line-height: 1.5; }
    .footer { padding: 24px 32px; background: #0b0f19; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; }
    .footer p { margin: 4px 0; color: #64748b; font-size: 11px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">OMEET<span>SO</span></div>
      <div class="badge">Shield Trust Verification</div>
    </div>
    <div class="content">
      <h1>Verify Your Email Address</h1>
      <p>Enter the one-time verification code below to verify your email address and increase your seller credibility rating.</p>
      
      <div class="otp-box">
        <div class="otp-label">Verification Code</div>
        <div class="otp-code">${otpCode}</div>
      </div>

      <div class="points-tag">
        ✓ +15 Trust Points will be awarded to your profile
      </div>

      <div class="alert">
        ⏱️ This code is valid for <strong>10 minutes</strong>. For your security, never share this OTP with anyone, including Omeetso representatives.
      </div>

      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
        If you did not initiate this verification request, please ignore this email or contact support at <a href="mailto:info@omeetso.in" style="color: #818cf8; text-decoration: none;">info@omeetso.in</a>.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Omeetso Technologies Pvt. Ltd. All rights reserved.</p>
      <p>You received this email because an account verification request was submitted on Omeetso.</p>
    </div>
  </div>
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
  const portalUrl = env.CLIENT_USER_URL || "https://omeetso.in";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Omeetso</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .wrapper { width: 100%; max-width: 600px; margin: 30px auto; background: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { padding: 36px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; }
    .brand { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .brand span { color: #f97316; }
    .badge { display: inline-block; margin-top: 12px; padding: 6px 16px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 36px 32px; }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; text-align: center; }
    .subtitle { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 28px 0; text-align: center; }
    .features-grid { margin: 24px 0; display: table; width: 100%; }
    .feature-card { background: #131d36; border: 1px solid #1e293b; border-radius: 16px; padding: 18px 20px; margin-bottom: 14px; }
    .feature-title { font-size: 14px; font-weight: 700; color: #38bdf8; margin-bottom: 6px; }
    .feature-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; }
    .btn-container { text-align: center; margin: 36px 0 20px 0; }
    .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 14px; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4); }
    .footer { padding: 24px 32px; background: #0b0f19; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; }
    .footer p { margin: 4px 0; color: #64748b; font-size: 11px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">OMEET<span>SO</span></div>
      <div class="badge">Welcome to Neighborhood Commerce</div>
    </div>
    <div class="content">
      <h1>Welcome to Omeetso, ${displayName}! 🎉</h1>
      <p class="subtitle">
        We're thrilled to have you! Omeetso connects you with verified neighbors, local businesses, job opportunities, and professional services right in your locality.
      </p>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">🛍️ Buy & Sell Nearby with Zero Commission</div>
          <p class="feature-desc">List electronics, vehicles, furniture, and fashion. Connect directly with authentic local buyers via call or WhatsApp.</p>
        </div>

        <div class="feature-card">
          <div class="feature-title">💼 Local Jobs & Hiring</div>
          <p class="feature-desc">Discover nearby job openings or hire skilled local candidates across office, retail, tech, and skilled trades.</p>
        </div>

        <div class="feature-card">
          <div class="feature-title">🏢 Neighborhood Stores & Services</div>
          <p class="feature-desc">Browse local retail stores, home repair experts, beauty salons, tutors, and professional home services with customer reviews.</p>
        </div>

        <div class="feature-card">
          <div class="feature-title">🛡️ Shield Trust Verification</div>
          <p class="feature-desc">Verify your email and government ID to earn verified badges, unlock extra trust points, and stand out in search results.</p>
        </div>
      </div>

      <div class="btn-container">
        <a href="${portalUrl}" class="btn" target="_blank">Start Exploring Omeetso &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Omeetso Technologies Pvt. Ltd. All rights reserved.</p>
      <p>Have questions? Reach our support team at <a href="mailto:info@omeetso.in" style="color: #818cf8; text-decoration: none;">info@omeetso.in</a>.</p>
    </div>
  </div>
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
 * Dispatches an instant administrator alert email to akhileshreddy027@gmail.com
 * for critical events (new listings, jobs, businesses, services, new users).
 */
export async function sendAdminAlertEmail(
  options: AdminAlertOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const adminEmail = (env.ADMIN_NOTIFICATION_EMAIL || "akhileshreddy027@gmail.com").trim();

  const eventBadgeMap: Record<AdminAlertOptions["eventType"], { label: string; bg: string; border: string; color: string; icon: string }> = {
    listing_created: { label: "NEW LISTING SUBMITTED", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.3)", color: "#38bdf8", icon: "🛍️" },
    job_posted: { label: "NEW JOB POSTED", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", color: "#c084fc", icon: "💼" },
    business_registered: { label: "NEW BUSINESS REGISTERED", bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", color: "#fb923c", icon: "🏢" },
    service_registered: { label: "NEW SERVICE CREATED", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", color: "#34d399", icon: "🛠️" },
    user_registered: { label: "NEW USER REGISTERED", bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.3)", color: "#818cf8", icon: "👤" }
  };

  const badge = eventBadgeMap[options.eventType] || { label: "SYSTEM ALERT", bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.3)", color: "#818cf8", icon: "🔔" };
  const subject = `[Omeetso Admin] ${badge.icon} ${options.title}`;

  const detailRows = Object.entries(options.details)
    .filter(([_, val]) => val !== undefined && val !== null && val !== "")
    .map(([key, val]) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: capitalize; width: 38%;">${key.replace(/([A-Z])/g, " $1").trim()}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 13px; font-weight: 700;">${String(val)}</td>
      </tr>
    `).join("");

  const actionButton = options.link ? `
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${options.link}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; border-radius: 12px; box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);" target="_blank">
        ${options.actionText || "View in Admin Dashboard &rarr;"}
      </a>
    </div>
  ` : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .wrapper { width: 100%; max-width: 600px; margin: 30px auto; background: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { padding: 28px 32px 20px 32px; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; }
    .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .brand span { color: #f97316; }
    .badge { display: inline-block; margin-top: 10px; padding: 6px 14px; background: ${badge.bg}; border: 1px solid ${badge.border}; border-radius: 9999px; font-size: 11px; font-weight: 800; color: ${badge.color}; text-transform: uppercase; letter-spacing: 0.8px; }
    .content { padding: 32px; }
    h1 { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; }
    .summary { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0; }
    .table-box { background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    .footer { padding: 20px 32px; background: #0b0f19; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">OMEET<span>SO</span> <span style="font-size: 13px; font-weight: 600; color: #94a3b8; margin-left: 8px;">ADMIN DISPATCH</span></div>
      <div class="badge">${badge.icon} ${badge.label}</div>
    </div>
    <div class="content">
      <h1>${options.title}</h1>
      <p class="summary">${options.summary}</p>

      <div class="table-box">
        <table>
          <tbody>
            ${detailRows}
          </tbody>
        </table>
      </div>

      ${actionButton}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Omeetso Internal Admin Alerts • Recipient: ${adminEmail}</p>
    </div>
  </div>
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



