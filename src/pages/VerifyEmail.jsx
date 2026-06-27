import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/verify/${token}`);
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
        setMessage("Could not connect to server.");
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{ maxWidth: "480px", margin: "6rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      {status === "loading" && (
        <>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div style={{ fontFamily: "var(--display)", fontSize: "1.5rem", color: "var(--canal)" }}>
            Verifying your email...
          </div>
        </>
      )}
      {status === "success" && (
        <>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <div style={{ fontFamily: "var(--display)", fontSize: "1.5rem", color: "var(--canal)", marginBottom: ".8rem" }}>
            Email Verified!
          </div>
          <p style={{ color: "var(--mist)", marginBottom: "1.5rem" }}>{message}</p>
          <p style={{ color: "var(--mist)", fontSize: ".85rem" }}>Redirecting you to login...</p>
        </>
      )}
      {status === "error" && (
        <>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <div style={{ fontFamily: "var(--display)", fontSize: "1.5rem", color: "var(--canal)", marginBottom: ".8rem" }}>
            Verification Failed
          </div>
          <p style={{ color: "var(--mist)", marginBottom: "1.5rem" }}>{message}</p>
          <button className="btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
        </>
      )}
    </div>
  );
}