export default async function handler(req, res) {
  // Add CORS headers for local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Load credentials from environment variables or use the verified live credentials as fallbacks
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_Sx5YIPbX0SGPU4';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'qJYzHPmsnBGdnL1tNRW3Lclm';

    const amountInPaise = Math.round(amount * 100);
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: `receipt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Razorpay API error: ${errorText}` });
    }

    const order = await response.json();
    return res.status(200).json(order);
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
