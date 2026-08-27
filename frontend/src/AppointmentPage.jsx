import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const SLOT_INTERVAL_MINUTES = 15;

const todayStr = () => new Date().toISOString().slice(0, 10);

// Generates 'HH:mm' slots every SLOT_INTERVAL_MINUTES between start (inclusive)
// and end (exclusive) — e.g. 15:00–20:00 at 15 min -> 15:00, 15:15, ... 19:45.
const generateTimeSlots = (start, end, intervalMinutes) => {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  const slots = [];
  let cursor = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (cursor < endMinutes) {
    const h = String(Math.floor(cursor / 60)).padStart(2, "0");
    const m = String(cursor % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    cursor += intervalMinutes;
  }

  return slots;
};

const isPastSlot = (date, time) => {
  if (date !== todayStr()) return false;
  const [h, m] = time.split(":").map(Number);
  const slotTime = new Date();
  slotTime.setHours(h, m, 0, 0);
  return slotTime.getTime() <= Date.now();
};

const AppointmentPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [confirmed, setConfirmed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookedTimes, setBookedTimes] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Doctors now come from the database (added via the Register Doctor page)
  // instead of a hardcoded list.
  useEffect(() => {
    let cancelled = false;

    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        const result = await response.json();
        if (!cancelled && result.success) {
          setDoctors(result.doctors);
          if (result.doctors.length > 0) {
            setSelectedDoctorId(result.doctors[0]._id);
          }
        }
      } catch (error) {
        // leave doctors empty; the UI below handles this case
      } finally {
        if (!cancelled) setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDoctor =
    doctors.find((doctor) => doctor._id === selectedDoctorId) || null;

  // Every time the doctor or date changes, ask the backend which times are
  // already taken for that doctor/date, so we don't offer a slot someone
  // else already booked.
  useEffect(() => {
    if (!selectedDoctor) {
      setBookedTimes([]);
      return;
    }

    let cancelled = false;
    setIsLoadingSlots(true);

    const fetchBookedTimes = async () => {
      try {
        const params = new URLSearchParams({
          doctorName: selectedDoctor.name,
          date: selectedDate,
        });
        const response = await fetch(
          `/api/appointments/availability?${params.toString()}`,
        );
        const result = await response.json();
        if (!cancelled) {
          setBookedTimes(result.success ? result.bookedTimes : []);
        }
      } catch (error) {
        if (!cancelled) setBookedTimes([]);
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    };

    fetchBookedTimes();
    return () => {
      cancelled = true;
    };
  }, [selectedDoctor, selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    const allSlots = generateTimeSlots(
      selectedDoctor.availability.start,
      selectedDoctor.availability.end,
      SLOT_INTERVAL_MINUTES,
    );
    return allSlots.filter(
      (time) => !bookedTimes.includes(time) && !isPastSlot(selectedDate, time),
    );
  }, [selectedDoctor, bookedTimes, selectedDate]);

  // Keep selectedTime valid as the available list changes (doctor/date
  // switched, or someone just took the slot we had selected).
  useEffect(() => {
    if (availableSlots.length === 0) {
      setSelectedTime("");
    } else if (!availableSlots.includes(selectedTime)) {
      setSelectedTime(availableSlots[0]);
    }
  }, [availableSlots]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDoctorChange = (event) => {
    setSelectedDoctorId(event.target.value);
    setConfirmed(false);
  };

  const handleSlotSelect = (time) => {
    setSelectedTime(time);
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    setBookingError("");

    if (!selectedDoctor) {
      setBookingError("Please select a doctor.");
      return;
    }
    if (!email.trim()) {
      setBookingError(
        "Please enter an email address so we can send your appointment reminders.",
      );
      return;
    }
    if (!selectedTime) {
      setBookingError("Please select an available time slot.");
      return;
    }

    setIsBooking(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName: selectedDoctor.name,
          date: selectedDate,
          time: selectedTime,
          patientName,
          email,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setBookingError(result.message || "Could not book appointment.");
        // Someone may have just taken this slot — refresh the booked list
        // so the grid reflects reality immediately.
        setBookedTimes((prev) =>
          prev.includes(selectedTime) ? prev : [...prev, selectedTime],
        );
        return;
      }

      setBookedTimes((prev) => [...prev, selectedTime]);
      setConfirmed(true);
    } catch (error) {
      setBookingError("Unable to reach the appointment service.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoadingDoctors) {
    return (
      <div className="appointment-page">
        <div className="appointment-card">
          <p className="auth-message">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="appointment-page">
        <Link className="back-link" to="/">
          ← Back to Home
        </Link>
        <div className="appointment-card">
          <h1>No doctors available yet</h1>
          <p className="auth-message">
            Add a doctor first to start taking bookings.
          </p>
          <Link className="btn primary appointment-btn" to="/register-doctor">
            Register a Doctor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-page">
      <Link className="back-link" to="/">
        ← Back to Home
      </Link>

      <div className={`appointment-card ${confirmed ? "confirmed" : ""}`}>
        <img src={selectedDoctor.image} alt="Doctor portrait" />
        <h1>{selectedDoctor.name}</h1>
        <p className="doctor-role">{selectedDoctor.role}</p>

        <label className="field">
          <span>Select Doctor</span>
          <select value={selectedDoctorId} onChange={handleDoctorChange}>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </label>

        <div className="fee-box">
          <span>Consultation Fee</span>
          <strong>Rs. {selectedDoctor.fee}</strong>
        </div>

        <label className="field">
          <span>Date</span>
          <input
            type="date"
            value={selectedDate}
            min={todayStr()}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setConfirmed(false);
            }}
          />
        </label>

        <div className="slot-section">
          <h3>Available Slots</h3>
          <div className="slot-grid">
            {isLoadingSlots && (
              <p className="auth-message">Checking availability...</p>
            )}

            {!isLoadingSlots && availableSlots.length === 0 && (
              <p className="auth-message">
                No slots left for this date — try another day.
              </p>
            )}

            {!isLoadingSlots &&
              availableSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`slot-pill ${time === selectedTime ? "active" : ""}`}
                  onClick={() => handleSlotSelect(time)}
                >
                  {time}
                </button>
              ))}
          </div>
        </div>

        <label className="field">
          <span>Your Name</span>
          <input
            type="text"
            value={patientName}
            onChange={(event) => setPatientName(event.target.value)}
            placeholder="Ayesha Khan"
          />
        </label>

        <label className="field">
          <span>Email (for appointment reminders)</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        {bookingError && <p className="auth-message">{bookingError}</p>}

        {!confirmed ?
          <button
            className="btn primary appointment-btn"
            type="button"
            onClick={handleConfirm}
            disabled={isBooking || !selectedTime}
          >
            {isBooking ? "Booking..." : "Confirm Appointment"}
          </button>
        : <div className="success-state">
            <div className="success-check">✓</div>
            <h3>Appointment Confirmed!</h3>
            <p>
              Your booking is set with {selectedDoctor.name} on {selectedDate}{" "}
              at {selectedTime}. We'll send email reminders to {email} 12 hours
              and again 6 hours before your appointment.
            </p>
          </div>
        }
      </div>
    </div>
  );
};

export default AppointmentPage;
