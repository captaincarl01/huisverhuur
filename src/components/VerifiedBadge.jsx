export default function VerifiedBadge({ size = "sm" }) {
  const sizes = {
    sm: { padding: ".2rem .6rem", fontSize: ".7rem" },
    md: { padding: ".3rem .8rem", fontSize: ".8rem" },
    lg: { padding: ".4rem 1rem", fontSize: ".9rem" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: ".3rem",
      background: "#dcfce7", color: "#15803d",
      fontWeight: 700, borderRadius: "100px",
      letterSpacing: ".03em", ...sizes[size],
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="5" fill="#16a34a"/>
        <path d="M2.5 5L4.2 6.8L7.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Verified
    </span>
  );
}