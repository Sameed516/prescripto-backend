import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorName: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    time: { type: String, required: true }, // 'HH:mm' (24hr)
    appointmentDateTime: { type: Date, required: true }, // date+time combined, used for the reminder window
    patientName: { type: String, trim: true },
    phone: { type: String, trim: true }, // optional now — no longer used for reminders
    email: { type: String, required: true, trim: true, lowercase: true }, // required — sole reminder channel
    reminder12hSent: { type: Boolean, default: false },
    reminder6hSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Speeds up the "which reminders are due" queries the scheduler runs every minute.
appointmentSchema.index({
  reminder12hSent: 1,
  reminder6hSent: 1,
  appointmentDateTime: 1,
});

// Hard guarantee against double-booking: MongoDB itself rejects a second
// appointment for the same doctor/date/time, even if two requests land at
// the exact same moment (a frontend-only check can't guarantee this).
appointmentSchema.index({ doctorName: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);
