import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    setError(""); setUnverified(false);
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (!isValidEmail(form.email)) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.unverified) {
          setUnverified(true);
          setError(data.message);
        } else {
          setError(data.message || "Login failed.");
        }
        setLoading(false);
        return;
      }
      login(data, data.token);
      if (data.role === "landlord") navigate("/landlord/dashboard");
      else navigate("/tenant/dashboard");
    } catch {
      setError("Could not connect to server. Is it running?");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "5rem auto", padding: "0 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--canal)", marginBottom: ".4rem" }}>Welcome back</div>
        <p style={{ color: "var(--mist)", fontSize: ".9rem" }}>Sign in to your HuisVerhuur account</p>
      </div>

      <div style={{ background: "var(--sand)", borderRadius: "10px", padding: "2rem" }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: ".8rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: ".85rem" }}>
            {error}
            {unverified && (
              <div style={{ marginTop: ".5rem" }}>
                <span
                  style={{ color: "var(--canal)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => navigate("/check-email", { state: { email: form.email } })}
                >
                  Resend verification email →
                </span>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="jan@example.nl" value={form.email}
            onChange={e => set("email", e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ paddingRight: "2.5rem" }}
            />
            <button type="button" onClick={() => setShowPass(s => !s)}
              style={{ position: "absolute", right: ".8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--mist)", fontSize: "1rem", padding: 0 }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".4rem" }}>
            <label style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: ".78rem", color: "var(--tulip)", fontWeight: 500 }}>
              Forgot password?
              </Link>
          </div>
        <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ paddingRight: "2.5rem" }}
            />
          <button type="button" onClick={() => setShowPass(s => !s)}
            style={{ position: "absolute", right: ".8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--mist)", fontSize: "1rem", padding: 0 }}>
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

        <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .7 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: ".85rem", color: "var(--mist)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--tulip)", fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}