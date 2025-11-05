// src/lib/posts.js
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// === CREATE POST ===
export async function createPost({ text, media, authorUid, circleId, privacy = 'global' }) {
  await addDoc(collection(db, 'posts'), {
    text,
    mediaUrls: media ? [media] : [],
    authorUid,
    circleId: circleId || null,
    privacy, // 'global' | 'circle' | 'both'
    createdAt: serverTimestamp(),
    reactions: { makesSense: 0, interesting: 0, challenge: 0 }
  });
}

// === SUBSCRIBE TO SPHERE (global + both) ===
export function subscribeToSphere(callback) {
  const q = query(
    collection(db, 'posts'),
    where('privacy', 'in', ['global', 'both']),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    callback(posts);
  });
}

// === SUBSCRIBE TO CIRCLE (circle + both) ===
export function subscribeToCircle(circleId, callback) {
  const q = query(
    collection(db, 'posts'),
    where('circleId', '==', circleId),
    where('privacy', 'in', ['circle', 'both']),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    callback(posts);
  });
}