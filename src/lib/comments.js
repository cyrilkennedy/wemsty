// src/lib/comments.js
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export const addComment = async (postId, text, author) => {
  const commentsRef = collection(db, 'posts', postId, 'comments');
  
  // Add the comment
  await addDoc(commentsRef, {
    text,
    authorUid: author.uid,
    authorDisplayName: author.displayName || 'User',
    authorUsername: author.username || 'user',
    authorPhotoURL: author.photoURL || null,
    authorTier: author.monetization?.tier || null,
    createdAt: serverTimestamp(),
    reactions: { heart: 0 }
  });

  // CRITICAL: Increment commentCount on the main post
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    commentCount: increment(1)
  });
};