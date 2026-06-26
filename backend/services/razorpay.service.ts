import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../config/constants';
import { logger } from '../utils/logger';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export class RazorpayService {
  async createOrder(amount: number, currency: string = 'INR') {
    try {
      const amountInPaise = Math.round(amount * 100);
      const options = {
        amount: amountInPaise,
        currency,
        receipt: `receipt_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      };

      const order = await razorpay.orders.create(options);
      logger.info(`Razorpay order created successfully: ${order.id}`);
      return order;
    } catch (error) {
      logger.error('Failed to create Razorpay order:', error);
      throw error;
    }
  }

  verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    try {
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      const isValid = generatedSignature === signature;
      logger.info(`Signature verification result for order ${razorpayOrderId}: ${isValid}`);
      return isValid;
    } catch (error) {
      logger.error('Error verifying payment signature:', error);
      return false;
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const options: { amount?: number } = {};
      if (amount) {
        options.amount = Math.round(amount * 100); // convert to paise
      }

      const refund = await razorpay.payments.refund(paymentId, options);
      logger.info(`Refund successfully triggered for payment ${paymentId}: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error(`Failed to refund payment ${paymentId}:`, error);
      throw error;
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      logger.error(`Failed to fetch Razorpay payment details for ${paymentId}:`, error);
      throw error;
    }
  }
}
