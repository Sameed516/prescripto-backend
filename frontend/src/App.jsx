import { useState } from "react";
import { useNavigate } from "react-router-dom";

const App = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(
    "Welcome back! Please sign in to continue.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isLogin ? "login" : "signup",
          ...formData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setMessage(result.message);
      } else if (isLogin) {
        setMessage(`Welcome back, ${result.user.name}!`);
        navigate("/home");
      } else {
        setMessage(
          `Account created for ${result.user.name}. You can now log in.`,
        );
        setIsLogin(true);
        setFormData({ name: "", email: "", password: "" });
      }
    } catch (error) {
      setMessage("Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Prescripto</div>
        <p className="auth-subtitle">Book trusted care in minutes.</p>

        <div
          className="auth-toggle"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            className={isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(true);
              setMessage("Welcome back! Please sign in to continue.");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={isLogin ? "" : "active"}
            onClick={() => {
              setIsLogin(false);
              setMessage("Create your account to get started.");
            }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              <span>Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ayesha Khan"
                required
              />
            </label>
          )}

          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>

          <button
            className="btn primary auth-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ?
              "Working..."
            : isLogin ?
              "Log In"
            : "Create Account"}
          </button>
        </form>

        <p className="auth-message">{message}</p>
      </div>
    </div>
  );
};

export default App;
