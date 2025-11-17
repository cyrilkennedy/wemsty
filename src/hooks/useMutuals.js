// hooks/useMutuals.js
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useMutuals(uid) {
  const [mutuals, setMutuals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const fetchMutuals = async () => {
      const followingSnap = await getDocs(collection(db, 'users', uid, 'following'));
      const followersSnap = await getDocs(collection(db, 'users', uid, 'followers'));
      const following = followingSnap.docs.map(d => d.id);
      const followers = followersSnap.docs.map(d => d.id);
      const mutualIds = following.filter(id => followers.includes(id));
      const users = await Promise.all(mutualIds.map(id => getDocs(doc(db, 'users', id))));
      setMutuals(users.map(u => u.data()));
      setLoading(false);
    };
    fetchMutuals();
  }, [uid]);

  return { mutuals, loading };
}