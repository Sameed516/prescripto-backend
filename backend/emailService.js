import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

const isConfigured = Boolean(EMAIL_USER && EMAIL_PASS);

// Uses Gmail SMTP. EMAIL_PASS must be a Gmail "App Password", not the normal
// account password (Gmail blocks plain password SMTP logins) — see .env.example.
const transporter =
  isConfigured ?
    nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })
  : null;

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error(
        "[Email] Gmail SMTP login failed at startup — check EMAIL_USER/EMAIL_PASS in .env " +
          "(EMAIL_PASS must be a 16-character Gmail App Password, not your normal password):",
        error.message,
      );
    } else {
      console.log("[Email] Gmail SMTP connection verified — ready to send.");
    }
  });
} else {
  console.log(
    "[Email] EMAIL_USER/EMAIL_PASS not set — reminders will log to console instead of sending.",
  );
}

/**
 * Sends an email. If EMAIL_USER/EMAIL_PASS aren't set in .env yet, it logs
 * the message to the console instead of throwing — mirrors smsService.js so
 * the reminder flow still works end-to-end while developing.
 */
export const sendEmail = async (toEmail, subject, text) => {
  if (!toEmail) {
    return { success: false, message: "No email address provided" };
  }

  if (!isConfigured) {
    console.log(
      `[Email - not sent, not configured] To: ${toEmail} | ${subject} | ${text}`,
    );
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: toEmail,
      subject,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Failed to send to ${toEmail}:`, error.message);
    return { success: false, message: error.message };
  }
};
