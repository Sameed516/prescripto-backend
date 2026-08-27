import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import HomePage from "./HomePage.jsx";
import AppointmentPage from "./AppointmentPage.jsx";
import RegisterDoctorPage from "./RegisterDoctorPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/register-doctor" element={<RegisterDoctorPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
