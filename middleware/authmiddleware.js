const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT and check user roles.
 * @param {Array<string>} requiredRoles - Roles required to access the route.
 * @returns {Function} Middleware function.
 */
const verifyToken = (requiredRoles = []) => {
  return (req, res, next) => {
    const token =
      req.cookies.token ||
      req.headers['authorization']?.split(' ')[1] ||
      req.query.token;
console.log("requested token",token);

    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const message =
          err.name === 'TokenExpiredError'
            ? "Session expired. Please log in again."
            : "Invalid token.";
        return res.status(401).json({ message });
      }

      req.user = decoded; // Attach user info to the request object
 console.log("decoded",decoded);

      // Ensure the user's roles match at least one of the required roles
      const userRoles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
      // console.log(userRoles);
      // console.log(requiredRoles);
      

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.some(role => userRoles.includes(role))
      ) {
        console.log(decoded.roles);
        
        console.log("Access Denied: Insufficient permissions.");
        return res
          .status(403)
          .json({ message: "Access denied. Insufficient permissions." });
      }

      next(); // Proceed to the next middleware or route handler
    });
  };
};

module.exports = verifyToken;
