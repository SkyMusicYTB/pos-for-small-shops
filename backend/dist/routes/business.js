"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessRoutes = void 0;
const express_1 = require("express");
const business_1 = require("../controllers/business");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.businessRoutes = router;
const businessController = new business_1.BusinessController();
// All routes require authentication
router.use(auth_1.authenticate);
// Super admin only routes
router.post('/', (0, auth_1.requireRole)(['super_admin']), business_1.BusinessController.createValidation, businessController.createBusiness.bind(businessController));
router.get('/', (0, auth_1.requireRole)(['super_admin']), businessController.getAllBusinesses.bind(businessController));
router.get('/:id', (0, auth_1.requireRole)(['super_admin', 'owner']), businessController.getBusinessById.bind(businessController));
router.put('/:id', (0, auth_1.requireRole)(['super_admin', 'owner']), business_1.BusinessController.updateValidation, businessController.updateBusiness.bind(businessController));
router.delete('/:id', (0, auth_1.requireRole)(['super_admin']), businessController.deleteBusiness.bind(businessController));
router.patch('/:id/status', (0, auth_1.requireRole)(['super_admin']), business_1.BusinessController.statusValidation, businessController.updateBusinessStatus.bind(businessController));
//# sourceMappingURL=business.js.map