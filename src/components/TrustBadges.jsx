export default function TrustBadges() {
  const badges = [
    {
      icon: "🔒",
      title: "Secure Platform",
      desc: "All data is encrypted and protected. Your personal information is never shared without consent.",
    },
    {
      icon: "✅",
      title: "Verified Landlords",
      desc: "Every landlord on HuisVerhuur goes through our verification process before listing properties.",
    },
    {
      icon: "💬",
      title: "Direct Communication",
      desc: "Chat directly with landlords through our platform. No middlemen, no hidden contacts.",
    },
    {
      icon: "⭐",
      title: "Honest Reviews",
      desc: "Real reviews from real tenants. Only tenants who have inquired can leave a review.",
    },
    {
      icon: "🛡️",
      title: "Fraud Protection",
      desc: "We actively monitor listings for suspicious activity to keep our community safe.",
    },
    {
      icon: "📞",
      title: "24h Support",
      desc: "Our team is available around the clock to help with any issues or concerns.",
    },
  ];

  return (
    <section style={{ background: "var(--canal)", padding: "4rem 2.5rem", marginTop: "4rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--tulip)", marginBottom: ".6rem" }}>
            Why trust HuisVerhuur
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--white)", marginBottom: ".8rem" }}>
            Your safety is our priority
          </h2>
          <p style={{ color: "var(--stone)", fontSize: ".95rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
            We built HuisVerhuur with trust at its core. Every feature is designed to protect both tenants and landlords.
          </p>
        </div>

        {/* Badges grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
          {badges.map(b => (
            <div key={b.title} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "10px", padding: "1.4rem 1.6rem", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: ".7rem" }}>{b.icon}</div>
              <div style={{ fontWeight: 700, color: "var(--white)", fontSize: ".95rem", marginBottom: ".4rem" }}>
                {b.title}
              </div>
              <p style={{ color: "var(--stone)", fontSize: ".82rem", lineHeight: 1.65 }}>{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Payment note */}
        <div style={{ marginTop: "2.5rem", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "10px", padding: "1.4rem 1.8rem", display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
          <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>💳</div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--white)", marginBottom: ".3rem", fontSize: ".95rem" }}>
              Flexible payment options
            </div>
            <p style={{ color: "var(--stone)", fontSize: ".84rem", lineHeight: 1.7 }}>
              We understand that renting a home is a big decision. Our platform supports secure online payments powered by Stripe, but you can also arrange payments directly with your landlord after a physical viewing — whatever works best for you. Your trust matters more than a transaction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}