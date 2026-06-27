import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TenantDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await fetch("https://huisverhuur-production.up.railway.app/api/inquiries/tenant", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInquiries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchInquiries();
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--canal)" }}>
            Welcome, {user?.firstName}! 👋
          </div>
          <p style={{ color: "var(--mist)", fontSize: ".85rem", marginTop: ".2rem" }}>
            Tenant Dashboard · {inquiries.length} inquir{inquiries.length !== 1 ? "ies" : "y"} sent
          </p>
        </div>
        <div style={{ display: "flex", gap: ".8rem" }}>
          <button className="btn-primary" onClick={() => navigate("/listings")}>Browse Listings</button>
          <button className="btn-secondary" onClick={() => { logout(); navigate("/"); }}>Log Out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Inquiries Sent", value: inquiries.length, icon: "📨" },
          { label: "Awaiting Reply", value: inquiries.filter(i => i.status === "pending").length, icon: "⏳" },
          { label: "Replied", value: inquiries.filter(i => i.status === "replied").length, icon: "✅" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--sand)", borderRadius: "8px", padding: "1.2rem 1.5rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: ".3rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--canal)" }}>{s.value}</div>
            <div style={{ fontSize: ".78rem", color: "var(--mist)", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)", marginBottom: "1.2rem", fontSize: "1.3rem" }}>
        My Inquiries
      </h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--mist)" }}>Loading...</div>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--mist)", background: "var(--sand)", borderRadius: "8px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p>No inquiries yet.</p>
          <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("/listings")}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {inquiries.map(inq => (
            <div key={inq._id} style={{ background: "var(--white)", border: "1.5px solid var(--fog)", borderRadius: "8px", padding: "1.2rem 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".8rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--display)", color: "var(--canal)", fontSize: "1rem" }}>
                    {inq.property?.title}
                  </div>
                  <div style={{ fontSize: ".78rem", color: "var(--mist)" }}>
                    {inq.property?.city} · €{inq.property?.price?.toLocaleString()}/mo
                  </div>
                  <div style={{ fontSize: ".78rem", color: "var(--mist)", marginTop: ".2rem" }}>
                    Landlord: <strong>{inq.landlord?.firstName} {inq.landlord?.lastName}</strong> · {inq.landlord?.email}
                  </div>
                </div>
                <span style={{ background: inq.status === "pending" ? "#fef3c7" : inq.status === "replied" ? "#dcfce7" : "#f3f4f6", color: inq.status === "pending" ? "#d97706" : inq.status === "replied" ? "#16a34a" : "#6b7280", fontSize: ".7rem", fontWeight: 600, padding: ".2rem .7rem", borderRadius: "100px" }}>
                  {inq.status}
                </span>
              </div>

              <div style={{ background: "var(--sand)", borderRadius: "6px", padding: ".8rem 1rem", fontSize: ".88rem", color: "#444", marginBottom: ".5rem" }}>
                Your message: "{inq.message}"
              </div>

              {inq.reply && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: ".8rem 1rem", fontSize: ".85rem", color: "#15803d" }}>
                  Landlord replied: "{inq.reply}"
                </div>
              )}

              <button className="btn-secondary" style={{ fontSize: ".78rem", padding: ".35rem .8rem", marginTop: ".8rem" }} onClick={() => navigate(`/listings/${inq.property?._id}`)}>
                View Property
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}