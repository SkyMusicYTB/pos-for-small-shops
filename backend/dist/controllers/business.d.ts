import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class BusinessController {
    private businessService;
    constructor();
    static createValidation: import("express-validator").ValidationChain[];
    static updateValidation: import("express-validator").ValidationChain[];
    static statusValidation: import("express-validator").ValidationChain[];
    createBusiness(req: AuthenticatedRequest, res: Response): Promise<void>;
    getAllBusinesses(req: AuthenticatedRequest, res: Response): Promise<void>;
    getBusinessById(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateBusiness(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteBusiness(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateBusinessStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=business.d.ts.map