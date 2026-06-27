import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    role: "", firstName: "", lastName: "",
    email: "", password: "", confirmPassword: "",
    phone: "", companyName: "", bio: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleRoleSelect = (role) => { set("role", role); setStep(2); };

  const handleSubmit = async () => {
    setError("");
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all required fields."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, password: form.password, role: form.role,
          phone: form.phone || "",
          companyName: form.companyName || "",
          bio: form.bio || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); setLoading(false); return; }
      login(data, data.token);
      navigate("/check-email", { state: { email: form.email } });
    } catch (err) {
      setError("Could not connect to server. Is it running?");
      setLoading(false);
    }
  };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: ".8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--mist)", fontSize: "1rem", padding: 0 }}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  if (step === 1) {
    return (
      <div style={{ maxWidth: "580px", margin: "5rem auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--canal)", marginBottom: ".4rem" }}>Join HuisVerhuur</div>
          <p style={{ color: "var(--mist)", fontSize: ".9rem" }}>Are you looking to rent or list a property?</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
          {[
            { role: "tenant", icon: "🏠", title: "I'm a Tenant", desc: "I'm looking to rent a property in the Netherlands or Germany" },
            { role: "landlord", icon: "🏢", title: "I'm a Landlord", desc: "I want to list my properties and connect with tenants" },
          ].map(r => (
            <div key={r.role} onClick={() => handleRoleSelect(r.role)}
              style={{ background: "var(--white)", border: "2px solid var(--stone)", borderRadius: "10px", padding: "2rem 1.5rem", textAlign: "center", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--canal)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--stone)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "2.5rem", marginBottom: ".8rem" }}>{r.icon}</div>
              <div style={{ fontFamily: "var(--display)", fontSize: "1.2rem", color: "var(--canal)", marginBottom: ".5rem" }}>{r.title}</div>
              <p style={{ fontSize: ".82rem", color: "var(--mist)", lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".85rem", color: "var(--mist)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--tulip)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "520px", margin: "4rem auto", padding: "0 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: ".4rem" }}>{form.role === "landlord" ? "🏢" : "🏠"}</div>
        <div style={{ fontFamily: "var(--display)", fontSize: "1.6rem", color: "var(--canal)", marginBottom: ".3rem" }}>
          {form.role === "landlord" ? "Landlord Account" : "Tenant Account"}
        </div>
        <p style={{ color: "var(--mist)", fontSize: ".85rem" }}>Fill in your details to get started</p>
      </div>

      <div style={{ background: "var(--sand)", borderRadius: "10px", padding: "2rem" }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: ".8rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: ".85rem" }}>
            {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>First name *</label>
            <input placeholder="Jan" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last name *</label>
            <input placeholder="de Vries" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input type="email" placeholder="jan@example.nl" value={form.email} onChange={e => set("email", e.target.value)} />
        </div>

        {/* Phone — optional for both roles */}
        <div className="form-group">
          <label>Phone <span style={{ color: "var(--mist)", fontWeight: 400 }}>(optional)</span></label>
          <input placeholder="+31 6 12345678" value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>

        {/* Landlord-only fields */}
        {form.role === "landlord" && (
          <>
            <div className="form-group">
              <label>Company name <span style={{ color: "var(--mist)", fontWeight: 400 }}>(optional)</span></label>
              <input placeholder="De Vries Vastgoed B.V." value={form.companyName} onChange={e => set("companyName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bio <span style={{ color: "var(--mist)", fontWeight: 400 }}>(optional)</span></label>
              <textarea rows="2" placeholder="Tell tenants about yourself…" value={form.bio} onChange={e => set("bio", e.target.value)} />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Password *</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
              value={form.password} onChange={e => set("password", e.target.value)} style={{ paddingRight: "2.5rem" }} />
            <EyeBtn show={showPass} toggle={() => setShowPass(s => !s)} />
          </div>
        </div>

        <div className="form-group">
          <label>Confirm password *</label>
          <div style={{ position: "relative" }}>
            <input type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
              value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} style={{ paddingRight: "2.5rem" }} />
            <EyeBtn show={showConfirm} toggle={() => setShowConfirm(s => !s)} />
          </div>
        </div>

        <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .7 : 1 }}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <button onClick={() => setStep(1)} style={{ width: "100%", background: "none", border: "none", color: "var(--mist)", fontSize: ".82rem", cursor: "pointer", marginTop: ".8rem" }}>
          ← Change role
        </button>
      </div>
    </div>
  );
}