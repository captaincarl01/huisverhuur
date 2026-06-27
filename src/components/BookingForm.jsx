import { useState } from "react";

export default function BookingForm({ onBack, onSubmit }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    moveIn: "", lease: "12 months", message: ""
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.message) {
      alert("Please write a message to the landlord.");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="booking-section">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <div className="booking-title">Send an Inquiry</div>

      <div className="form-row">
        <div className="form-group">
          <label>First name</label>
          <input placeholder="Jan" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Last name</label>
          <input placeholder="de Vries" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="email" placeholder="jan@example.nl" value={form.email} onChange={e => set("email", e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Move-in date</label>
          <input type="date" value={form.moveIn} onChange={e => set("moveIn", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Lease length</label>
          <select value={form.lease} onChange={e => set("lease", e.target.value)}>
            <option>6 months</option>
            <option>12 months</option>
            <option>24 months</option>
            <option>Indefinite</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Message *</label>
        <textarea
          rows="3"
          placeholder="Tell the landlord about yourself and why you're interested…"
          value={form.message}
          onChange={e => set("message", e.target.value)}
        />
      </div>

      <button className="btn-submit" onClick={handleSubmit}>Send Inquiry</button>
    </div>
  );
}