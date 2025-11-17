// src/lib/reposts.js
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function toggleRepost(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to repost');

  const repostRef = doc(db, 'users', user.uid, 'reposts', postId);
  const postRef = doc(db, 'posts', postId);
  const snap = await getDoc(repostRef);
  const isReposted = snap.exists();

  if (isReposted) {
    // Remove repost
    await deleteDoc(repostRef);
    await updateDoc(postRef, { 'reactions.reposts': increment(-1) });
  } else {
    // Add repost
    await setDoc(repostRef, {
      post: doc(db, 'posts', postId),
      createdAt: new Date()
    });
    await updateDoc(postRef, { 'reactions.reposts': increment(1) });
  }
}

export async function isReposted(postId) {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, 'users', user.uid, 'reposts', postId));
  return snap.exists();
}