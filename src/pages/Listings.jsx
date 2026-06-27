import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CITIES, TYPES } from "../data/properties";
import PropertyCard from "../components/PropertyCard";

export default function Listings() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeCity) params.append("city", activeCity);
      if (activeType !== "All") params.append("type", activeType);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await fetch(`https://huisverhuur-production.up.railway.app/api/properties?${params}`);
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load properties. Is the server running?");
    }
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [activeCity, activeType]);

  const sorted = [...properties].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "size")       return b.sqm - a.sqm;
    return 0;
  }).filter(p => !maxPrice || p.price <= parseInt(maxPrice));

  const handleReset = () => {
    setActiveCity(""); setActiveType("All");
    setMaxPrice(""); setSortBy("default");
  };

  // Map backend property to card-compatible format
  const mapProperty = (p) => ({
    id:           p._id,
    emoji:        "🏠",
    city:         p.city,
    neighborhood: p.neighborhood,
    title:        p.title,
    type:         p.type,
    beds:         p.beds,
    baths:        p.baths,
    sqm:          p.sqm,
    price:        p.price,
    badge:        p.status === "active" ? null : p.status,
    images:       p.images || [],
    landlord:     p.landlord,
  });

  return (
    <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "2.5rem 2rem" }}>

      {/* Header */}
      <div className="section-header" style={{ marginBottom: "2rem" }}>
        <h2>All Properties</h2>
        <span className="result-count">
          { loading ? "Loading..." : `${sorted.length} propert${sorted.length === 1 ? "y" : "ies"}`}
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem", padding: "1.2rem", background: "var(--sand)", borderRadius: "8px", alignItems: "flex-end" }}>
        <div className="search-field" style={{ flex: "1 1 150px", background: "var(--white)", borderRadius: "6px", padding: ".6rem 1rem" }}>
          <label>City</label>
          <select value={activeCity} onChange={e => setActiveCity(e.target.value)}>
            <option value="">All cities</option>
            {CITIES.filter(c => c.value).map(c => (
              <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
            ))}
          </select>
        </div>
        <div className="search-field" style={{ flex: "1 1 150px", background: "var(--white)", borderRadius: "6px", padding: ".6rem 1rem" }}>
          <label>Type</label>
          <select value={activeType} onChange={e => setActiveType(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="search-field" style={{ flex: "1 1 150px", background: "var(--white)", borderRadius: "6px", padding: ".6rem 1rem" }}>
          <label>Max rent / mo</label>
          <input
            type="number"
            placeholder="e.g. 2000"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="search-field" style={{ flex: "1 1 150px", background: "var(--white)", borderRadius: "6px", padding: ".6rem 1rem" }}>
          <label>Sort by</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="default">Newest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="size">Largest first</option>
          </select>
        </div>
        <button
          className="search-btn"
          style={{ borderRadius: "6px", padding: ".7rem 1.4rem", height: "fit-content" }}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: "1rem", borderRadius: "6px", marginBottom: "1.5rem", fontSize: ".9rem" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.6rem" }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ borderRadius: "8px", overflow: "hidden", background: "var(--fog)", height: "320px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid">
          {sorted.map(p => (
            <PropertyCard
              key={p._id}
              property={mapProperty(p)}
              onClick={() => navigate(`/listings/${p._id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏚️</div>
          <p>No properties found. Try adjusting your filters.</p>
          <button className="btn-secondary" style={{ marginTop: "1rem" }} onClick={handleReset}>
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}