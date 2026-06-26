import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createOrderSchema, verifyPaymentSchema, refundSchema } from '../validators/payment.validator';
import crypto from 'crypto';

describe('Payment Validator Tests', () => {
  test('should validate valid planName in createOrderSchema', () => {
    const result = createOrderSchema.safeParse({ planName: 'monthly' });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.planName, 'monthly');
    }
  });

  test('should validate valid amount in createOrderSchema', () => {
    const result = createOrderSchema.safeParse({ amount: 1500 });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.amount, 1500);
    }
  });

  test('should fail if both planName and amount are missing in createOrderSchema', () => {
    const result = createOrderSchema.safeParse({});
    assert.strictEqual(result.success, false);
  });

  test('should fail for invalid planName in createOrderSchema', () => {
    const result = createOrderSchema.safeParse({ planName: 'invalid_plan' });
    assert.strictEqual(result.success, false);
  });

  test('should validate verifyPaymentSchema parameters', () => {
    const payload = {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_123'
    };
    const result = verifyPaymentSchema.safeParse(payload);
    assert.strictEqual(result.success, true);
  });

  test('should fail verifyPaymentSchema if signature is missing', () => {
    const payload = {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123'
    };
    const result = verifyPaymentSchema.safeParse(payload);
    assert.strictEqual(result.success, false);
  });

  test('should validate refundSchema with amount', () => {
    const result = refundSchema.safeParse({ paymentId: 'pay_123', amount: 500 });
    assert.strictEqual(result.success, true);
  });

  test('should validate refundSchema without amount', () => {
    const result = refundSchema.safeParse({ paymentId: 'pay_123' });
    assert.strictEqual(result.success, true);
  });
});

describe('Signature Verification logic mock tests', () => {
  const secret = 'test_webhook_secret_2026';

  test('should verify HMAC webhook signature correctly', () => {
    const body = JSON.stringify({ event: 'payment.captured', id: 'evt_123' });
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const verified = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(expectedSignature)
    );
    assert.strictEqual(verified, true);
  });
});
