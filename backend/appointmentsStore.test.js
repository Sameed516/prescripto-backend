import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  createAppointment,
  getPendingReminders,
  markReminder12hSent,
  markReminder6hSent,
  resetAppointments,
} from "./appointmentsStore.js";
import { createDoctor, resetDoctors } from "./doctorsStore.js";

let mongod;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const seedDoctor = async () => {
  await resetDoctors();
  await createDoctor({
    name: "Dr. Khan",
    role: "Dentist",
    fee: 1500,
    availability: { start: "09:00", end: "17:00" },
  });
};

// Helper: build { date, time } strings N hours from now, in local time.
const dateTimeInHours = (hours) => {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
};

test("appointment within the 12-hour window shows up as a pending 12h reminder", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(9);

  const created = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    patientName: "Bilal",
    email: "bilal@example.com",
  });
  assert.equal(created.success, true);

  const { pending12h, pending6h } = await getPendingReminders();
  assert.equal(pending12h.length, 1);
  assert.equal(pending6h.length, 0); // 9 hours out is inside the 12h window but outside the 6h window
});

test("appointment within the 6-hour window shows up as pending for both reminders", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(3);

  await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    patientName: "Sara",
    email: "sara@example.com",
  });

  const { pending12h, pending6h } = await getPendingReminders();
  assert.equal(pending12h.length, 1);
  assert.equal(pending6h.length, 1);
});

test("appointment further than 12 hours away is not yet due for either reminder", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(20);

  await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    patientName: "Ahmed",
    email: "ahmed@example.com",
  });

  const { pending12h, pending6h } = await getPendingReminders();
  assert.equal(pending12h.length, 0);
  assert.equal(pending6h.length, 0);
});

test("marking the 12h reminder sent removes it from pending12h but leaves pending6h untouched", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(9);

  const created = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    patientName: "Hina",
    email: "hina@example.com",
  });

  await markReminder12hSent(created.appointment._id);

  const { pending12h, pending6h } = await getPendingReminders();
  assert.equal(pending12h.length, 0);
  assert.equal(pending6h.length, 0); // still outside the 6h window regardless
});

test("marking the 6h reminder sent does not affect the 12h reminder state", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(3);

  const created = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    patientName: "Zara",
    email: "zara@example.com",
  });

  await markReminder6hSent(created.appointment._id);

  const { pending12h, pending6h } = await getPendingReminders();
  assert.equal(pending12h.length, 1); // 12h reminder is independent, still pending
  assert.equal(pending6h.length, 0);
});

test("email is required", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(6);

  const result = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
  });
  assert.equal(result.success, false);
});

test("an invalid email format is rejected", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(6);

  const result = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    email: "not-an-email",
  });
  assert.equal(result.success, false);
});

test("phone is optional now", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(6);

  const result = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    email: "noPhone@example.com",
  });
  assert.equal(result.success, true);
});

test("booking the same doctor/date/time twice is rejected", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(6);

  const first = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    patientName: "Bilal",
    email: "bilal@example.com",
  });
  assert.equal(first.success, true);

  const second = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    patientName: "Someone Else",
    email: "other@example.com",
  });
  assert.equal(second.success, false);
  assert.match(second.message, /just been booked/);
});

test("appointment date/time in the past is rejected", async () => {
  await resetAppointments();
  await seedDoctor();
  const { date, time } = dateTimeInHours(-2);

  const result = await createAppointment({
    doctorName: "Dr. Khan",
    date,
    time,
    email: "past@example.com",
  });
  assert.equal(result.success, false);
});
