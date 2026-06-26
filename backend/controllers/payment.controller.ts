import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PaymentRepository } from '../repositories/payment.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { RazorpayService } from '../services/razorpay.service';
import { EmailService } from '../services/email.service';
import { createOrderSchema, verifyPaymentSchema, refundSchema } from '../validators/payment.validator';
import { PLANS } from '../config/constants';
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

const paymentRepo = new PaymentRepository();
const subRepo = new SubscriptionRepository();
const profileRepo = new ProfileRepository();
const razorpayService = new RazorpayService();
const emailService = new EmailService();

export class PaymentController {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const validation = createOrderSchema.safeParse(req.body);
      if (!validation.success) {
        throw new BadRequestError(validation.error.errors[0].message);
      }

      const { planName, amount } = validation.data;
      let orderAmount = amount;

      if (planName) {
        const plan = PLANS[planName];
        if (!plan) throw new BadRequestError('Invalid subscription plan selected');
        orderAmount = plan.priceINR;
      }

      if (!orderAmount || orderAmount <= 0) {
        throw new BadRequestError('Valid amount or plan name is required');
      }

      // Create order with Razorpay
      const rzpOrder = await razorpayService.createOrder(orderAmount, 'INR');

      // Save order in database
      const dbOrder = await paymentRepo.createOrder(userId, rzpOrder.id, orderAmount, 'INR', planName);

      return res.status(200).json({
        status: 'success',
        orderId: dbOrder.id,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId || !userEmail) throw new UnauthorizedError();

      const validation = verifyPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        throw new BadRequestError(validation.error.errors[0].message);
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

      // Check signature
      const isSignatureValid = razorpayService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isSignatureValid) {
        throw new BadRequestError('Invalid signature. Payment tampering suspected.');
      }

      // Check order in DB
      const dbOrder = await paymentRepo.getOrderByRazorpayId(razorpay_order_id);
      if (!dbOrder) {
        throw new NotFoundError('Associated order record not found');
      }

      if (dbOrder.user_id !== userId) {
        throw new ForbiddenError('Order belongs to another user session');
      }

      // If already processed, return success
      if (dbOrder.status === 'paid') {
        return res.status(200).json({ status: 'success', message: 'Payment already processed and active.' });
      }

      // Fetch payment details to verify amount and get method
      const rzpPayment = await razorpayService.getPaymentDetails(razorpay_payment_id);
      
      // Update order status
      await paymentRepo.updateOrderStatus(dbOrder.id, 'paid');

      // Create Payment Record
      const paymentRecord = await paymentRepo.createPaymentRecord({
        user_id: userId,
        order_id: dbOrder.id,
        gateway: 'razorpay',
        razorpay_payment_id,
        razorpay_signature,
        amount: Number(dbOrder.amount),
        currency: dbOrder.currency,
        status: 'successful',
        payment_method: rzpPayment.method,
        captured: rzpPayment.status === 'captured',
        description: `Upgraded via secure checkout (Payment: ${razorpay_payment_id})`
      });

