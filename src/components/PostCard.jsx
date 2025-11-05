// components/PostCard.jsx
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar } from '@/components/Avatar';
import { ReactionBar } from '@/components/ReactionBar';
import { Timestamp } from '@/components/Timestamp';
import styles from './PostCard.module.css';

export function PostCard({ post }) {
  const [author, setAuthor] = useState(null);
  const [circle, setCircle] = useState(null);

  useEffect(() => {
    if (post.authorUid) {
      const authorRef = doc(db, 'users', post.authorUid);
      const unsub = onSnapshot(authorRef, (docSnap) => {
        setAuthor(docSnap.exists() ? docSnap.data() : { displayName: 'Deleted', username: 'deleted' });
      });
      return () => unsub();
    }
  }, [post.authorUid]);

  useEffect(() => {
    if (post.circleId) {
      const circleRef = doc(db, 'circles', post.circleId);
      const unsub = onSnapshot(circleRef, (docSnap) => {
        setCircle(docSnap.exists() ? docSnap.data() : null);
      });
      return () => unsub();
    }
  }, [post.circleId]);

  if (!author) return <div className={styles.skeleton}>Loading...</div>;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Avatar src={author.photoURL} size="md" />
        <div>
          <p className={styles.name}>{author.displayName}</p>
          <p className={styles.handle}>@{author.username}</p>
          {circle && <span className={styles.circleBadge}>#{circle.tag}</span>}
          <Timestamp date={post.createdAt} />
        </div>
      </div>
      <p className={styles.text}>{post.text}</p>
      {post.mediaUrls?.[0] && <img src={post.mediaUrls[0]} alt="" className={styles.media} />}
      <ReactionBar postId={post.id} reactions={post.reactions} />
    </div>
  );
}