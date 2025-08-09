"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.checkBusinessPermission = exports.requireBusinessAccess = exports.requireAnyRole = exports.requireManagerOrAbove = exports.requireOwnerOrAbove = exports.requireSuperAdmin = exports.requireRole = exports.authenticate = void 0;
const types_1 = require("../types");
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    try {
        const token = jwt_1.JWTUtils.getTokenFromHeader(req.headers.authorization);
        if (!token) {
            throw new types_1.AppError('Access token is required', 401);
        }
        const payload = jwt_1.JWTUtils.verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof types_1.AppError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(401).json({
                success: false,
                error: 'Authentication failed'
            });
        }
    }
};
exports.authenticate = authenticate;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new types_1.AppError('Authentication required', 401);
            }
            if (!allowedRoles.includes(req.user.role)) {
                throw new types_1.AppError('Insufficient permissions', 403);
            }
            next();
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(403).json({
                    success: false,
                    error: 'Authorization failed'
                });
            }
        }
    };
};
exports.requireRole = requireRole;
exports.requireSuperAdmin = (0, exports.requireRole)(['super_admin']);
exports.requireOwnerOrAbove = (0, exports.requireRole)(['super_admin', 'owner']);
exports.requireManagerOrAbove = (0, exports.requireRole)(['super_admin', 'owner', 'manager']);
exports.requireAnyRole = (0, exports.requireRole)(['super_admin', 'owner', 'manager', 'cashier']);
// Middleware to check if user belongs to the business (tenant isolation)
const requireBusinessAccess = (req, res, next) => {
    try {
        if (!req.user) {
            throw new types_1.AppError('Authentication required', 401);
        }
        // Super admin can access any business
        if (req.user.role === 'super_admin') {
            next();
            return;
        }
        // Extract business_id from request parameters or body
        const businessId = req.params.business_id || req.body.business_id;
        if (!businessId) {
            throw new types_1.AppError('Business ID is required', 400);
        }
        // Check if user belongs to the requested business
        if (req.user.business_id !== businessId) {
            throw new types_1.AppError('Access denied to this business', 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof types_1.AppError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(403).json({
                success: false,
                error: 'Business access check failed'
            });
        }
    }
};
exports.requireBusinessAccess = requireBusinessAccess;
// Middleware to check specific permissions within a business
const checkBusinessPermission = (requiredRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new types_1.AppError('Authentication required', 401);
            }
            // Super admin always has access
            if (req.user.role === 'super_admin') {
                next();
                return;
            }
            // Check role hierarchy
            const roleHierarchy = {
                'cashier': 1,
                'manager': 2,
                'owner': 3,
                'super_admin': 4
            };
            const userLevel = roleHierarchy[req.user.role];
            const requiredLevel = roleHierarchy[requiredRole];
            if (userLevel < requiredLevel) {
                throw new types_1.AppError(`${requiredRole} role or higher required`, 403);
            }
            next();
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(403).json({
                    success: false,
                    error: 'Permission check failed'
                });
            }
        }
    };
};
exports.checkBusinessPermission = checkBusinessPermission;
// Optional authentication (doesn't fail if no token provided)
const optionalAuth = (req, res, next) => {
    try {
        const token = jwt_1.JWTUtils.getTokenFromHeader(req.headers.authorization);
        if (token) {
            const payload = jwt_1.JWTUtils.verifyAccessToken(token);
            req.user = payload;
        }
        next();
    }
    catch (error) {
        // For optional auth, we continue even if token is invalid
        // but we don't set req.user
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map