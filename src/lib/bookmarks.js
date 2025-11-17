// src/lib/bookmarks.js
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, increment, updateDoc } from 'firebase/firestore';

// NOTE: Use this file for ALL bookmark operations
// Import in ReactionBar: import { toggleBookmark, isBookmarked } from '@/lib/bookmarks';

/**
 * Toggle bookmark (add or remove)
 */
export async function toggleBookmark(postId, postData = null) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in');
  
  const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', postId);
  const bookmarkSnap = await getDoc(bookmarkRef);
  
  if (bookmarkSnap.exists()) {
    // Remove bookmark
    await deleteDoc(bookmarkRef);
    
    // Decrement bookmark count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      'reactions.bookmarks': increment(-1)
    });
    
    return false;
  } else {
    // Add bookmark
    await setDoc(bookmarkRef, {
      post: doc(db, 'posts', postId),
      savedAt: new Date(),
      cached: postData ? {
        text: postData.text,
        mediaUrls: postData.mediaUrls || [],
        authorUid: postData.authorUid,
        privacy: postData.privacy
      } : {}
    });
    
    // Increment bookmark count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      'reactions.bookmarks': increment(1)
    });
    
    return true;
  }
}

/**
 * Check if a post is bookmarked by current user
 */
export async function isBookmarked(postId) {
  const user = auth.currentUser;
  if (!user) return false;
  
  const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', postId);
  const snap = await getDoc(bookmarkRef);
  return snap.exists();
}

/**
 * Save a post to user's bookmarks (legacy - use toggleBookmark instead)
 */
export async function saveThought(postId, postData) {
  return toggleBookmark(postId, postData);
}

/**
 * Remove a bookmark (legacy - use toggleBookmark instead)
 */
export async function removeBookmark(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in');
  
  const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', postId);
  await deleteDoc(bookmarkRef);
  
  // Decrement count
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    'reactions.bookmarks': increment(-1)
  });
}