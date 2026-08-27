import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { createUser, authenticateUser, resetUsers } from "./authStore.js";
import {
  createAppointment,
  listAppointments,
  getBookedTimes,
} from "./appointmentsStore.js";
import { createDoctor, listDoctors } from "./doctorsStore.js";
import { startReminderScheduler } from "./reminderScheduler.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Connect to DB per request for serverless execution
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ success: false, message: "Database connection failure" });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("Prescripto Backend API is live!");
});

app.post("/api/auth", async (req, res) => {
  const { mode, name, email, password } = req.body;

  if (mode === "signup") {
    const result = await createUser({ name, email, password });
    return res.status(result.success ? 200 : 400).json(result);
  }

  if (mode === "login") {
    const result = await authenticateUser({ email, password });
    return res.status(result.success ? 200 : 401).json(result);
  }

  return res
    .status(400)
    .json({ success: false, message: "Invalid request mode" });
});

if (process.env.NODE_ENV !== "production") {
  app.post("/api/reset", async (_req, res) => {
    await resetUsers();
    res.json({ success: true, message: "User store reset" });
  });
}

app.post("/api/doctors", async (req, res) => {
  const { name, role, fee, image, availability } = req.body;
  const result = await createDoctor({ name, role, fee, image, availability });

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

app.get("/api/doctors", async (_req, res) => {
  const doctors = await listDoctors();
  res.json({ success: true, doctors });
});

app.post("/api/appointments", async (req, res) => {
  const { doctorName, date, time, patientName, phone, email } = req.body;

  const result = await createAppointment({
    doctorName,
    date,
    time,
    patientName,
    phone,
    email,
  });

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

app.get("/api/appointments", async (_req, res) => {
  const appointments = await listAppointments();
  res.json({ success: true, appointments });
});

app.get("/api/appointments/availability", async (req, res) => {
  const { doctorName, date } = req.query;

  if (!doctorName || !date) {
    return res
      .status(400)
      .json({ success: false, message: "doctorName and date are required" });
  }

  const bookedTimes = await getBookedTimes({ doctorName, date });
  res.json({ success: true, bookedTimes });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Auth server running at http://localhost:${port}`);
    startReminderScheduler();
  });
}

export default app;