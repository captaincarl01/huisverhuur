import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "../components/VerifiedBadge";

function StarRating({ rating, size = "1rem", interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: ".15rem" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            fontSize: size,
            cursor: interactive ? "pointer" : "default",
            color: star <= (hovered || rating) ? "#f59e0b" : "#d1d5db",
            transition: "color .1s",
          }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div style={{ background: "var(--white)", border: "1.5px solid var(--fog)", borderRadius: "8px", padding: "1.2rem 1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".7rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--canal)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: ".82rem" }}>
            {review.tenant?.firstName?.[0]}{review.tenant?.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: ".88rem", color: "var(--canal)" }}>
              {review.tenant?.firstName} {review.tenant?.lastName}
            </div>
            <div style={{ fontSize: ".72rem", color: "var(--mist)" }}>
              Re: {review.property?.title} · {review.property?.city}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <StarRating rating={review.rating} size=".9rem" />
          <div style={{ fontSize: ".7rem", color: "var(--mist)", marginTop: ".2rem" }}>
            {new Date(review.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>
      <p style={{ fontSize: ".88rem", color: "#444", lineHeight: 1.7, fontStyle: "italic" }}>
        "{review.comment}"
      </p>
    </div>
  );
}

function LeaveReviewForm({ landlordId, onSuccess }) {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [propertyId, setPropertyId] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/reviews/landlord/${landlordId}/inquiry-property`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.property) setPropertyId(data.property._id); })
      .catch(console.error);
  }, [landlordId, token]);

  const handleSubmit = async () => {
    setError("");
    if (!rating) { setError("Please select a star rating."); return; }
    if (comment.length < 10) { setError("Review must be at least 10 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ landlordId, propertyId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLoading(false); return; }
      onSuccess();
    } catch { setError("Failed to submit review."); }
    setLoading(false);
  };

  return (
    <div style={{ background: "var(--sand)", borderRadius: "10px", padding: "1.5rem" }}>
      <h3 style={{ fontFamily: "var(--display)", color: "var(--canal)", fontSize: "1.1rem", marginBottom: "1rem" }}>
        Leave a Review
      </h3>

      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: ".7rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: ".84rem" }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: ".76rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mist)", marginBottom: ".5rem" }}>
          Your Rating *
        </label>
        <StarRating rating={rating} size="1.8rem" interactive onRate={setRating} />
        {rating > 0 && (
          <div style={{ fontSize: ".78rem", color: "var(--mist)", marginTop: ".3rem" }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Your Review *</label>
        <textarea
          rows="4"
          placeholder="Share your experience with this landlord — communication, responsiveness, property condition…"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <div style={{ fontSize: ".72rem", color: comment.length < 10 ? "#dc2626" : "var(--mist)", marginTop: ".3rem" }}>
          {comment.length}/500 characters {comment.length < 10 && "(minimum 10)"}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .7 : 1 }}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

export default function LandlordProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/landlords/${id}`);
      const d = await res.json();
      if (res.ok) setData(d);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, [id]);

  useEffect(() => {
    if (!user || user.role !== "tenant") return;
    const token = localStorage.getItem("hv_token");
    fetch(`http://localhost:5000/api/reviews/can-review/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setCanReview(d.canReview))
      .catch(console.error);
  }, [id, user]);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setReviewSuccess(true);
    setCanReview(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ height: "200px", background: "var(--fog)", borderRadius: "10px", marginBottom: "2rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)" }}>Landlord not found</h2>
        <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("/listings")}>Browse Listings</button>
      </div>
    );
  }

  const { landlord, properties, reviews, averageRating, totalReviews, totalListings } = data;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 2rem" }}>

      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--mist)", cursor: "pointer", fontSize: ".85rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
        ← Back
      </button>

      {/* Profile header */}
      <div style={{ background: "var(--white)", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,.07)", padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Avatar */}
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--canal)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.8rem", flexShrink: 0 }}>
            {landlord.firstName?.[0]}{landlord.lastName?.[0]}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".8rem", flexWrap: "wrap", marginBottom: ".3rem" }}>
              <h1 style={{ fontFamily: "var(--display)", fontSize: "1.6rem", color: "var(--canal)", margin: 0 }}>
                {landlord.firstName} {landlord.lastName}
              </h1>
              {landlord.verified && <VerifiedBadge size="md" />}
            </div>

            {landlord.companyName && (
              <div style={{ color: "var(--tulip)", fontWeight: 600, fontSize: ".9rem", marginBottom: ".4rem" }}>
                🏢 {landlord.companyName}
              </div>
            )}

            {/* Rating summary */}
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".6rem" }}>
              <StarRating rating={Math.round(averageRating)} size="1rem" />
              <span style={{ fontWeight: 700, color: "var(--canal)", fontSize: ".9rem" }}>{averageRating}</span>
              <span style={{ color: "var(--mist)", fontSize: ".82rem" }}>({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
            </div>

            {landlord.bio && (
              <p style={{ color: "#444", fontSize: ".9rem", lineHeight: 1.7, maxWidth: "560px" }}>{landlord.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { val: totalListings, lbl: "Listings" },
              { val: totalReviews, lbl: "Reviews" },
              { val: averageRating || "—", lbl: "Avg Rating" },
              { val: new Date(landlord.createdAt).getFullYear(), lbl: "Member since" },
            ].map(s => (
              <div key={s.lbl} style={{ background: "var(--sand)", borderRadius: "8px", padding: ".8rem 1.2rem", textAlign: "center", minWidth: "80px" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--canal)" }}>{s.val}</div>
                <div style={{ fontSize: ".7rem", color: "var(--mist)", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Listings */}
      {properties.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)", fontSize: "1.3rem", marginBottom: "1.2rem" }}>
            Active Listings ({totalListings})
          </h2>
          <div className="grid">
            {properties.map(p => (
              <div key={p._id} className="card" onClick={() => navigate(`/listings/${p._id}`)}>
                {p.images?.length > 0 ? (
                  <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "190px", objectFit: "cover" }} />
                ) : (
                  <div className="card-img-placeholder">🏠</div>
                )}
                <div className="card-body">
                  <div className="card-city">{p.city} · {p.neighborhood}</div>
                  <div className="card-title">{p.title}</div>
                  <div className="card-meta">
                    <span>🛏 {p.beds === 0 ? "Studio" : `${p.beds} bed`}</span>
                    <span>📐 {p.sqm} m²</span>
                    <span>🏠 {p.type}</span>
                  </div>
                  <div className="card-footer">
                    <div className="card-price">€{p.price?.toLocaleString()} <small>/mo</small></div>
                    <button className="card-btn">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
          <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)", fontSize: "1.3rem" }}>
            Reviews ({totalReviews})
          </h2>
          {canReview && !showReviewForm && (
            <button className="btn-primary" style={{ fontSize: ".82rem", padding: ".45rem 1rem" }} onClick={() => setShowReviewForm(true)}>
              ✍️ Write a Review
            </button>
          )}
        </div>

        {reviewSuccess && (
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "8px", padding: "1rem 1.2rem", marginBottom: "1.2rem", color: "#15803d", fontSize: ".88rem", fontWeight: 500 }}>
            ✅ Your review has been submitted! Thank you.
          </div>
        )}

        {showReviewForm && (
          <div style={{ marginBottom: "1.5rem" }}>
            <LeaveReviewForm
              landlordId={id}
              onSuccess={handleReviewSuccess}
            />
            <button onClick={() => setShowReviewForm(false)} style={{ background: "none", border: "none", color: "var(--mist)", fontSize: ".82rem", cursor: "pointer", marginTop: ".8rem" }}>
              Cancel
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "var(--sand)", borderRadius: "8px", color: "var(--mist)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".8rem" }}>⭐</div>
            <p>No reviews yet. Be the first to review this landlord!</p>
          </div>
        ) : (
          <>
            {/* Rating breakdown */}
            <div style={{ background: "var(--white)", border: "1.5px solid var(--fog)", borderRadius: "8px", padding: "1.2rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", fontWeight: 700, color: "var(--canal)", lineHeight: 1 }}>{averageRating}</div>
                <StarRating rating={Math.round(averageRating)} size="1.1rem" />
                <div style={{ fontSize: ".75rem", color: "var(--mist)", marginTop: ".3rem" }}>{totalReviews} reviews</div>
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = totalReviews ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".3rem" }}>
                      <span style={{ fontSize: ".78rem", color: "var(--mist)", width: "30px", textAlign: "right" }}>{star}★</span>
                      <div style={{ flex: 1, height: "6px", background: "var(--fog)", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: "100px", transition: "width .3s" }} />
                      </div>
                      <span style={{ fontSize: ".72rem", color: "var(--mist)", width: "20px" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}  