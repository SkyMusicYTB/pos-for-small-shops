"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_1 = require("../services/auth");
const types_1 = require("../types");
class AuthController {
    constructor() {
        this.authService = new auth_1.AuthService();
    }
    async login(req, res) {
        try {
            // Check validation results
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const loginDto = req.body;
            const authResponse = await this.authService.login(loginDto);
            res.status(200).json({
                success: true,
                data: authResponse,
                message: 'Login successful'
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
                    error: 'Internal server error'
                });
            }
        }
    }
    async refreshToken(req, res) {
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
            const { refresh_token } = req.body;
            const tokens = await this.authService.refreshAccessToken(refresh_token);
            res.status(200).json({
                success: true,
                data: tokens,
                message: 'Token refreshed successfully'
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
                    error: 'Internal server error'
                });
            }
        }
    }
    async logout(req, res) {
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
            const { refresh_token } = req.body;
            await this.authService.logout(refresh_token);
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
    }
    async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const user = await this.authService.validateUser(req.user.user_id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
                return;
            }
            const { password_hash, ...userProfile } = user;
            res.status(200).json({
                success: true,
                data: userProfile
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch profile'
            });
        }
    }
    async changePassword(req, res) {
        try {
            // This would be implemented with proper validation
            // For now, return not implemented
            res.status(501).json({
                success: false,
                error: 'Change password not yet implemented'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to change password'
            });
        }
    }
}
exports.AuthController = AuthController;
// Validation rules
AuthController.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
AuthController.refreshValidation = [
    (0, express_validator_1.body)('refresh_token').notEmpty().withMessage('Refresh token is required')
];
//# sourceMappingURL=auth.js.map