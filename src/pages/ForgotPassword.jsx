import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    if (!email) { setMessage("Please enter your email address."); setStatus("error"); return; }
    if (!isValidEmail(email)) { setMessage("Please enter a valid email address."); setStatus("error"); return; }

    setLoading(true);
    try {
      const res = await fetch("https://huisverhuur-production.up.railway.app/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      setStatus(res.ok ? "success" : "error");
    } catch {
      setMessage("Could not connect to server. Is it running?");
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "5rem auto", padding: "0 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: ".6rem" }}>🔑</div>
        <div style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--canal)", marginBottom: ".4rem" }}>
          Forgot Password?
        </div>
        <p style={{ color: "var(--mist)", fontSize: ".9rem", lineHeight: 1.6 }}>
          No worries! Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div style={{ background: "var(--sand)", borderRadius: "10px", padding: "2rem" }}>
        {status === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📧</div>
            <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: ".5rem" }}>Reset link sent!</p>
            <p style={{ color: "var(--mist)", fontSize: ".85rem", lineHeight: 1.6 }}>{message}</p>
            <p style={{ color: "var(--mist)", fontSize: ".82rem", marginTop: "1rem" }}>
              💡 Check your spam folder if you don't see it.
            </p>
          </div>
        ) : (
          <>
            {status === "error" && (
              <div style={{ background: "#fee2e2", color: "#dc2626", padding: ".8rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: ".85rem" }}>
                {message}
              </div>
            )}

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="jan@example.nl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .7 : 1 }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}

        <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: ".85rem", color: "var(--mist)" }}>
          Remember your password?{" "}
          <Link to="/login" style={{ color: "var(--tulip)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}