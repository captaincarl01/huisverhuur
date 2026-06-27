import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "7rem 2rem" }}>
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🏚️</div>
      <h1 style={{ fontFamily: "var(--display)", fontSize: "2.5rem", color: "var(--canal)", marginBottom: ".8rem" }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: "var(--mist)", marginBottom: "2rem", fontSize: "1rem" }}>
        Looks like this property doesn't exist. Let's get you back on track.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button className="btn-primary" style={{ maxWidth: "180px" }} onClick={() => navigate("/")}>
          Go Home
        </button>
        <button className="btn-secondary" style={{ maxWidth: "180px" }} onClick={() => navigate("/listings")}>
          View Listings
        </button>
      </div>
    </div>
  );
}