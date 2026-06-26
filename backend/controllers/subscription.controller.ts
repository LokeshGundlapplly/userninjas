import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { EmailService } from '../services/email.service';
import { cancelSubscriptionSchema, renewSubscriptionSchema } from '../validators/subscription.validator';
import { PLANS } from '../config/constants';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

const subRepo = new SubscriptionRepository();
const profileRepo = new ProfileRepository();
const emailService = new EmailService();

export class SubscriptionController {
  async getSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const subscription = await subRepo.getSubscriptionByUserId(userId);
      if (!subscription) {
        // Return active default Free Plan
        return res.status(200).json({
          status: 'success',
          data: {
            plan_name: 'free',
            status: 'active',
            cancel_at_period_end: false,
          }
        });
      }

      return res.status(200).json({
        status: 'success',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId || !userEmail) throw new UnauthorizedError();

      const validation = cancelSubscriptionSchema.safeParse(req.body);
      const cancelAtPeriodEnd = validation.success ? validation.data.cancelAtPeriodEnd : true;

      const sub = await subRepo.getSubscriptionByUserId(userId);
      if (!sub) throw new NotFoundError('No active subscription found');

      const updatedSub = await subRepo.cancelSubscriptionAtPeriodEnd(userId, cancelAtPeriodEnd);
      
      const planDetails = PLANS[sub.plan_name] || PLANS.free;

      emailService.sendSubscriptionCancelled(userEmail, {
        planName: planDetails.name,
        expiryDate: sub.expiry_date || sub.end_date,
      }).catch(err => logger.error('Error sending cancel email:', err));

      return res.status(200).json({
        status: 'success',
        message: cancelAtPeriodEnd 
          ? 'Auto-renewal has been cancelled. Subscription remains active until period end.'
          : 'Auto-renewal reactivated.',
        data: updatedSub,
      });
    } catch (error) {
      next(error);
    }
  }

  async renewSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId || !userEmail) throw new UnauthorizedError();

      const validation = renewSubscriptionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new BadRequestError(validation.error.errors[0].message);
      }

      const { planName } = validation.data;
      const planDetails = PLANS[planName];
      if (!planDetails) throw new BadRequestError('Invalid plan selected');

      // For a real system, you would check payment authorization or credit balances.
      // Here, if it's "free" or if they are testing renewals, we can update it directly
      // otherwise subscriptions are activated via the Payment verification/webhook flow.
      if (planName === 'free') {
        const sub = await subRepo.upsertSubscription({
          user_id: userId,
          plan_name: 'free',
          status: 'active',
          start_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        });
        await profileRepo.deactivateProfileSubscription(userId);
        return res.status(200).json({ status: 'success', data: sub });
      }

      throw new BadRequestError('Paid subscription renewals require completing checkout via payment gateway.');
    } catch (error) {
      next(error);
    }
  }
  
  async getAllSubscriptions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const profile = await profileRepo.getProfileByUserId(userId);
      if (profile?.role !== 'admin') {
        throw new ForbiddenError('Admin privileges required');
      }

      const subscriptions = await subRepo.getAllSubscriptions();
      return res.status(200).json({
        status: 'success',
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Helper to inject standard ForbiddenError if not imported
class ForbiddenError extends Error {
  statusCode = 403;
  constructor(msg = 'Forbidden') {
    super(msg);
  }
}
