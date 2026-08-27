import Appointment from "./models/Appointment.js";
import { doctorExists } from "./doctorsStore.js";

export const resetAppointments = async () => {
  await Appointment.deleteMany({});
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * date: 'YYYY-MM-DD', time: 'HH:mm' (24hr) — combined into a real Date object
 * so we can later work out "12 hours before" / "6 hours before" for the reminders.
 * email is required — it's the sole reminder channel. phone is optional and
 * kept only as a contact record, it is not used for reminders anymore.
 */
export const createAppointment = async ({
  doctorName,
  date,
  time,
  patientName,
  phone,
  email,
}) => {
  if (!doctorName || !doctorName.trim()) {
    return { success: false, message: "Doctor name is required" };
  }
  if (!date || !time) {
    return { success: false, message: "Date and time are required" };
  }
  if (!email || !email.trim()) {
    return {
      success: false,
      message: "Email is required for appointment reminders",
    };
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return { success: false, message: "Please provide a valid email address" };
  }

  const appointmentDateTime = new Date(`${date}T${time}:00`);
  if (Number.isNaN(appointmentDateTime.getTime())) {
    return { success: false, message: "Invalid appointment date/time" };
  }
  if (appointmentDateTime.getTime() <= Date.now()) {
    return {
      success: false,
      message: "Appointment date/time must be in the future",
    };
  }

  if (!(await doctorExists(doctorName))) {
    return {
      success: false,
      message: "Selected doctor was not found. Please refresh and try again.",
    };
  }

  try {
    const appointment = await Appointment.create({
      doctorName: doctorName.trim(),
      date,
      time,
      appointmentDateTime,
      patientName,
      phone: phone && phone.trim() ? phone.trim() : undefined,
      email: email.trim().toLowerCase(),
    });

    return { success: true, appointment };
  } catch (error) {
    // 11000 = MongoDB duplicate key error, thrown by the unique
    // (doctorName, date, time) index when someone else just took this slot.
    if (error.code === 11000) {
      return {
        success: false,
        message:
          "This slot has just been booked by someone else. Please choose another time.",
      };
    }
    throw error;
  }
};

export const listAppointments = async () =>
  Appointment.find().sort({ appointmentDateTime: 1 });

// Returns just the booked times for a doctor on a given date — used by the
// frontend to grey out/hide taken slots. Deliberately doesn't expose patient
// names, phones, or emails to this public-facing check.
export const getBookedTimes = async ({ doctorName, date }) => {
  const appointments = await Appointment.find({ doctorName, date }).select(
    "time -_id",
  );
  return appointments.map((appointment) => appointment.time);
};

// Returns two independent lists — appointments due for their 12-hour email
// and appointments due for their 6-hour email. An appointment can appear in
// both at once (e.g. booked less than 6 hours out), or in just one, or
// neither. Each list only includes appointments where that specific
// reminder hasn't already been sent.
export const getPendingReminders = async () => {
  const now = new Date();
  const twelveHoursMs = 12 * 60 * 60 * 1000;
  const sixHoursMs = 6 * 60 * 60 * 1000;

  const pending12h = await Appointment.find({
    reminder12hSent: false,
    appointmentDateTime: {
      $gt: now,
      $lte: new Date(now.getTime() + twelveHoursMs),
    },
  });

  const pending6h = await Appointment.find({
    reminder6hSent: false,
    appointmentDateTime: {
      $gt: now,
      $lte: new Date(now.getTime() + sixHoursMs),
    },
  });

  return { pending12h, pending6h };
};

export const markReminder12hSent = async (id) => {
  await Appointment.findByIdAndUpdate(id, { reminder12hSent: true });
};

export const markReminder6hSent = async (id) => {
  await Appointment.findByIdAndUpdate(id, { reminder6hSent: true });
};
