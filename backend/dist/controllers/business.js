"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessController = void 0;
const express_validator_1 = require("express-validator");
const business_1 = require("../services/business");
const types_1 = require("../types");
class BusinessController {
    constructor() {
        this.businessService = new business_1.BusinessService();
    }
    async createBusiness(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const business = await this.businessService.createBusiness(req.body);
            res.status(201).json({
                success: true,
                data: business,
                message: 'Business created successfully'
            });
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to create business'
                });
            }
        }
    }
    async getAllBusinesses(req, res) {
        try {
            const businesses = await this.businessService.getAllBusinesses();
            res.status(200).json({
                success: true,
                data: businesses
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch businesses'
            });
        }
    }
    async getBusinessById(req, res) {
        try {
            const { id } = req.params;
            const business = await this.businessService.getBusinessById(id);
            if (!business) {
                res.status(404).json({
                    success: false,
                    error: 'Business not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: business
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch business'
            });
        }
    }
    async updateBusiness(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { id } = req.params;
            const business = await this.businessService.updateBusiness(id, req.body);
            res.status(200).json({
                success: true,
                data: business,
                message: 'Business updated successfully'
            });
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to update business'
                });
            }
        }
    }
    async deleteBusiness(req, res) {
        try {
            const { id } = req.params;
            await this.businessService.deleteBusiness(id);
            res.status(200).json({
                success: true,
                message: 'Business deleted successfully'
            });
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete business'
                });
            }
        }
    }
    async updateBusinessStatus(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { id } = req.params;
            const { status } = req.body;
            const business = await this.businessService.updateBusinessStatus(id, status);
            res.status(200).json({
                success: true,
                data: business,
                message: 'Business status updated successfully'
            });
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to update business status'
                });
            }
        }
    }
}
exports.BusinessController = BusinessController;
// Validation rules
BusinessController.createValidation = [
    (0, express_validator_1.body)('name').isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
    (0, express_validator_1.body)('owner_name').isLength({ min: 2, max: 100 }).withMessage('Owner name must be 2-100 characters'),
    (0, express_validator_1.body)('owner_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('currency').isIn(['USD', 'EUR', 'GBP', 'CAD']).withMessage('Invalid currency'),
    (0, express_validator_1.body)('timezone').notEmpty().withMessage('Timezone is required'),
];
BusinessController.updateValidation = [
    (0, express_validator_1.body)('name').optional().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
    (0, express_validator_1.body)('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD']).withMessage('Invalid currency'),
    (0, express_validator_1.body)('timezone').optional().notEmpty().withMessage('Timezone cannot be empty'),
];
BusinessController.statusValidation = [
    (0, express_validator_1.body)('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
];
//# sourceMappingURL=business.js.map