import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const controller = new PaymentController();

router.post('/create-order', requireAuth, controller.createOrder);
router.post('/verify-payment', requireAuth, controller.verifyPayment);
router.post('/refund', requireAuth, controller.refundPayment);
router.get('/history', requireAuth, controller.getPaymentHistory);
router.get('/all', requireAuth, controller.getAllPayments);

export default router;
