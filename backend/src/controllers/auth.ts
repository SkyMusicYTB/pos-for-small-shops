import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth';
import { AuthenticatedRequest, LoginDto, AppError } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Validation rules
  static loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ];

  static refreshValidation = [
    body('refresh_token').notEmpty().withMessage('Refresh token is required')
  ];

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const loginDto: LoginDto = req.body;
      const authResponse = await this.authService.login(loginDto);

      res.status(200).json({
        success: true,
        data: authResponse,
        message: 'Login successful'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { refresh_token } = req.body;
      const tokens = await this.authService.refreshToken(refresh_token);

      res.status(200).json({
        success: true,
        data: tokens,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const user = await this.authService.getUserById(req.user.user_id);
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // This would be implemented with proper validation
      // For now, return not implemented
      res.status(501).json({
        success: false,
        error: 'Change password not yet implemented'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }
}