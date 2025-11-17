// src/lib/paystack/subscribe.js
'use server';

import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPlanDetails } from './plans';

export async function subscribeToPlan(uid, planId, reference) {
  try {
    // Verify user exists
    await adminAuth.getUser(uid);

    const plan = getPlanDetails(planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // Calculate expiration date
    const expiresAt = new Date();
    if (plan.yearly) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Admin SDK uses direct reference, not doc()
    const userRef = adminDb.collection('users').doc(uid);
    
    await userRef.update({
      'monetization.tier': plan.tier,
      'monetization.active': true,
      'monetization.expiresAt': expiresAt.toISOString(),
      'monetization.updatedAt': FieldValue.serverTimestamp(),
      'monetization.lastReference': reference,
    });

    console.log(`✅ Subscription updated for user ${uid}: ${plan.tier}`);

    return { success: true };
  } catch (error) {
    console.error('subscribeToPlan error:', error);
    return { success: false, error: error.message };
  }
}