const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'resolvehub_super_secret_jwt_key_2026_vignan';

/**
 * Verify JWT token from Authorization header (Bearer <token>)
 */
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-access-token'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Access token missing or invalid'
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Access token missing or invalid'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired access token'
    });
  }
}

/**
 * Enforce role-based access control (RBAC)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient role permissions for this action'
      });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET
};