      if (dbOrder.plan_name) {
        // Activate Subscription
        const planName = dbOrder.plan_name;
        const planDetails = PLANS[planName];
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(startDate.getDate() + (planDetails.days || 30));

        const sub = await subRepo.upsertSubscription({
          user_id: userId,
          plan_name: planName,
          status: 'active',
          start_date: startDate.toISOString(),
          expiry_date: expiryDate.toISOString(),
          renewal_date: expiryDate.toISOString(),
          cancel_at_period_end: false
        });

        // Update Profile limits & roles
        await profileRepo.updateProfileSubscription(
          userId,
          planName,
          planDetails.testLimit,
          expiryDate.toISOString()
        );

        // Send Email Notifications async
        emailService.sendPaymentSuccess(userEmail, {
          amount: Number(dbOrder.amount),
          planName: planDetails.name,
          orderId: dbOrder.razorpay_order_id,
        }).catch(err => logger.error('Error sending success email:', err));

        emailService.sendSubscriptionActivated(userEmail, {
          planName: planDetails.name,
          expiryDate: expiryDate.toISOString(),
        }).catch(err => logger.error('Error sending activation email:', err));

        return res.status(200).json({
          status: 'success',
          message: 'Payment verified and subscription activated successfully',
          subscription: sub,
        });
      } else {
        // Wallet Credits Top-up
        const { data: userProfile } = await supabaseAdmin.from('profiles').select('wallet_balance').eq('user_id', userId).single();
        const currentBalance = userProfile?.wallet_balance || 0;
        await profileRepo.updateWalletBalance(userId, currentBalance + Number(dbOrder.amount));

        // Send confirmation email
        emailService.sendPaymentSuccess(userEmail, {
          amount: Number(dbOrder.amount),
          planName: 'Wallet Credits Top-up',
          orderId: dbOrder.razorpay_order_id,
        }).catch(err => logger.error('Error sending success email:', err));

        return res.status(200).json({
          status: 'success',
          message: `Payment verified and ₹${dbOrder.amount} added to your wallet balance.`,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const history = await paymentRepo.getPaymentsByUserId(userId);
      return res.status(200).json({
        status: 'success',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      // Check if user is admin
      const profile = await profileRepo.getProfileByUserId(userId);
      if (profile?.role !== 'admin') {
        throw new ForbiddenError('Admin privileges required');
      }

      const payments = await paymentRepo.getAllPayments();
      return res.status(200).json({
        status: 'success',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      // Check if admin
      const profile = await profileRepo.getProfileByUserId(userId);
      if (profile?.role !== 'admin') {
        throw new ForbiddenError('Admin privileges required');
      }

      const validation = refundSchema.safeParse(req.body);
      if (!validation.success) {
        throw new BadRequestError(validation.error.errors[0].message);
      }

      const { paymentId, amount } = validation.data;

      // Look up payment record in DB by database UUID first, then fallback to razorpay_payment_id
      let paymentRecord: any = null;
      
      const { data: byUuid } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .maybeSingle();

      if (byUuid) {
        paymentRecord = byUuid;
      } else {
        const { data: byRzp } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('razorpay_payment_id', paymentId)
          .maybeSingle();
        paymentRecord = byRzp;
      }

      if (!paymentRecord) {
        throw new NotFoundError('Payment record not found');
      }

      // Check if already refunded
      if (paymentRecord.status === 'refunded') {
        throw new BadRequestError('This transaction has already been refunded.');
      }

      const refundAmount = amount || Number(paymentRecord.amount);

      if (paymentRecord.gateway !== 'razorpay') {
        // Create manual refund record in payments
        await paymentRepo.createPaymentRecord({
          user_id: paymentRecord.user_id,
          order_id: null,
          gateway: paymentRecord.gateway || 'manual',
          razorpay_payment_id: `REFUND-${paymentRecord.id.slice(0, 8)}-${Date.now()}`,
          razorpay_signature: `REFUND-MANUAL-${Date.now()}`,
          amount: refundAmount,
          currency: paymentRecord.currency,
          status: 'refunded',
          payment_method: 'refund',
          captured: true,
          description: `Refund completed manually for payment ID: ${paymentRecord.id}`
        });

        // Demote subscription or subtract wallet balance
        if (paymentRecord.plan_type) {
          await subRepo.updateSubscriptionStatus(paymentRecord.user_id, 'refunded');
          await profileRepo.deactivateProfileSubscription(paymentRecord.user_id);
        } else {
          // Wallet refund
          const { data: userProfile } = await supabaseAdmin.from('profiles').select('wallet_balance').eq('user_id', paymentRecord.user_id).single();
          const currentBalance = userProfile?.wallet_balance || 0;
          await profileRepo.updateWalletBalance(paymentRecord.user_id, Math.max(0, currentBalance - refundAmount));
        }

        // Get user profile email
        const { data: targetProfile } = await supabaseAdmin.from('profiles').select('email').eq('user_id', paymentRecord.user_id).maybeSingle();
        if (targetProfile?.email) {
          emailService.sendRefundConfirmation(targetProfile.email, {
            amount: refundAmount,
            paymentId: paymentRecord.id
          }).catch(err => logger.error('Error sending manual refund email:', err));
        }

        // Update original payment status to refunded
        await paymentRepo.updatePaymentStatus(paymentRecord.id, 'refunded', true);

        return res.status(200).json({
          status: 'success',
          message: 'Manual payment successfully marked as refunded',
        });
      }

      // Trigger refund in Razorpay
      const rzpRefund = await razorpayService.refundPayment(paymentRecord.razorpay_payment_id, refundAmount);

      // Add a refund record in payments
      await paymentRepo.createPaymentRecord({
        user_id: paymentRecord.user_id,
        order_id: null,
        gateway: 'razorpay',
        razorpay_payment_id: rzpRefund.id,
        razorpay_signature: `REFUND-${rzpRefund.id}`,
        amount: Number(rzpRefund.amount) / 100, // convert back to rupees
        currency: rzpRefund.currency,
        status: 'refunded',
        payment_method: 'refund',
        captured: true,
        description: `Refund completed for payment ID: ${paymentRecord.razorpay_payment_id}`
      });

      // Update original payment status to refunded
      await paymentRepo.updatePaymentStatus(paymentRecord.id, 'refunded', true);

      // Demote subscription or subtract wallet balance
      if (paymentRecord.plan_type) {
        await subRepo.updateSubscriptionStatus(paymentRecord.user_id, 'refunded');
        await profileRepo.deactivateProfileSubscription(paymentRecord.user_id);
      } else {
        // Wallet refund
        const { data: userProfile } = await supabaseAdmin.from('profiles').select('wallet_balance').eq('user_id', paymentRecord.user_id).single();
        const currentBalance = userProfile?.wallet_balance || 0;
        await profileRepo.updateWalletBalance(paymentRecord.user_id, Math.max(0, currentBalance - refundAmount));
      }

      // Notify user
      const { data: targetProfile } = await supabaseAdmin.from('profiles').select('email').eq('user_id', paymentRecord.user_id).maybeSingle();
      if (targetProfile?.email) {
        emailService.sendRefundConfirmation(targetProfile.email, {
          amount: refundAmount,
          paymentId: paymentRecord.razorpay_payment_id
        }).catch(err => logger.error('Error sending refund confirmation email:', err));
      }

      return res.status(200).json({
        status: 'success',
        message: 'Refund successfully completed',
        refundId: rzpRefund.id,
      });
    } catch (error) {
      next(error);
    }
  }
}
