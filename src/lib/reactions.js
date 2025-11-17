// src/lib/reactions.js
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

// ========== UNIFIED LOAD ALL REACTIONS ==========
export async function getUserReactions(postId) {
  const user = auth.currentUser;
  if (!user) {
    return { liked: false, reposted: false, bookmarked: false };
  }

  try {
    // Load all 3 reactions in parallel
    const [reactionSnap, repostSnap, bookmarkSnap] = await Promise.all([
      getDoc(doc(db, 'posts', postId, 'reactions', user.uid)),
      getDoc(doc(db, 'users', user.uid, 'reposts', postId)),
      getDoc(doc(db, 'users', user.uid, 'bookmarks', postId))
    ]);

    return {
      liked: reactionSnap.exists() && reactionSnap.data().liked,
      reposted: repostSnap.exists(),
      bookmarked: bookmarkSnap.exists()
    };
  } catch (err) {
    console.error('Error loading reactions:', err);
    return { liked: false, reposted: false, bookmarked: false };
  }
}

// ========== TOGGLE LIKE ==========
export async function toggleLike(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to like');

  const reacRef = doc(db, 'posts', postId, 'reactions', user.uid);
  const postRef = doc(db, 'posts', postId);
  const snap = await getDoc(reacRef);
  const isLiked = snap.exists() && snap.data().liked;

  if (isLiked) {
    await deleteDoc(reacRef);
    await updateDoc(postRef, { 'reactions.likes': increment(-1) });
  } else {
    await setDoc(reacRef, { liked: true }, { merge: true });
    await updateDoc(postRef, { 'reactions.likes': increment(1) });
  }
}

// ========== LEGACY FUNCTIONS (DEPRECATED) ==========
export async function toggleBookmark(postId) {
  console.warn('Use toggleBookmark from @/lib/bookmarks instead');
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to bookmark');

  const reacRef = doc(db, 'posts', postId, 'reactions', user.uid);
  const postRef = doc(db, 'posts', postId);
  const snap = await getDoc(reacRef);
  const isBookmarked = snap.exists() && snap.data().bookmarked;

  if (isBookmarked) {
    await deleteDoc(reacRef);
    await updateDoc(postRef, { 'reactions.bookmarks': increment(-1) });
  } else {
    await setDoc(reacRef, { bookmarked: true }, { merge: true });
    await updateDoc(postRef, { 'reactions.bookmarks': increment(1) });
  }
}

export async function getUserReaction(postId) {
  console.warn('Use getUserReactions (plural) for better performance');
  const user = auth.currentUser;
  if (!user) return { liked: false, bookmarked: false };
  const snap = await getDoc(doc(db, 'posts', postId, 'reactions', user.uid));
  return snap.exists() ? snap.data() : { liked: false, bookmarked: false };
}