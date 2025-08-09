import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { BusinessService } from '../services/business';
import { AuthenticatedRequest, AppError } from '../types';

export class BusinessController {
  private businessService: BusinessService;

  constructor() {
    this.businessService = new BusinessService();
  }

  // Validation rules
  static createValidation = [
    body('name').isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
    body('owner_name').isLength({ min: 2, max: 100 }).withMessage('Owner name must be 2-100 characters'),
    body('owner_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('currency').isIn(['USD', 'EUR', 'GBP', 'CAD']).withMessage('Invalid currency'),
    body('timezone').notEmpty().withMessage('Timezone is required'),
  ];

  static updateValidation = [
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD']).withMessage('Invalid currency'),
    body('timezone').optional().notEmpty().withMessage('Timezone cannot be empty'),
  ];

  static statusValidation = [
    body('status').isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
  ];

  async createBusiness(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const business = await this.businessService.createBusiness(req.body);
      
      res.status(201).json({
        success: true,
        data: business,
        message: 'Business created successfully'
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
          error: 'Failed to create business'
        });
      }
    }
  }

  async getAllBusinesses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const businesses = await this.businessService.getAllBusinesses();
      
      res.status(200).json({
        success: true,
        data: businesses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch businesses'
      });
    }
  }

  async getBusinessById(req: AuthenticatedRequest, res: Response): Promise<void> {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch business'
      });
    }
  }

  async updateBusiness(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { id } = req.params;
      const business = await this.businessService.updateBusiness(id, req.body);
      
      res.status(200).json({
        success: true,
        data: business,
        message: 'Business updated successfully'
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
          error: 'Failed to update business'
        });
      }
    }
  }

  async deleteBusiness(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.businessService.deleteBusiness(id);
      
      res.status(200).json({
        success: true,
        message: 'Business deleted successfully'
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
          error: 'Failed to delete business'
        });
      }
    }
  }

  async updateBusinessStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { id } = req.params;
      const { status } = req.body;
      
      const business = await this.businessService.updateBusinessStatus(id, status);
      
      res.status(200).json({
        success: true,
        data: business,
        message: 'Business status updated successfully'
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
          error: 'Failed to update business status'
        });
      }
    }
  }
}