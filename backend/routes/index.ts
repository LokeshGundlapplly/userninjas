import { Router } from 'express';
import paymentRoutes from './payment.routes';
import subscriptionRoutes from './subscription.routes';

const router = Router();

router.use('/payment', paymentRoutes);
router.use('/subscription', subscriptionRoutes);

export default router;
