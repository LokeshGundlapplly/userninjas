import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const controller = new SubscriptionController();

router.get('/', requireAuth, controller.getSubscription);
router.post('/cancel', requireAuth, controller.cancelSubscription);
router.post('/renew', requireAuth, controller.renewSubscription);
router.get('/all', requireAuth, controller.getAllSubscriptions);

export default router;
