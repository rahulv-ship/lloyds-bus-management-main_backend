const jwt = require("jsonwebtoken");

// Verifies the Bearer token issued by the login endpoint and exposes its
// payload to subsequent handlers (for example, authController.getMe).
const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    const message = error.name === "TokenExpiredError"
      ? "Authentication token has expired"
      : "Invalid authentication token";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

// Restricts an already-authenticated request to one of the supplied roles.
// Usage: authorize("ADMIN") or authorize("ADMIN", "HR").
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required",
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource",
    });
  }

  return next();
};

module.exports = {
  authenticate,
  authorize,
};
