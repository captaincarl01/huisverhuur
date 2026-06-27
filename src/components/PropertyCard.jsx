export default function PropertyCard({ property, onClick }) {
  const { emoji, city, neighborhood, title, type, beds, baths, sqm, price, badge, images } = property;

  return (
    <div className="card" onClick={() => onClick(property)}>
      <div className="card-img-wrap">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="card-img"
            style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div className="card-img-placeholder">{emoji || "🏠"}</div>
        )}
        {badge && <div className="card-badge">{badge}</div>}
      </div>
      <div className="card-body">
        <div className="card-city">{city} · {neighborhood}</div>
        <div className="card-title">{title}</div>
        <div className="card-meta">
          <span>🛏 {beds === 0 ? "Studio" : `${beds} bed`}</span>
          <span>🚿 {baths} bath</span>
          <span>📐 {sqm} m²</span>
          <span>🏠 {type}</span>
        </div>
        <div className="card-footer">
          <div className="card-price">€{price?.toLocaleString()} <small>/mo</small></div>
          <button className="card-btn">View</button>
        </div>
      </div>
    </div>
  );
}