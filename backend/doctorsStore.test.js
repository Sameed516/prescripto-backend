import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createDoctor, listDoctors, resetDoctors } from "./doctorsStore.js";

let mongod;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test("registers a doctor with valid availability", async () => {
  await resetDoctors();

  const result = await createDoctor({
    name: "Dr. Ayesha Malik",
    role: "Orthodontist",
    fee: 2000,
    image: "/doctor.jpg",
    availability: { start: "09:00", end: "17:00" },
  });

  assert.equal(result.success, true);
  const doctors = await listDoctors();
  assert.equal(doctors.length, 1);
});

test("rejects a start time that is not before the end time", async () => {
  await resetDoctors();

  const result = await createDoctor({
    name: "Dr. Bad Hours",
    role: "Dentist",
    fee: 1000,
    availability: { start: "18:00", end: "09:00" },
  });

  assert.equal(result.success, false);
});

test("rejects a malformed time string", async () => {
  await resetDoctors();

  const result = await createDoctor({
    name: "Dr. Bad Format",
    role: "Dentist",
    fee: 1000,
    availability: { start: "9am", end: "5pm" },
  });

  assert.equal(result.success, false);
});

test("rejects a duplicate doctor name", async () => {
  await resetDoctors();
  await createDoctor({
    name: "Dr. Ali Hassan",
    role: "Dentist",
    fee: 1500,
    availability: { start: "09:00", end: "17:00" },
  });

  const second = await createDoctor({
    name: "Dr. Ali Hassan",
    role: "Dentist",
    fee: 1500,
    availability: { start: "10:00", end: "18:00" },
  });

  assert.equal(second.success, false);
});
