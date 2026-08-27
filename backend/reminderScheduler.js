import cron from "node-cron";
import {
  getPendingReminders,
  markReminder12hSent,
  markReminder6hSent,
} from "./appointmentsStore.js";
import { sendEmail } from "./emailService.js";

const buildReminderText = (appointment, hoursLabel) =>
  `Reminder: Hi ${appointment.patientName || "there"}, you have an appointment with ${appointment.doctorName} ` +
  `on ${appointment.date} at ${appointment.time} (in about ${hoursLabel}). - Prescripto`;

/**
 * Runs every minute. Sends two independent email reminders per appointment:
 * one when it enters the 12-hour-before window, another when it enters the
 * 6-hour-before window. Each is tracked and sent exactly once.
 */
export const startReminderScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const { pending12h, pending6h } = await getPendingReminders();

      for (const appointment of pending12h) {
        const message = buildReminderText(appointment, "12 hours");
        const result = await sendEmail(
          appointment.email,
          "Appointment Reminder — 12 hours to go",
          message,
        );

        if (result.success) {
          await markReminder12hSent(appointment._id);
          console.log(
            `12h reminder sent for appointment ${appointment._id} (${appointment.email})`,
          );
        } else {
          console.error(
            `12h reminder failed for appointment ${appointment._id}: ${result.message}`,
          );
        }
      }

      for (const appointment of pending6h) {
        const message = buildReminderText(appointment, "6 hours");
        const result = await sendEmail(
          appointment.email,
          "Appointment Reminder — 6 hours to go",
          message,
        );

        if (result.success) {
          await markReminder6hSent(appointment._id);
          console.log(
            `6h reminder sent for appointment ${appointment._id} (${appointment.email})`,
          );
        } else {
          console.error(
            `6h reminder failed for appointment ${appointment._id}: ${result.message}`,
          );
        }
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error.message);
    }
  });

  console.log(
    "Appointment reminder scheduler started (checks every minute for 12h and 6h email reminders).",
  );
};
