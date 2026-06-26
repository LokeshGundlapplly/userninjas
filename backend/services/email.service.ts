import { Resend } from 'resend';
import { RESEND_API_KEY, FRONTEND_URL } from '../config/constants';
import { logger } from '../utils/logger';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!resend) {
  logger.warn('RESEND_API_KEY is not defined. Email notifications will be logged to console instead of sent.');
}

export class EmailService {
  private async sendEmail(to: string, subject: string, html: string) {
    try {
      if (!resend) {
        logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return { id: 'mock-id' };
      }

      const response = await resend.emails.send({
        from: 'UserNinjas Billing <billing@userninjas.in>',
        to: [to],
        subject,
        html,
      });

      if (response.error) {
        logger.error(`Resend failed to send email to ${to}:`, response.error);
        return null;
      }

      logger.info(`Email successfully sent to ${to}, Email ID: ${response.data?.id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return null;
    }
  }

  async sendPaymentSuccess(to: string, paymentDetails: { amount: number; planName: string; orderId: string }) {
    const subject = 'Your UserNinjas Payment was Successful! 🎉';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Payment Received!</h2>
        <p>Hi there,</p>
        <p>Thank you for your payment. Your transaction has been successfully processed.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Plan Purchased:</strong> ${paymentDetails.planName}</p>
          <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
          <p><strong>Order ID:</strong> ${paymentDetails.orderId}</p>
        </div>
        <p>Your subscription is now active. You can manage your subscription settings and view invoices under your Billing tab.</p>
        <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">Go to Dashboard</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">UserNinjas Technologies Pvt. Ltd., HITEC City, Hyderabad, India</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendPaymentFailed(to: string, details: { amount: number; planName: string; errorReason?: string }) {
    const subject = 'Action Required: Your UserNinjas Payment Failed ⚠️';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ef4444;">Payment Failed</h2>
        <p>Hi there,</p>
        <p>We attempted to charge your card for the <strong>${details.planName}</strong> plan, but the transaction could not be completed.</p>
        ${details.errorReason ? `<p><strong>Reason:</strong> ${details.errorReason}</p>` : ''}
        <p>No worries! You can try checkout again by visiting the Pricing page in your dashboard.</p>
        <a href="${FRONTEND_URL}/recruiter#payments" style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">Retry Payment</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">UserNinjas Technologies Pvt. Ltd.</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendSubscriptionActivated(to: string, details: { planName: string; expiryDate: string }) {
    const subject = 'Welcome to UserNinjas Premium! 🚀';
    const expiry = new Date(details.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Subscription Activated!</h2>
        <p>Hi there,</p>
        <p>Your subscription to the <strong>${details.planName}</strong> plan is now active!</p>
        <p>You have unlocked premium features including unlimited studies, AI-moderated interviews, detailed research reports, and priority developer support.</p>
        <p><strong>Next Renewal Date:</strong> ${expiry}</p>
        <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">Access Premium Features</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">UserNinjas Technologies Pvt. Ltd.</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendSubscriptionCancelled(to: string, details: { planName: string; expiryDate: string }) {
    const subject = 'Your UserNinjas Subscription Cancellation Confirmation';
    const expiry = new Date(details.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2>Subscription Cancelled</h2>
        <p>Hi there,</p>
        <p>We are writing to confirm that you have turned off auto-renewal for your <strong>${details.planName}</strong> subscription.</p>
        <p>Your premium features will remain fully unlocked until the end of your billing cycle on <strong>${expiry}</strong>, after which your account will revert to the Free tier.</p>
        <p>If you did this by mistake, you can easily renew your plan before it expires.</p>
        <a href="${FRONTEND_URL}/recruiter#payments" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">Reactivate Subscription</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">UserNinjas Technologies Pvt. Ltd.</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendRefundConfirmation(to: string, details: { amount: number; paymentId: string }) {
    const subject = 'Refund Processed: UserNinjas Transaction';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Refund Completed</h2>
        <p>Hi there,</p>
        <p>This is to confirm that a refund of <strong>₹${details.amount}</strong> has been successfully processed for your payment (ID: ${details.paymentId}).</p>
        <p>The funds should appear in your source bank account or wallet within 5-7 business days depending on your payment method.</p>
        <p>If you have any questions, please reply directly to this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">UserNinjas Technologies Pvt. Ltd.</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}
