export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="footer-logo">Huis<span>Verhuur</span></div>
          <p className="footer-tagline">
            Professional rentals across the Netherlands and Germany. Verified landlords, transparent leases.
          </p>
        </div>
        <div className="footer-col">
          <h4>Cities</h4>
          <a>Amsterdam</a><a>Rotterdam</a><a>Frankfurt</a><a>Utrecht</a><a>The Hague</a>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <a>How it works</a><a>For Landlords</a><a>Pricing</a><a>Verified listings</a>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a>Help centre</a><a>Contact</a><a>Privacy policy</a><a>Terms of service</a>
        </div>
      </div>
      <div className="footer-bottom">© 2026 HuisVerhuur B.V. · KvK 12345678 · Amsterdam</div>
    </footer>
  );
}