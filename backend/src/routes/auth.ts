import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', 
  AuthController.loginValidation,
  authController.login.bind(authController)
);

router.post('/refresh',
  AuthController.refreshValidation,
  authController.refreshToken.bind(authController)
);

router.post('/logout',
  AuthController.refreshValidation,
  authController.logout.bind(authController)
);

// Protected routes
router.get('/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

router.put('/change-password',
  authenticate,
  authController.changePassword.bind(authController)
);

export { router as authRoutes };