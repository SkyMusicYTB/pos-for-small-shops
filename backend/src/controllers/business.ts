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
    body('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
  ];

  async createBusiness(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('=== CREATE BUSINESS REQUEST ===');
      console.log('Request body:', req.body);
      console.log('User:', req.user);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      console.log('Validation passed, creating business...');
      const business = await this.businessService.createBusiness(req.body);
      console.log('Business created:', business);
      
      res.status(201).json({
        success: true,
        data: business,
        message: 'Business created successfully'
      });
    } catch (error) {
      console.error('Error in createBusiness controller:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create business',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  async getAllBusinesses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('=== GET ALL BUSINESSES REQUEST ===');
      console.log('User:', req.user);

      const businesses = await this.businessService.getAllBusinesses();
      console.log('Businesses fetched:', businesses);
      
      res.status(200).json({
        success: true,
        data: businesses
      });
    } catch (error) {
      console.error('Error in getAllBusinesses controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch businesses',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBusinessById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('=== GET BUSINESS BY ID ===', id);
      
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
      console.error('Error in getBusinessById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch business',
        details: error instanceof Error ? error.message : 'Unknown error'
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
      console.log('=== UPDATE BUSINESS ===', id, req.body);
      
      const business = await this.businessService.updateBusiness(id, req.body);
      
      res.status(200).json({
        success: true,
        data: business,
        message: 'Business updated successfully'
      });
    } catch (error) {
      console.error('Error in updateBusiness controller:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update business',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  async deleteBusiness(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('=== DELETE BUSINESS ===', id);
      
      await this.businessService.deleteBusiness(id);
      
      res.status(200).json({
        success: true,
        message: 'Business deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteBusiness controller:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete business',
          details: error instanceof Error ? error.message : 'Unknown error'
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
      console.log('=== UPDATE BUSINESS STATUS ===', id, status);
      
      const business = await this.businessService.updateBusinessStatus(id, status);
      
      res.status(200).json({
        success: true,
        data: business,
        message: 'Business status updated successfully'
      });
    } catch (error) {
      console.error('Error in updateBusinessStatus controller:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update business status',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
}