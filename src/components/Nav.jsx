import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  const dashboardLink = user?.role === "landlord"
    ? "/landlord/dashboard"
    : "/tenant/dashboard";

  return (
    <nav className="nav">
      <Link to="/" style={{ textDecoration: "none" }}>
        <div className="nav-logo">Huis<span>Verhuur</span></div>
      </Link>
      <div className="nav-links">
        <Link to="/listings">Listings</Link>
        <Link to="/contact">Contact</Link>
        {user ? (
          <>
            <Link to="/messages" style={{ position: "relative" }}>
              💬 Chat
              {notifications.length > 0 && (
                <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "var(--tulip)", color: "white", borderRadius: "100px", padding: "0 .4rem", fontSize: ".65rem", fontWeight: 700 }}>
                  {notifications.length}
                </span>
              )}
            </Link>
            <Link to={dashboardLink}>Dashboard</Link>
            <a onClick={handleLogout} className="nav-cta" style={{ cursor: "pointer" }}>
              Log Out
            </a>
          </>
        ) : (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="nav-cta">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}