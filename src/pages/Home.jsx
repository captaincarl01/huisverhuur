import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TYPES } from "../data/properties";
import Hero from "../components/Hero";
import CityPills from "../components/CityPills";
import PropertyCard from "../components/PropertyCard";
import Toast from "../components/Toast";
import TrustBadges from "../components/TrustBadges";

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [searchFilters, setSearchFilters] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchProperties = async (filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.city) params.append("city", filters.city);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.maxPrice && filters.maxPrice !== Infinity) params.append("maxPrice", filters.maxPrice);

      const res = await fetch(`https://huisverhuur-production.up.railway.app/api/properties?${params}`);
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProperties({}); }, []);

  const visibleProperties = properties.filter(p => {
    const cityOk = !activeCity || p.city === activeCity;
    const typeOk = activeType === "All" || p.type === activeType;
    return cityOk && typeOk;
  });

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    setActiveCity(filters.city || "");
    setActiveType(filters.type || "All");
    fetchProperties(filters);
    document.getElementById("listings-anchor")?.scrollIntoView({ behavior: "smooth" });
  };

  const mapProperty = (p) => ({
    id: p._id, emoji: "🏠",
    city: p.city, neighborhood: p.neighborhood,
    title: p.title, type: p.type,
    beds: p.beds, baths: p.baths, sqm: p.sqm,
    price: p.price, badge: null,
    images: p.images || [],
  });

  return (
    <>
      <Hero onSearch={handleSearch} />
      <CityPills
        activeCity={activeCity}
        onChange={city => {
          setActiveCity(city);
          setSearchFilters(null);
          fetchProperties({ city });
        }}
      />

      <section className="listings-section" id="listings-anchor">
        <div className="section-header">
          <h2>Available Properties</h2>
          <span className="result-count">
            {loading ? "Loading..." : `${visibleProperties.length} propert${visibleProperties.length === 1 ? "y" : "ies"}`}
          </span>
        </div>

        <div className="filter-row">
          {TYPES.map(t => (
            <div
              key={t}
              className={`filter-chip${activeType === t ? " active" : ""}`}
              onClick={() => { setActiveType(t); setSearchFilters(null); }}
            >
              {t}
            </div>
          ))}
          {searchFilters && (
            <div className="filter-chip active" onClick={() => { setSearchFilters(null); setActiveCity(""); setActiveType("All"); fetchProperties({}); }}>
              ✕ Clear search
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: "8px", background: "var(--fog)", height: "320px", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : visibleProperties.length > 0 ? (
          <div className="grid">
            {visibleProperties.map(p => (
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
            <p>No properties found. Try adjusting your filters or check back later.</p>
          </div>
        )}
      </section>

      {toast && <Toast message={toast} />}
      {/* existing listings section */}
    

    <TrustBadges />   {/* ← add this */}

    {toast && <Toast message={toast} />}
  

    </>
  );
}