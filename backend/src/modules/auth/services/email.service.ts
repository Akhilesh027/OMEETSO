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
        try {
          socket?.end();
          socket?.destroy();
        } catch { /* ignore */ }
        resolve(res);
      }
    };

    let socket: any = null;
    const timeoutTimer = setTimeout(() => {
      finish({ success: false, error: `SMTP timeout after 15s connecting to ${host}:${port}` });
    }, 15000);

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

    socket.setTimeout(15000);
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
 * Dispatches a styled Verification OTP email to the recipient
 */
export async function sendVerificationOtpEmail(
  toEmail: string,
  otpCode: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const user = env.SMTP_USER || "info@omeetso.in";
  const pass = env.SMTP_PASS || "Dlns@2021";
  const from = env.SMTP_FROM || "info@omeetso.in";
  const fromName = env.SMTP_FROM_NAME || "Omeetso Verification";

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

  // Resolve MX records dynamically to identify the exact mail provider for omeetso.in
  const hostCandidates: { host: string; port: number }[] = [];

  try {
    const dns = await import("dns");
    const mxRecords = await dns.promises.resolveMx("omeetso.in");
    console.log("[SMTP] Resolved MX records for omeetso.in:", JSON.stringify(mxRecords));

    for (const record of mxRecords.sort((a, b) => a.priority - b.priority)) {
      const exchange = record.exchange.toLowerCase();
      if (exchange.includes("titan")) {
        hostCandidates.push({ host: "smtp.titan.email", port: 465 });
      } else if (exchange.includes("zoho.in")) {
        hostCandidates.push({ host: "smtppro.zoho.in", port: 465 });
      } else if (exchange.includes("zoho")) {
        hostCandidates.push({ host: "smtp.zoho.com", port: 465 });
      } else if (exchange.includes("google") || exchange.includes("gmail")) {
        hostCandidates.push({ host: "smtp.gmail.com", port: 465 });
      } else if (exchange.includes("secureserver")) {
        hostCandidates.push({ host: "smtpout.secureserver.net", port: 465 });
      } else if (exchange.includes("hostinger")) {
        hostCandidates.push({ host: "smtp.hostinger.com", port: 465 });
      } else {
        hostCandidates.push({ host: exchange, port: 465 });
      }
    }
  } catch (err: any) {
    console.warn("[SMTP] MX lookup failed:", err.message);
  }

  // Ensure default candidate hosts are checked
  if (env.SMTP_HOST && !hostCandidates.some((c) => c.host === env.SMTP_HOST)) {
    hostCandidates.unshift({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT) || 465 });
  }
  // Hostinger Business Email uses Titan Email
  if (!hostCandidates.some((c) => c.host === "smtp.titan.email")) {
    hostCandidates.push({ host: "smtp.titan.email", port: 465 });
  }
  if (!hostCandidates.some((c) => c.host === "smtp.hostinger.com")) {
    hostCandidates.push({ host: "smtp.hostinger.com", port: 465 });
  }
  if (!hostCandidates.some((c) => c.host === "mail.omeetso.in")) {
    hostCandidates.push({ host: "mail.omeetso.in", port: 465 });
  }

  let lastError = "No hosts attempted";

  for (const candidate of hostCandidates) {
    for (const authMethod of ["LOGIN", "PLAIN"] as const) {
      console.log(`[SMTP] Attempting to deliver OTP email via ${candidate.host}:${candidate.port} [AUTH ${authMethod}] to ${toEmail}...`);
      const result = await sendViaSmtpSocket(
        candidate.host,
        candidate.port,
        user,
        pass,
        from,
        fromName,
        toEmail,
        subject,
        html,
        authMethod
      );

      if (result.success) {
        console.log(`[SMTP] OTP email successfully sent via ${candidate.host}:${candidate.port} [${authMethod}] to ${toEmail}`);
        return result;
      }

      console.warn(`[SMTP] Delivery via ${candidate.host}:${candidate.port} [${authMethod}] failed: ${result.error}`);
      lastError = result.error || "Delivery failed";
    }
  }

  return { success: false, error: lastError };
}
