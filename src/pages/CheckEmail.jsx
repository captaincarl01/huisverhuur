import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await fetch("https://huisverhuur-production.up.railway.app/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "6rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📧</div>
      <div style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--canal)", marginBottom: ".8rem" }}>
        Check your email
      </div>
      <p style={{ color: "var(--mist)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
        We sent a verification link to <strong style={{ color: "var(--canal)" }}>{email}</strong>.
        Click the link in the email to activate your account.
      </p>
      <div style={{ background: "var(--sand)", borderRadius: "8px", padding: "1.2rem", marginBottom: "1.5rem", fontSize: ".85rem", color: "var(--mist)" }}>
        💡 Check your spam folder if you don't see it within a few minutes.
      </div>

      {!resent ? (
        <button className="btn-secondary" onClick={handleResend} disabled={loading}>
          {loading ? "Sending..." : "Resend verification email"}
        </button>
      ) : (
        <p style={{ color: "#16a34a", fontWeight: 500 }}>✅ Verification email resent!</p>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: ".85rem", color: "var(--mist)" }}>
        Already verified?{" "}
        <span style={{ color: "var(--tulip)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/login")}>
          Sign in
        </span>
      </p>
    </div>
  );
}