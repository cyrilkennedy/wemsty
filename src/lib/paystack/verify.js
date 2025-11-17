// src/lib/paystack/verify.js
import axios from 'axios';


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function verifyPayment(reference, expectedAmount) {
  if (!reference || !expectedAmount) {
    return { success: false, error: 'Missing reference or amount' };
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
      return { success: true, data };
    } else {
      return { success: false, error: 'Invalid transaction' };
    }
  } catch (error) {
    return { success: false, error: 'Verification failed' };
  }
}