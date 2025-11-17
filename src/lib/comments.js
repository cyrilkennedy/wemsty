// src/lib/comments.js
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';

export const addComment = async (postId, text, author) => {
  const commentsRef = collection(db, 'posts', postId, 'comments');
  return await addDoc(commentsRef, {
    text,
    authorUid: author.uid,
    authorName: author.displayName,
    authorPhoto: author.photoURL,
    createdAt: serverTimestamp(),
    likes: 0
  });
};

export const addReply = async (postId, commentId, text, author) => {
  const repliesRef = collection(db, 'posts', postId, 'comments', commentId, 'replies');
  return await addDoc(repliesRef, {
    text,
    authorUid: author.uid,
    authorName: author.displayName,
    authorPhoto: author.photoURL,
    createdAt: serverTimestamp(),
    likes: 0
  });
};