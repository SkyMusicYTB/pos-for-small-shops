"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.authRoutes = router;
const authController = new auth_1.AuthController();
// Public routes
router.post('/login', auth_1.AuthController.loginValidation, authController.login.bind(authController));
router.post('/refresh', auth_1.AuthController.refreshValidation, authController.refreshToken.bind(authController));
router.post('/logout', auth_1.AuthController.refreshValidation, authController.logout.bind(authController));
// Protected routes
router.get('/profile', auth_2.authenticate, authController.getProfile.bind(authController));
router.put('/change-password', auth_2.authenticate, authController.changePassword.bind(authController));
//# sourceMappingURL=auth.js.map