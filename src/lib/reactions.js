// src/lib/reactions.js
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, runTransaction } from 'firebase/firestore';

// ========== UNIFIED LOAD ALL REACTIONS ==========
export async function getUserReactions(postId) {
  const user = auth.currentUser;
  if (!user) {
    return { liked: false, reposted: false, bookmarked: false };
  }

  try {
    const [reactionSnap, repostSnap, bookmarkSnap] = await Promise.all([
      getDoc(doc(db, 'posts', postId, 'reactions', user.uid)),
      getDoc(doc(db, 'users', user.uid, 'reposts', postId)),
      getDoc(doc(db, 'users', user.uid, 'bookmarks', postId))
    ]);

    return {
      liked: reactionSnap.exists() && reactionSnap.data().liked === true,
      reposted: repostSnap.exists(),
      bookmarked: bookmarkSnap.exists()
    };
  } catch (err) {
    console.error('Error loading reactions:', err);
    return { liked: false, reposted: false, bookmarked: false };
  }
}

// ========== TOGGLE LIKE WITH TRANSACTION ==========
export async function toggleLike(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to like');

  const reacRef = doc(db, 'posts', postId, 'reactions', user.uid);
  const postRef = doc(db, 'posts', postId);

  try {
    await runTransaction(db, async (transaction) => {
      const reacSnap = await transaction.get(reacRef);
      const postSnap = await transaction.get(postRef);
      
      if (!postSnap.exists()) {
        throw new Error('Post not found');
      }

      const isLiked = reacSnap.exists() && reacSnap.data().liked === true;
      const currentLikes = postSnap.data()?.reactions?.likes || 0;

      if (isLiked) {
        // Unlike
        transaction.delete(reacRef);
        transaction.update(postRef, { 
          'reactions.likes': Math.max(0, currentLikes - 1) 
        });
      } else {
        // Like
        transaction.set(reacRef, { 
          liked: true, 
          createdAt: new Date() 
        });
        transaction.update(postRef, { 
          'reactions.likes': currentLikes + 1 
        });
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    throw error;
  }
}