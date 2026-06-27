import { useState } from "react";
import { CITIES, TYPES } from "../data/properties";

export default function Hero({ onSearch }) {
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");

  const handleSearch = () => {
    onSearch({ city, type, maxPrice: price ? parseInt(price) : Infinity, beds });
  };

  return (
    <section className="hero">
      <p className="hero-eyebrow">Professional Rentals · Netherlands &amp; Germany</p>
      <h1>Find your place in <em>Amsterdam, Rotterdam,</em> Frankfurt &amp; beyond</h1>
      <p className="hero-sub">
        Verified listings, transparent pricing, and direct contact with landlords — no agencies, no hidden fees.
      </p>
      <div className="search-bar">
        <div className="search-field">
          <label>City</label>
          <select value={city} onChange={e => setCity(e.target.value)}>
            <option value="">All cities</option>
            {CITIES.filter(c => c.value).map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="">Any type</option>
            {TYPES.filter(t => t !== "All").map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label>Max rent / mo</label>
          <input
            type="number"
            placeholder="e.g. 1800"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        <div className="search-field">
          <label>Bedrooms</label>
          <select value={beds} onChange={e => setBeds(e.target.value)}>
            <option value="">Any</option>
            <option value="0">Studio</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3+</option>
          </select>
        </div>
        <button className="search-btn" onClick={handleSearch}>Search</button>
      </div>
    </section>
  );
}