const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
        code: 'UNAUTHENTICATED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires [${roles.join(' or ')}] clearance. Your role is '${req.user.role}'.`,
        code: 'FORBIDDEN_INSUFFICIENT_ROLE',
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};

