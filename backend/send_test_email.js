const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const {
  sendUserWelcomeEmail,
  sendVerificationOtpEmail,
  verifySmtpConnection
} = require("./dist/modules/auth/services/email.service");

const TARGET_EMAIL = process.argv[2] || "akhileshreddy027@gmail.com";

async function main() {
  console.log(`\n==============================================`);
  console.log(`🚀 OMEETSO TEST EMAIL DISPATCHER`);
  console.log(`Recipient: ${TARGET_EMAIL}`);
  console.log(`==============================================\n`);

  console.log(`[1/2] Verifying SMTP credentials & connection...`);
  const isConnected = await verifySmtpConnection();
  if (!isConnected) {
    console.error(`❌ SMTP connection test failed. Check SMTP_USER and SMTP_PASS in backend/.env`);
    process.exit(1);
  }

  console.log(`\n[2/2] Sending branded test email with inline CID logo & updated footer...`);
  const result = await sendUserWelcomeEmail(TARGET_EMAIL, "Akhilesh Reddy");

  if (result.success) {
    console.log(`\n✅ TEST EMAIL SENT SUCCESSFULLY!`);
    console.log(`Message-ID / Response: ${result.messageId}`);
    console.log(`Check your inbox at: ${TARGET_EMAIL}`);
  } else {
    console.error(`\n❌ FAILED TO DELIVER EMAIL:`, result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled execution error:", err);
  process.exit(1);
});
