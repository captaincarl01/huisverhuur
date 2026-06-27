import { useState, useEffect } from "react";
import BookingForm from "./BookingForm";

export default function PropertyModal({ property, onClose, onInquirySent }) {
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-hero">{property.emoji}</div>
        <div className="modal-body">
          <div className="modal-city">{property.city} · {property.neighborhood}</div>
          <div className="modal-title">{property.title}</div>
          <div className="modal-specs">
            <div>
              <div className="spec-val">{property.beds === 0 ? "—" : property.beds}</div>
              <div className="spec-lbl">Bedrooms</div>
            </div>
            <div>
              <div className="spec-val">{property.baths}</div>
              <div className="spec-lbl">Bathrooms</div>
            </div>
            <div>
              <div className="spec-val">{property.sqm} m²</div>
              <div className="spec-lbl">Floor area</div>
            </div>
            <div>
              <div className="spec-val">{property.type}</div>
              <div className="spec-lbl">Type</div>
            </div>
          </div>
          <p className="modal-desc">{property.desc}</p>
          <div className="modal-price-row">
            <div>
              <div className="modal-price">€{property.price.toLocaleString()} <small>/mo</small></div>
              <div style={{ fontSize: ".78rem", color: "var(--mist)", marginTop: ".2rem" }}>
                Utilities not included
              </div>
            </div>
            <div className="modal-avail">
              Available <strong>{property.available}</strong>
            </div>
          </div>
          {!showBooking ? (
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowBooking(true)}>Book a Viewing</button>
              <button className="btn-secondary" onClick={() => setShowBooking(true)}>Send Inquiry</button>
            </div>
          ) : (
            <BookingForm
              onBack={() => setShowBooking(false)}
              onSubmit={() => { onClose(); onInquirySent(); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}