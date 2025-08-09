import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireOwnerOrAbove: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireManagerOrAbove: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAnyRole: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireBusinessAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const checkBusinessPermission: (requiredRole: UserRole) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map