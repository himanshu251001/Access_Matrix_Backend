import { Router } from 'express';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { getAllRecords } from '../controllers/organizationController.js';

const router = Router();

router.use(roleMiddleware);

// Endpoint: GET /api/organization?view=<type>
router.get('/', getAllRecords);

export default router;
