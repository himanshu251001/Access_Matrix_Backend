import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authController.loginHandler);
router.post('/refresh', authController.refreshTokenHandler);
router.post('/logout', authController.logoutHandler);

export default router;
