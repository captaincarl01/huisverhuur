import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };
  const dashboardLink = user?.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="nav">
        <Link to="/" style={{ textDecoration: "none" }} onClick={close}>
          <div className="nav-logo">Huis<span>Verhuur</span></div>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link to="/listings" onClick={close}>Listings</Link>
          <Link to="/contact" onClick={close}>Contact</Link>
          {user ? (
            <>
              <Link to="/messages" style={{ position: "relative" }} onClick={close}>
                💬 Chat
                {notifications.length > 0 && (
                  <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "var(--tulip)", color: "white", borderRadius: "100px", padding: "0 .4rem", fontSize: ".65rem", fontWeight: 700 }}>
                    {notifications.length}
                  </span>
                )}
              </Link>
              <Link to={dashboardLink} onClick={close}>Dashboard</Link>
              <a onClick={handleLogout} className="nav-cta" style={{ cursor: "pointer" }}>Log Out</a>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close}>Sign In</Link>
              <Link to="/register" className="nav-cta" onClick={close}>Register</Link>
            </>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: ".4rem", flexDirection: "column", gap: "5px" }}
          className="hamburger"
          aria-label="Menu"
        >
          <span style={{ display: "block", width: "22px", height: "2px", background: "var(--white)", borderRadius: "2px", transition: "all .2s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: "var(--white)", borderRadius: "2px", transition: "all .2s", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: "var(--white)", borderRadius: "2px", transition: "all .2s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: "64px", left: 0, right: 0, bottom: 0, background: "var(--canal)", zIndex: 99, display: "flex", flexDirection: "column", padding: "2rem 1.5rem", gap: "0" }}>
          {[
            { to: "/listings", label: "Listings" },
            { to: "/contact",  label: "Contact" },
            ...(user ? [
              { to: "/messages",    label: "💬 Chat" },
              { to: dashboardLink,  label: "Dashboard" },
            ] : [
              { to: "/login",    label: "Sign In" },
              { to: "/register", label: "Register" },
            ]),
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              style={{ color: "var(--white)", textDecoration: "none", fontSize: "1.2rem", fontWeight: 500, padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,.1)" }}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              style={{ marginTop: "1.5rem", background: "var(--tulip)", color: "white", border: "none", padding: ".9rem", borderRadius: "6px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
            >
              Log Out
            </button>
          )}
        </div>
      )}

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 680px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}