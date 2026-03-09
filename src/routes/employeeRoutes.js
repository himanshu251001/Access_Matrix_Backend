import { Router } from 'express';
import { EmployeeController } from '../controllers/employeeController.js';

const router = Router();

router.get('/views', EmployeeController.getAvailableViews);
router.get('/profile', EmployeeController.getProfile);
// Add more routes as needed in Future

export default router;
