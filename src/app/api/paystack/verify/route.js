// src/app/api/paystack/verify/route.js
import axios from 'axios';
import { getPlanDetails } from '@/lib/paystack/plans';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const POST = async (req) => {
  const { reference, expectedAmount, uid, planId } = await req.json();

  if (!reference || !expectedAmount || !uid || !planId) {
    return Response.json({ success: false, error: 'Missing data' });
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
      // ✅ Calculate expiry date on backend
      const plan = getPlanDetails(planId);
      if (!plan) {
        return Response.json({ success: false, error: 'Invalid plan' });
      }

      const expiresAt = new Date();
      if (plan.yearly) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      // ✅ Return monetization data for client to write
      return Response.json({
        success: true,
        data,
        monetization: {
          tier: plan.tier,
          active: true,
          expiresAt: expiresAt.toISOString(),
          updatedAt: new Date().toISOString(),
          lastReference: reference,
        },
      });
    } else {
      return Response.json({ success: false, error: 'Invalid transaction' });
    }
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    return Response.json({ success: false, error: 'Verification failed' });
  }
};