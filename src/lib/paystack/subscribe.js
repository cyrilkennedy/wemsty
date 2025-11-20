// src/lib/paystack/subscribe.js
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getPlanDetails } from './plans';

export async function subscribeToPlan(uid, planId, reference) {
  const plan = getPlanDetails(planId);
  if (!plan) throw new Error('Invalid plan');

  const expiresAt = new Date();
  if (plan.yearly) {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    'monetization.tier': plan.tier,
    'monetization.active': true,
    'monetization.expiresAt': expiresAt.toISOString(),
    'monetization.updatedAt': serverTimestamp(),
    'monetization.lastReference': reference,
  });

  return { success: true };
}