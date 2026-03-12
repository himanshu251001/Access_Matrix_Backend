import { Router } from 'express';
import { EmployeeController } from '../controllers/employeeController.js';

const router = Router();

router.get('/views', EmployeeController.getAvailableViews);
router.get('/profile', EmployeeController.getProfile);
router.get('/search', EmployeeController.searchEmployees);

export default router;
