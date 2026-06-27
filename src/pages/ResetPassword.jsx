import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setMessage(""); setStatus("idle");
    if (!form.password || !form.confirmPassword) {
      setMessage("Please fill in both fields."); setStatus("error"); return;
    }
    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters."); setStatus("error"); return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match."); setStatus("error"); return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect to server. Is it running?");
    }
    setLoading(false);
  };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: ".8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--mist)", fontSize: "1rem", padding: 0 }}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  return (
    <div style={{ maxWidth: "480px", margin: "5rem auto", padding: "0 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: ".6rem" }}>🔒</div>
        <div style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--canal)", marginBottom: ".4rem" }}>
          Reset Password
        </div>
        <p style={{ color: "var(--mist)", fontSize: ".9rem" }}>Enter your new password below.</p>
      </div>

      <div style={{ background: "var(--sand)", borderRadius: "10px", padding: "2rem" }}>
        {status === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: ".5rem" }}>Password reset!</p>
            <p style={{ color: "var(--mist)", fontSize: ".85rem" }}>{message}</p>
            <p style={{ color: "var(--mist)", fontSize: ".82rem", marginTop: ".8rem" }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            {status === "error" && (
              <div style={{ background: "#fee2e2", color: "#dc2626", padding: ".8rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: ".85rem" }}>
                {message}
              </div>
            )}

            <div className="form-group">
              <label>New password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  style={{ paddingRight: "2.5rem" }}
                />
                <EyeBtn show={showPass} toggle={() => setShowPass(s => !s)} />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm new password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={form.confirmPassword}
                  onChange={e => set("confirmPassword", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{ paddingRight: "2.5rem" }}
                />
                <EyeBtn show={showConfirm} toggle={() => setShowConfirm(s => !s)} />
              </div>
            </div>

            <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .7 : 1 }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}