import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BookingForm from "../components/BookingForm";
import Toast from "../components/Toast";
import { useSocket } from "../context/SocketContext";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

const { socket } = useSocket();

const handleStartChat = () => {
  if (!user) { navigate("/login"); return; }
  if (!property.landlord) return;
  const convId = [user._id, property.landlord._id]
    .sort().join("_") + `_${property._id}`;
  navigate(`/messages/${convId}`);
  };

  const [property, setProperty] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://huisverhuur-production.up.railway.app/api/properties/${id}`);
        if (!res.ok) { setProperty(null); setLoading(false); return; }
        const data = await res.json();
        setProperty(data);

        // Fetch related
        const relRes = await fetch(`https://huisverhuur-production.up.railway.app/api/properties?city=${data.city}`);
        const relData = await relRes.json();
        setRelated(Array.isArray(relData) ? relData.filter(p => p._id !== id).slice(0, 3) : []);
      } catch (err) {
        setProperty(null);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  const handleInquirySubmit = async (formData) => {
    if (!user) { navigate("/login"); return; }
    try {
      const res = await fetch("https://huisverhuur-production.up.railway.app/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property._id,
          message:    formData.message,
          moveInDate: formData.moveIn,
          lease:      formData.lease,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.message || "Failed to send inquiry.");
        return;
      }
      setShowBooking(false);
      setToast("Inquiry sent! The landlord will contact you within 24 hours.");
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast("Could not send inquiry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ height: "320px", background: "var(--fog)", borderRadius: "10px", marginBottom: "2rem", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem" }}>
          <div>
            <div style={{ height: "2rem", background: "var(--fog)", borderRadius: "4px", marginBottom: "1rem", width: "60%" }} />
            <div style={{ height: "1rem", background: "var(--fog)", borderRadius: "4px", marginBottom: ".5rem" }} />
            <div style={{ height: "1rem", background: "var(--fog)", borderRadius: "4px", width: "80%" }} />
          </div>
          <div style={{ height: "300px", background: "var(--fog)", borderRadius: "10px" }} />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)", marginBottom: "1rem" }}>Property not found</h2>
        <button className="btn-primary" style={{ maxWidth: "200px" }} onClick={() => navigate("/listings")}>
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* Back */}
        <button onClick={() => navigate("/listings")}
          style={{ background: "none", border: "none", color: "var(--mist)", cursor: "pointer", fontSize: ".85rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
          ← Back to Listings
        </button>

        {/* Image gallery */}
        {property.images && property.images.length > 0 ? (
          <div style={{ marginBottom: "2rem" }}>
            <img
              src={property.images[activeImg]}
              alt={property.title}
              style={{ width: "100%", height: "380px", objectFit: "cover", borderRadius: "10px", display: "block" }}
            />
            {property.images.length > 1 && (
              <div style={{ display: "flex", gap: ".5rem", marginTop: ".6rem", flexWrap: "wrap" }}>
                {property.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImg(i)}
                    style={{ width: "72px", height: "56px", objectFit: "cover", borderRadius: "5px", cursor: "pointer", border: activeImg === i ? "2.5px solid var(--tulip)" : "2.5px solid transparent", opacity: activeImg === i ? 1 : 0.7, transition: "all .15s" }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: "320px", background: "linear-gradient(135deg, var(--canal) 0%, #2a5a8c 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", marginBottom: "2rem" }}>
            🏠
          </div>
        )}

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem", alignItems: "start" }}>

          {/* Left */}
          <div>
            {property.badge && (
              <div style={{ display: "inline-block", background: "var(--tulip)", color: "var(--white)", fontSize: ".7rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: ".25rem .7rem", borderRadius: "3px", marginBottom: ".8rem" }}>
                {property.badge}
              </div>
            )}
            <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--tulip)", marginBottom: ".4rem" }}>
              {property.city}{property.neighborhood ? ` · ${property.neighborhood}` : ""}
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "2rem", color: "var(--canal)", marginBottom: "1.2rem", lineHeight: 1.2 }}>
              {property.title}
            </h1>

            {/* Specs */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", padding: "1.2rem 0", borderTop: "1px solid var(--fog)", borderBottom: "1px solid var(--fog)", marginBottom: "1.5rem" }}>
              {[
                { val: property.beds === 0 ? "Studio" : property.beds, lbl: "Bedrooms" },
                { val: property.baths, lbl: "Bathrooms" },
                { val: `${property.sqm} m²`, lbl: "Floor area" },
                { val: property.type, lbl: "Type" },
              ].map(s => (
                <div key={s.lbl}>
                  <div className="spec-val">{s.val}</div>
                  <div className="spec-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: "var(--display)", color: "var(--canal)", marginBottom: ".8rem", fontSize: "1.1rem" }}>About this property</h3>
            <p style={{ fontSize: ".95rem", lineHeight: 1.8, color: "#444", marginBottom: "2rem" }}>{property.description}</p>

            {/* Landlord info */}
            {property.landlord && (
            <div style={{ background: "var(--sand)", borderRadius: "8px", padding: "1.2rem 1.5rem", marginBottom: "2rem", cursor: "pointer" }}
            onClick={() => navigate(`/landlord/${property.landlord._id}`)}>
              <h3 style={{ fontFamily: "var(--display)", color: "var(--canal)", marginBottom: ".8rem", fontSize: "1rem" }}>
                  About the Landlord
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--canal)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: "1.1rem", flexShrink: 0 }}>
                {property.landlord.firstName?.[0]}{property.landlord.lastName?.[0]}
                  </div>
                  <div>
                <div style={{ fontWeight: 600, color: "var(--canal)" }}>
                  {property.landlord.firstName} {property.landlord.lastName}
                  {property.landlord.verified && (
                    <span style={{ marginLeft: ".5rem", background: "#dcfce7", color: "#15803d", fontSize: ".68rem", fontWeight: 700, padding: ".15rem .5rem", borderRadius: "100px" }}>
                      ✓ Verified
                    </span>
          )}
        </div>
        {property.landlord.companyName && (
          <div style={{ fontSize: ".82rem", color: "var(--mist)" }}>{property.landlord.companyName}</div>
        )}
        <div style={{ fontSize: ".78rem", color: "var(--tulip)", marginTop: ".2rem", fontWeight: 500 }}>
          View profile & reviews →
        </div>
      </div>
    </div>
  </div>
)}

            {/* Features */}
            <h3 style={{ fontFamily: "var(--display)", color: "var(--canal)", marginBottom: ".8rem", fontSize: "1.1rem" }}>What's included</h3>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
              {["Verified landlord", "No agency fee", "Transparent lease", "Online payments", "24h support"].map(f => (
                <span key={f} style={{ background: "var(--fog)", color: "var(--canal)", padding: ".35rem .85rem", borderRadius: "100px", fontSize: ".8rem", fontWeight: 500 }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right — sticky price card */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ background: "var(--white)", borderRadius: "10px", boxShadow: "0 4px 24px rgba(0,0,0,.1)", padding: "1.6rem" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--canal)", marginBottom: ".2rem" }}>
                €{property.price?.toLocaleString()} <span style={{ fontSize: ".85rem", fontWeight: 400, color: "var(--mist)" }}>/mo</span>
              </div>
              <div style={{ fontSize: ".8rem", color: "var(--mist)", marginBottom: "1.2rem" }}>
                Available: <strong style={{ color: "var(--canal)" }}>{property.available}</strong>
              </div>
              <div style={{ background: "var(--sand)", borderRadius: "6px", padding: ".8rem 1rem", marginBottom: "1.2rem" }}>
  {[
    { icon: "🔒", text: "Safe & secure platform" },
    { icon: "✅", text: "Verified landlord" },
    { icon: "💬", text: "Direct communication" },
    { icon: "🛡️", text: "Fraud protection" },
  ].map(t => (
    <div key={t.text} style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".35rem", fontSize: ".78rem", color: "var(--mist)" }}>
      <span>{t.icon}</span> {t.text}
    </div>
  ))}
  <div style={{ borderTop: "1px solid var(--fog)", marginTop: ".5rem", paddingTop: ".5rem", fontSize: ".74rem", color: "var(--mist)" }}>
    💡 Payments are optional — arrange directly with landlord after viewing
  </div>
</div>

              {!user ? (
                <div>
                  <button className="btn-primary" style={{ width: "100%", marginBottom: ".7rem" }} onClick={() => navigate("/login")}>
                    Sign in to Inquire
                  </button>
                  <button className="btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/register")}>
                    Create Account
                  </button>
                </div>
              ) : user.role === "tenant" ? (
                !showBooking ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
                    <button className="btn-primary" style={{ width: "100%" }} onClick={() => setShowBooking(true)}>
                      Book a Viewing
                    </button>
                    <button className="btn-secondary" style={{ width: "100%" }} onClick={handleStartChat}>
                      💬 Message Landlord
                    </button>
                    <button className="btn-secondary" style={{ width: "100%" }} onClick={() => setShowBooking(true)}>
                      Send Inquiry
                    </button>
                  </div>
                ) : (
                  <BookingForm
                    onBack={() => setShowBooking(false)}
                    onSubmit={handleInquirySubmit}
                  />
                )
              ) : (
                <div style={{ background: "var(--fog)", borderRadius: "6px", padding: ".8rem 1rem", fontSize: ".82rem", color: "var(--mist)", textAlign: "center" }}>
                  You are viewing as a landlord
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related properties */}
        {related.length > 0 && (
          <div style={{ marginTop: "3.5rem" }}>
            <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)", marginBottom: "1.4rem", fontSize: "1.4rem" }}>
              More in {property.city}
            </h2>
            <div className="grid">
              {related.map(p => (
                <div key={p._id} className="card" onClick={() => navigate(`/listings/${p._id}`)}>
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  ) : (
                    <div className="card-img-placeholder">🏠</div>
                  )}
                  <div className="card-body">
                    <div className="card-city">{p.city} · {p.neighborhood}</div>
                    <div className="card-title">{p.title}</div>
                    <div className="card-footer">
                      <div className="card-price">€{p.price?.toLocaleString()} <small>/mo</small></div>
                      <button className="card-btn">View</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} />}
    </>
  );
}