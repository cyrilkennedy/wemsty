// src/lib/monetization.js
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getUserTier(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  const monetization = data.monetization;

  if (!monetization?.active) return null;

  const expiresAt = new Date(monetization.expiresAt);
  if (expiresAt < new Date()) {
    // Expired — auto-deactivate
    await updateDoc(doc(db, 'users', uid), {
      'monetization.active': false,
      'monetization.tier': null,
    });
    return null;
  }

  return monetization.tier; // 'creator', 'pro', 'enterprise'
}