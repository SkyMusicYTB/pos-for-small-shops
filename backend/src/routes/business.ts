import { Router } from 'express';
import { BusinessController } from '../controllers/business';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const businessController = new BusinessController();

// All routes require authentication
router.use(authenticate);

// Super admin only routes
router.post('/', 
  requireRole(['super_admin']),
  BusinessController.createValidation,
  businessController.createBusiness.bind(businessController)
);

router.get('/', 
  requireRole(['super_admin']),
  businessController.getAllBusinesses.bind(businessController)
);

router.get('/:id', 
  requireRole(['super_admin', 'owner']),
  businessController.getBusinessById.bind(businessController)
);

router.put('/:id', 
  requireRole(['super_admin', 'owner']),
  BusinessController.updateValidation,
  businessController.updateBusiness.bind(businessController)
);

router.delete('/:id', 
  requireRole(['super_admin']),
  businessController.deleteBusiness.bind(businessController)
);

router.patch('/:id/status', 
  requireRole(['super_admin']),
  BusinessController.statusValidation,
  businessController.updateBusinessStatus.bind(businessController)
);

export { router as businessRoutes };