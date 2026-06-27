import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CLOUDINARY_CLOUD_NAME = "ly7occm2";
const CLOUDINARY_UPLOAD_PRESET = "huisverhuur_upload";

export default function LandlordDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState("listings");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "", description: "", type: "Apartment",
    city: "", neighborhood: "", price: "",
    beds: "", baths: "", sqm: "", available: "Now",
  });
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propRes, inqRes] = await Promise.all([
        fetch("https://huisverhuur-production.up.railway.app/api/properties/landlord/my-listings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://huisverhuur-production.up.railway.app/api/inquiries/landlord", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const propData = await propRes.json();
      const inqData  = await inqRes.json();
      setProperties(Array.isArray(propData) ? propData : []);
      setInquiries(Array.isArray(inqData) ? inqData : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    const uploaded = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) uploaded.push(data.secure_url);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }
    setImages(prev => [...prev, ...uploaded]);
    setUploadingImages(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateProperty = async () => {
    setFormError("");
    if (!form.title || !form.description || !form.city || !form.price || !form.beds || !form.baths || !form.sqm) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch("https://huisverhuur-production.up.railway.app/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price),
          beds:  parseInt(form.beds),
          baths: parseInt(form.baths),
          sqm:   parseInt(form.sqm),
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); setFormLoading(false); return; }
      setShowForm(false);
      setForm({ title: "", description: "", type: "Apartment", city: "", neighborhood: "", price: "", beds: "", baths: "", sqm: "", available: "Now" });
      setImages([]);
      fetchData();
    } catch (err) {
      setFormError("Failed to create listing.");
    }
    setFormLoading(false);
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await fetch(`https://huisverhuur-production.up.railway.app/api/properties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const handleReply = async (inquiryId, reply) => {
    await fetch(`https://huisverhuur-production.up.railway.app/api/inquiries/${inquiryId}/reply`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reply }),
    });
    fetchData();
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--canal)" }}>
            Welcome, {user?.firstName}! 👋
          </div>
          <p style={{ color: "var(--mist)", fontSize: ".85rem", marginTop: ".2rem" }}>
            Landlord Dashboard · {properties.length} listing{properties.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: ".8rem" }}>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Listing</button>
          <button className="btn-secondary" onClick={() => { logout(); navigate("/"); }}>Log Out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Active Listings", value: properties.filter(p => p.status === "active").length, icon: "🏠" },
          { label: "Total Inquiries", value: inquiries.length, icon: "📬" },
          { label: "Pending Replies", value: inquiries.filter(i => i.status === "pending").length, icon: "⏳" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--sand)", borderRadius: "8px", padding: "1.2rem 1.5rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: ".3rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--canal)" }}>{s.value}</div>
            <div style={{ fontSize: ".78rem", color: "var(--mist)", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.5rem" }}>
        {["listings", "inquiries"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: ".5rem 1.2rem", borderRadius: "4px", border: "1.5px solid",
              borderColor: activeTab === tab ? "var(--canal)" : "var(--stone)",
              background: activeTab === tab ? "var(--canal)" : "var(--white)",
              color: activeTab === tab ? "var(--white)" : "var(--ink)",
              cursor: "pointer", fontWeight: 500, fontSize: ".85rem", textTransform: "capitalize",
            }}
          >
            {tab}{tab === "inquiries" && inquiries.filter(i => i.status === "pending").length > 0 && (
              <span style={{ background: "var(--tulip)", color: "white", borderRadius: "100px", padding: "0 .5rem", fontSize: ".72rem", marginLeft: ".4rem" }}>
                {inquiries.filter(i => i.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--mist)" }}>Loading...</div>
      ) : activeTab === "listings" ? (
        properties.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--mist)", background: "var(--sand)", borderRadius: "8px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏠</div>
            <p>No listings yet. Click <strong>+ New Listing</strong> to add your first property.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {properties.map(p => (
              <div key={p._id} style={{ background: "var(--white)", border: "1.5px solid var(--fog)", borderRadius: "8px", overflow: "hidden", display: "flex" }}>
                {/* Property image */}
                <div style={{ width: "140px", minHeight: "120px", flexShrink: 0, background: "linear-gradient(135deg, var(--canal), #2a5a8c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", overflow: "hidden" }}>
                  {p.images && p.images.length > 0
                    ? <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : "🏠"
                  }
                </div>
                <div style={{ padding: "1rem 1.2rem", flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: "var(--display)", color: "var(--canal)", fontSize: "1.05rem" }}>{p.title}</div>
                    <div style={{ fontSize: ".8rem", color: "var(--mist)", marginTop: ".2rem" }}>
                      {p.city} · {p.type} · €{p.price?.toLocaleString()}/mo · {p.beds} bed · {p.sqm}m²
                    </div>
                    <div style={{ marginTop: ".4rem" }}>
                      <span style={{ background: p.status === "active" ? "#dcfce7" : "#fee2e2", color: p.status === "active" ? "#16a34a" : "#dc2626", fontSize: ".7rem", fontWeight: 600, padding: ".2rem .6rem", borderRadius: "100px" }}>
                        {p.status}
                      </span>
                      {p.images?.length > 0 && (
                        <span style={{ marginLeft: ".5rem", fontSize: ".7rem", color: "var(--mist)" }}>
                          📸 {p.images.length} photo{p.images.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: ".6rem", flexShrink: 0 }}>
                    <button className="btn-secondary" style={{ fontSize: ".78rem", padding: ".35rem .8rem" }} onClick={() => navigate(`/listings/${p._id}`)}>View</button>
                    <button onClick={() => handleDeleteProperty(p._id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: ".35rem .8rem", borderRadius: "4px", fontSize: ".78rem", cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        inquiries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--mist)", background: "var(--sand)", borderRadius: "8px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📬</div>
            <p>No inquiries yet. They'll appear here when tenants contact you.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {inquiries.map(inq => <InquiryCard key={inq._id} inquiry={inq} onReply={handleReply} />)}
          </div>
        )
      )}

      {/* New Listing Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,20,35,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: "var(--white)", borderRadius: "10px", maxWidth: "640px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)", marginBottom: "1.5rem" }}>New Listing</h2>

            {formError && (
              <div style={{ background: "#fee2e2", color: "#dc2626", padding: ".8rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: ".85rem" }}>
                {formError}
              </div>
            )}

            <div className="form-group"><label>Title *</label><input placeholder="Bright Canal-View Apartment" value={form.title} onChange={e => set("title", e.target.value)} /></div>
            <div className="form-group"><label>Description *</label><textarea rows="3" placeholder="Describe the property…" value={form.description} onChange={e => set("description", e.target.value)} /></div>

            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select value={form.type} onChange={e => set("type", e.target.value)}>
                  <option>Apartment</option><option>House</option><option>Studio</option><option>Canal House</option>
                </select>
              </div>
              <div className="form-group">
                <label>Available</label>
                <input placeholder="Now / Aug 1, 2026" value={form.available} onChange={e => set("available", e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group"><label>City *</label><input placeholder="Amsterdam" value={form.city} onChange={e => set("city", e.target.value)} /></div>
              <div className="form-group"><label>Neighbourhood</label><input placeholder="Jordaan" value={form.neighborhood} onChange={e => set("neighborhood", e.target.value)} /></div>
            </div>

            <div className="form-row">
              <div className="form-group"><label>Price / mo (€) *</label><input type="number" placeholder="1800" value={form.price} onChange={e => set("price", e.target.value)} /></div>
              <div className="form-group"><label>Bedrooms *</label><input type="number" placeholder="2" value={form.beds} onChange={e => set("beds", e.target.value)} /></div>
            </div>

            <div className="form-row">
              <div className="form-group"><label>Bathrooms *</label><input type="number" placeholder="1" value={form.baths} onChange={e => set("baths", e.target.value)} /></div>
              <div className="form-group"><label>Size (m²) *</label><input type="number" placeholder="75" value={form.sqm} onChange={e => set("sqm", e.target.value)} /></div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Property Photos <span style={{ color: "var(--mist)", fontWeight: 400 }}>(optional)</span></label>
              <div
                style={{ border: "2px dashed var(--stone)", borderRadius: "8px", padding: "1.5rem", textAlign: "center", cursor: "pointer", background: "var(--fog)", transition: "border-color .2s" }}
                onClick={() => document.getElementById("img-upload").click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--canal)"; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = "var(--stone)"; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--stone)"; handleImageUpload(Array.from(e.dataTransfer.files)); }}
              >
                <div style={{ fontSize: "2rem", marginBottom: ".4rem" }}>📸</div>
                <div style={{ fontSize: ".85rem", color: "var(--mist)" }}>
                  {uploadingImages ? "Uploading..." : "Click or drag photos here"}
                </div>
                <div style={{ fontSize: ".75rem", color: "var(--stone)", marginTop: ".3rem" }}>
                  JPG, PNG — up to 10 photos
                </div>
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => handleImageUpload(Array.from(e.target.files))}
                />
              </div>

              {/* Image previews */}
              {images.length > 0 && (
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".8rem" }}>
                  {images.map((url, i) => (
                    <div key={i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "6px", overflow: "hidden" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={() => removeImage(i)}
                        style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,.6)", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: ".65rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: ".8rem", marginTop: ".5rem" }}>
              <button className="btn-primary" onClick={handleCreateProperty} disabled={formLoading || uploadingImages} style={{ opacity: formLoading ? .7 : 1 }}>
                {formLoading ? "Creating..." : "Create Listing"}
              </button>
              <button className="btn-secondary" onClick={() => { setShowForm(false); setImages([]); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InquiryCard({ inquiry, onReply }) {
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);
  const handleSend = () => {
    if (!reply.trim()) return;
    onReply(inquiry._id, reply);
    setReply(""); setShowReply(false);
  };
  return (
    <div style={{ background: "var(--white)", border: "1.5px solid var(--fog)", borderRadius: "8px", padding: "1.2rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".8rem" }}>
        <div>
          <div style={{ fontWeight: 600, color: "var(--canal)", fontSize: ".95rem" }}>
            {inquiry.tenant?.firstName} {inquiry.tenant?.lastName}
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--mist)" }}>{inquiry.tenant?.email} · {inquiry.tenant?.phone}</div>
          <div style={{ fontSize: ".78rem", color: "var(--mist)", marginTop: ".2rem" }}>
            Re: <strong>{inquiry.property?.title}</strong> · {inquiry.property?.city} · €{inquiry.property?.price?.toLocaleString()}/mo
          </div>
        </div>
        <span style={{ background: inquiry.status === "pending" ? "#fef3c7" : inquiry.status === "replied" ? "#dcfce7" : "#f3f4f6", color: inquiry.status === "pending" ? "#d97706" : inquiry.status === "replied" ? "#16a34a" : "#6b7280", fontSize: ".7rem", fontWeight: 600, padding: ".2rem .7rem", borderRadius: "100px", whiteSpace: "nowrap" }}>
          {inquiry.status}
        </span>
      </div>
      <div style={{ background: "var(--sand)", borderRadius: "6px", padding: ".8rem 1rem", fontSize: ".88rem", color: "#444", marginBottom: ".8rem" }}>
        "{inquiry.message}"
      </div>
      {inquiry.moveInDate && (
        <div style={{ fontSize: ".78rem", color: "var(--mist)", marginBottom: ".8rem" }}>
          Move-in: <strong>{inquiry.moveInDate}</strong> · Lease: <strong>{inquiry.lease}</strong>
        </div>
      )}
      {inquiry.reply && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: ".8rem 1rem", fontSize: ".85rem", color: "#15803d", marginBottom: ".8rem" }}>
          Your reply: "{inquiry.reply}"
        </div>
      )}
      {inquiry.status === "pending" && !showReply && (
        <button className="btn-primary" style={{ fontSize: ".8rem", padding: ".4rem .9rem" }} onClick={() => setShowReply(true)}>Reply</button>
      )}
      {showReply && (
        <div style={{ marginTop: ".5rem" }}>
          <textarea rows="2" placeholder="Write your reply…" value={reply} onChange={e => setReply(e.target.value)}
            style={{ width: "100%", border: "1.5px solid var(--stone)", borderRadius: "5px", padding: ".6rem .8rem", fontFamily: "var(--body)", fontSize: ".88rem", outline: "none", marginBottom: ".5rem" }} />
          <div style={{ display: "flex", gap: ".6rem" }}>
            <button className="btn-primary" style={{ fontSize: ".8rem", padding: ".4rem .9rem" }} onClick={handleSend}>Send Reply</button>
            <button className="btn-secondary" style={{ fontSize: ".8rem", padding: ".4rem .9rem" }} onClick={() => setShowReply(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}