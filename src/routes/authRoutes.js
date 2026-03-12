import express from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authController.loginHandler);
router.post('/refresh', authController.refreshTokenHandler);
router.post('/logout', authController.logoutHandler);
router.post('/impersonate', authMiddleware, authController.impersonateHandler);
router.post('/stopImpersonation', authMiddleware, authController.stopImpersonationHandler);

export default router;

