import { Router } from 'express';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { getAllRecords, getTeams } from '../controllers/organizationController.js';

const router = Router();


router.get('/', getAllRecords);
router.get('/teams', roleMiddleware(), getTeams);

export default router;
