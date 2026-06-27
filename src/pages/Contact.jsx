import { useState } from "react";
import Toast from "../components/Toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [toast, setToast] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      setToast("Please fill in all required fields.");
      return;
    }
    setToast("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--tulip)", marginBottom: ".6rem" }}>
          Get in touch
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "2.2rem", color: "var(--canal)", marginBottom: ".8rem" }}>
          Contact Us
        </h1>
        <p style={{ color: "var(--mist)", marginBottom: "2.5rem", lineHeight: 1.7 }}>
          Have a question about a listing, need help finding a property, or want to list your own? We're here to help.
        </p>
        {/* Trust bar */}
<div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2rem", padding: "1rem 1.2rem", background: "var(--sand)", borderRadius: "8px" }}>
  {["🔒 SSL Secured", "✅ Verified Platform", "🛡️ Fraud Protected", "💬 Real Support"].map(t => (
    <div key={t} style={{ fontSize: ".8rem", color: "var(--canal)", fontWeight: 500 }}>{t}</div>
  ))}
</div>

        <div style={{ background: "var(--sand)", borderRadius: "10px", padding: "2rem" }}>
          <div className="form-group">
            <label>Full name *</label>
            <input placeholder="Jan de Vries" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" placeholder="jan@example.nl" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input placeholder="e.g. Question about Amsterdam listing" value={form.subject} onChange={e => set("subject", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Message *</label>
            <textarea rows="5" placeholder="Write your message here…" value={form.message} onChange={e => set("message", e.target.value)} />
          </div>
          <button className="btn-submit" onClick={handleSubmit}>Send Message</button>
        </div>

        {/* Info boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "2rem" }}>
          {[
            { icon: "📧", label: "Email", value: "hello@huisverhuur.nl" },
            { icon: "📞", label: "Phone", value: "+31 20 123 4567" },
            { icon: "📍", label: "Office", value: "Herengracht 182, Amsterdam" },
            { icon: "🕐", label: "Hours", value: "Mon–Fri, 9:00–18:00" },
          ].map(item => (
            <div key={item.label} style={{ background: "var(--white)", borderRadius: "8px", padding: "1rem 1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize: "1.3rem", marginBottom: ".3rem" }}>{item.icon}</div>
              <div style={{ fontSize: ".7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--mist)", marginBottom: ".2rem" }}>{item.label}</div>
              <div style={{ fontSize: ".88rem", color: "var(--canal)", fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast} />}
    </>
  );
}