import express from 'express';
import cors from 'cors';
import routes from './routes';
import { handleRazorpayWebhook } from './webhooks/razorpay.webhook';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

const app = express();

// Enable CORS
app.use(cors({ origin: '*' }));

// Parse JSON request payloads, capturing the raw body for signature verification on webhooks
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// Logging requests middleware
app.use((req, res, next) => {
  logger.info(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Webhook endpoint mapped before the standard API routing table
app.post('/api/payment/webhook', handleRazorpayWebhook);

// Mount core routes under /api
app.use('/api', routes);

// Health check endpoint for Vercel monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
