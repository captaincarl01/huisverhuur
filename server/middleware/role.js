// Only allow landlords
const landlordOnly = (req, res, next) => {
  if (req.user && req.user.role === "landlord") {
    return next();
  }
  return res.status(403).json({ message: "Access denied — landlords only" });
};

// Only allow tenants
const tenantOnly = (req, res, next) => {
  if (req.user && req.user.role === "tenant") {
    return next();
  }
  return res.status(403).json({ message: "Access denied — tenants only" });
};

module.exports = { landlordOnly, tenantOnly };