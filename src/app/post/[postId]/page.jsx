'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PostCard } from '@/components/PostCard';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function PostDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          setError('Post not found');
          setLoading(false);
          return;
        }

        const postData = postSnap.data();
        
        // Get author info
        let authorData = null;
        if (postData.authorUid) {
          const authorRef = doc(db, 'users', postData.authorUid);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            authorData = authorSnap.data();
          }
        }

        setPost({
          id: postSnap.id,
          ...postData,
          author: authorData,
          createdAt: postData.createdAt?.toDate()
        });
        setLoading(false);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post');
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.container}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className={styles.error}>
          <h2>Post not found</h2>
          <p>{error || 'This post may have been deleted.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className={styles.postDetail}>
        <PostCard post={post} />
      </div>

      {/* Future: Add comments section here */}
      {/* <div className={styles.comments}>
        <h3>Comments</h3>
        ...
      </div> */}
    </div>
  );
}