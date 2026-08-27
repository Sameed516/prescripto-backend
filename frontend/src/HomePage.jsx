import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="clinic-app">
      <header className="hero">
        <nav className="nav">
          <div className="brand">Prescripto Dental</div>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link className="btn primary nav-cta" to="/register-doctor">
              + Add Doctor
            </Link>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Gentle care • Modern dentistry</p>
            <h1>Your healthiest smile starts here.</h1>
            <p className="hero-text">
              From preventive care to cosmetic treatments, our team creates
              calm, confident visits with premium comfort and expert attention.
            </p>
            <div className="hero-actions">
              <Link className="btn primary hero-cta" to="/appointment">
                Book an Appointment
              </Link>
              <a className="btn secondary hero-cta" href="#about">
                Why Choose Us
              </a>
            </div>
          </div>

          <div className="hero-highlight">
            <h3>Care that feels effortless</h3>
            <ul>
              <li>Flexible scheduling for busy days</li>
              <li>Comfort-first treatment rooms</li>
              <li>Friendly specialists you can trust</li>
            </ul>
          </div>
        </div>
      </header>

      <main>
        <section id="services" className="section">
          <div className="section-heading">
            <p className="section-tag">Our spaces</p>
            <h2>Where comfort meets precision</h2>
            <p>
              Every detail is designed to make your visit feel calm, welcoming,
              and reassuring.
            </p>
          </div>

          <div className="image-grid">
            <article className="image-card">
              <img src="/clinic.jpg" alt="Dental clinic interior" />
              <div className="image-card-body">
                <h3>Comfort-first treatment rooms</h3>
                <p>
                  Modern interiors, soothing lighting, and thoughtful design
                  make every appointment feel effortless.
                </p>
              </div>
            </article>

            <article className="image-card">
              <img src="/doctor.jpg" alt="Dentist with patient" />
              <div className="image-card-body">
                <h3>Confident smiles, gently delivered</h3>
                <p>
                  Beautiful results with expert care, clear guidance, and a
                  reassuring atmosphere from start to finish.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="about-panel">
            <p className="section-tag">Why patients choose us</p>
            <h2>Trusted dental care with a warm, personal touch</h2>
            <p>
              Our clinic combines advanced technology with a genuinely friendly
              atmosphere so every patient feels welcomed, informed, and cared
              for.
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <h3>Prescripto Dental Clinic</h3>
        <p>Airline society • Open Mon–Sat • 03019617789</p>
      </footer>
    </div>
  );
};

export default HomePage;
