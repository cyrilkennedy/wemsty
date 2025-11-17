// src/lib/follow.js
import { db } from '@/lib/firebase';
import { doc, writeBatch, increment } from 'firebase/firestore';

export const followUser = async (targetUid, currentUserUid) => {
  const batch = writeBatch(db);

  // Add to target's followers
  batch.set(doc(db, 'users', targetUid, 'followers', currentUserUid), {
    followedAt: new Date()
  });

  // Add to current user's following
  batch.set(doc(db, 'users', currentUserUid, 'following', targetUid), {
    followedAt: new Date()
  });

  // Increment counters
  batch.update(doc(db, 'users', targetUid), { followers: increment(1) });
  batch.update(doc(db, 'users', currentUserUid), { following: increment(1) });

  await batch.commit();
};

export const unfollowUser = async (targetUid, currentUserUid) => {
  const batch = writeBatch(db);

  batch.delete(doc(db, 'users', targetUid, 'followers', currentUserUid));
  batch.delete(doc(db, 'users', currentUserUid, 'following', targetUid));

  batch.update(doc(db, 'users', targetUid), { followers: increment(-1) });
  batch.update(doc(db, 'users', currentUserUid), { following: increment(-1) });

  await batch.commit();
};