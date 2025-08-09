import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole, AppError } from '../types';
import { JWTUtils } from '../utils/jwt';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = JWTUtils.getTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    const payload = JWTUtils.verifyAccessToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(403).json({
          success: false,
          error: 'Authorization failed'
        });
      }
    }
  };
};

export const requireSuperAdmin = requireRole(['super_admin']);

export const requireOwnerOrAbove = requireRole(['super_admin', 'owner']);

export const requireManagerOrAbove = requireRole(['super_admin', 'owner', 'manager']);

export const requireAnyRole = requireRole(['super_admin', 'owner', 'manager', 'cashier']);

// Middleware to check if user belongs to the business (tenant isolation)
export const requireBusinessAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Super admin can access any business
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    // Extract business_id from request parameters or body
    const businessId = req.params.business_id || req.body.business_id;
    
    if (!businessId) {
      throw new AppError('Business ID is required', 400);
    }

    // Check if user belongs to the requested business
    if (req.user.business_id !== businessId) {
      throw new AppError('Access denied to this business', 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(403).json({
        success: false,
        error: 'Business access check failed'
      });
    }
  }
};

// Middleware to check specific permissions within a business
export const checkBusinessPermission = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Super admin always has access
      if (req.user.role === 'super_admin') {
        next();
        return;
      }

      // Check role hierarchy
      const roleHierarchy: Record<UserRole, number> = {
        'cashier': 1,
        'manager': 2,
        'owner': 3,
        'super_admin': 4
      };

      const userLevel = roleHierarchy[req.user.role];
      const requiredLevel = roleHierarchy[requiredRole];

      if (userLevel < requiredLevel) {
        throw new AppError(`${requiredRole} role or higher required`, 403);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(403).json({
          success: false,
          error: 'Permission check failed'
        });
      }
    }
  };
};

// Optional authentication (doesn't fail if no token provided)
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = JWTUtils.getTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = JWTUtils.verifyAccessToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // For optional auth, we continue even if token is invalid
    // but we don't set req.user
    next();
  }
};