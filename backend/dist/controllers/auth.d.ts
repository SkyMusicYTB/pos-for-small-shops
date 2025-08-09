import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class AuthController {
    private authService;
    constructor();
    static loginValidation: import("express-validator").ValidationChain[];
    static refreshValidation: import("express-validator").ValidationChain[];
    login(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map