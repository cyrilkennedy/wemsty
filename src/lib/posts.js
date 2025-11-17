// src/lib/posts.js
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { indexPost } from './algolia'; // ✅ Import indexing

// === CREATE POST WITH AUTO-INDEXING ===
export async function createPost({ text, media, authorUid, circleId, privacy = 'global' }) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be signed in');

  // Create post
  const postRef = await addDoc(collection(db, 'posts'), {
    text,
    mediaUrls: media ? [media] : [],
    authorUid,
    circleId: circleId || null,
    privacy,
    createdAt: serverTimestamp(),
    reactions: { 
      likes: 0, 
      reposts: 0, 
      bookmarks: 0 
    }
  });

  // Get author info for indexing
  const userDoc = await getDoc(doc(db, 'users', authorUid));
  const userData = userDoc.data();

  // Index in Algolia (async, don't wait)
  indexPost({
    id: postRef.id,
    text,
    author: {
      displayName: userData?.displayName || 'Unknown',
      username: userData?.username || 'unknown'
    },
    tags: [], // Extract tags if you have them
    circle: circleId ? { name: 'Circle' } : null,
    createdAt: new Date(),
    mediaUrls: media ? [media] : []
  }).catch(err => console.error('Failed to index post:', err));

  return postRef.id;
}

// === DELETE POST ===
export async function deletePost(postId) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('You must be signed in');

  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }

  const postData = postSnap.data();
  if (currentUser.uid !== postData.authorUid) {
    throw new Error('You can only delete your own posts');
  }

  await deleteDoc(postRef);
  
  // TODO: Also delete from Algolia
  // await deleteAlgoliaRecord('posts', postId);
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