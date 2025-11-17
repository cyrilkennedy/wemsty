// src/hooks/useMonetization.js
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { getUserTier } from '@/lib/monetization';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useMonetization() {
  const { user } = useUser();
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        setTier(null);
        setLoading(false);
        return;
      }

      const data = snap.data();
      const monetization = data.monetization;

      if (!monetization?.active) {
        setTier(null);
      } else {
        const expiresAt = new Date(monetization.expiresAt);
        if (expiresAt < new Date()) {
          setTier(null);
        } else {
          setTier(monetization.tier);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { tier, loading };
}