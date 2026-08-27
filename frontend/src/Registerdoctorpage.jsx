import { useState } from "react";
import { Link } from "react-router-dom";

const RegisterDoctorPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    fee: "",
    image: "",
    start: "09:00",
    end: "17:00",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          fee: formData.fee,
          image: formData.image,
          availability: { start: formData.start, end: formData.end },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setMessage(result.message || "Could not register doctor.");
        return;
      }

      setMessage(`${result.doctor.name} was added and is now bookable.`);
      setFormData({
        name: "",
        role: "",
        fee: "",
        image: "",
        start: "09:00",
        end: "17:00",
      });
    } catch (error) {
      setMessage("Unable to reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Register Doctor</div>
        <p className="auth-subtitle">
          Add a new doctor and their available hours.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Dr. Ayesha Malik"
              required
            />
          </label>

          <label>
            <span>Role / Specialty</span>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Orthodontist"
              required
            />
          </label>

          <label>
            <span>Consultation Fee (Rs.)</span>
            <input
              type="number"
              name="fee"
              min="0"
              value={formData.fee}
              onChange={handleChange}
              placeholder="1500"
              required
            />
          </label>

          <label>
            <span>Image URL</span>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="/doctor.jpg"
            />
          </label>

          <label>
            <span>Available From</span>
            <input
              type="time"
              name="start"
              value={formData.start}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Available Until</span>
            <input
              type="time"
              name="end"
              value={formData.end}
              onChange={handleChange}
              required
            />
          </label>

          <button
            className="btn primary auth-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Add Doctor"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <Link className="auth-link" to="/appointment">
          Go to Booking Page →
        </Link>
      </div>
    </div>
  );
};

export default RegisterDoctorPage;
