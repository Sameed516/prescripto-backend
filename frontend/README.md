# Prescripto

A full-stack doctor appointment booking app built on the MERN stack (MongoDB, Express, React, Node.js). Patients can sign up, browse doctors, and book appointments; the backend sends automated SMS and email reminders ahead of each appointment.

## Project structure

```
prescripto/
├── backend/     Express + MongoDB API (auth, doctors, appointments, reminders)
└── frontend/    React + Vite client
```

## Features

- User signup/login with hashed passwords (bcrypt)
- Doctor registration with availability windows
- Appointment booking with double-booking and past-date protection
- Automated SMS (Twilio) and email (Nodemailer/Gmail) reminders, sent 12 hours and 6 hours before each appointment
- Backend test suite covering auth, doctors, and appointments (18 tests, run against an in-memory MongoDB)

## Prerequisites

- [Node.js](https://nodejs.org) (v18 or later recommended)
- A MongoDB database — either [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

## Setup

Clone the repo, then set up each part separately.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

- `MONGODB_URI` — your local or Atlas connection string, e.g. `mongodb://localhost:27017/prescripto`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` — optional, from the [Twilio console](https://console.twilio.com). Leave blank to just log SMS to the console during development.
- `EMAIL_USER` / `EMAIL_PASS` — optional, a Gmail address and a [Gmail App Password](https://myaccount.google.com/apppasswords) (not your normal password). Leave blank to just log emails to the console during development.

Start the backend:

```bash
npm run dev
```

It runs on `http://localhost:3001`. You should see `MongoDB connected` and `Auth server running at http://localhost:3001` in the terminal.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open it in your browser — API calls to `/api/*` are automatically proxied to the backend on port 3001, so no extra CORS setup is needed.

## Running tests

```bash
cd backend
npm test
```

Uses `mongodb-memory-server` to spin up a throwaway, in-memory MongoDB just for the test run — it never touches your real database. The first run downloads a small MongoDB binary, so it needs normal internet access.

## API overview

| Method | Route                | Description                                                              |
|--------|-----------------------|----------------------------------------------------------------------|
| POST   | `/api/auth`           | `{ mode: 'signup', name, email, password }` or `{ mode: 'login', email, password }` |
| POST   | `/api/doctors`        | Register a doctor with name and availability                            |
| GET    | `/api/doctors`        | List registered doctors                                                 |
| POST   | `/api/appointments`   | `{ doctorName, date: 'YYYY-MM-DD', time: 'HH:mm', patientName, phone, email? }` |
| GET    | `/api/appointments`   | List appointments                                                       |
| POST   | `/api/reset`          | Dev-only, wipes users (disabled when `NODE_ENV=production`)             |

See `backend/README.md` for more implementation detail.

## Tech stack

**Backend:** Node.js, Express, MongoDB/Mongoose, bcrypt, Twilio, Nodemailer, node-cron
**Frontend:** React, Vite, Tailwind CSS
