// Quick standalone test: sends one email using your .env credentials,
// completely bypassing the database and the appointment/reminder flow.
// Run with: node testEmail.js your-address@example.com

import "dotenv/config";
import { sendEmail } from "./emailService.js";

const toEmail = process.argv[2];

if (!toEmail) {
  console.error("Usage: node testEmail.js <email-to-send-to>");
  process.exit(1);
}

const result = await sendEmail(
  toEmail,
  "Prescripto — Test Email",
  "If you are reading this, your Gmail SMTP setup is working correctly.",
);

console.log(result);
process.exit(result.success ? 0 : 1);
