// src/app/api/paystack/verify/route.js
import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const POST = async (req) => {
  const { reference, expectedAmount } = await req.json();

  if (!reference || !expectedAmount) {
    return Response.json({ success: false, error: 'Missing data' });
  }

  if (!PAYSTACK_SECRET) {
    console.error('PAYSTACK_SECRET_KEY missing');
    return Response.json({ success: false, error: 'Server config error' });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const data = response.data.data;

    if (
      data.status === 'success' &&
      data.amount / 100 === expectedAmount &&
      data.currency === 'NGN'
    ) {
      return Response.json({ success: true, data });
    } else {
      return Response.json({ success: false, error: 'Invalid transaction' });
    }
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    return Response.json({ success: false, error: 'Verification failed' });
  }
};