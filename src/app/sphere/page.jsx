'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { FAB } from '@/components/FAB';
import { usePosts } from '@/hooks/usePosts';
import { useUser } from '@/hooks/useUser';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './page.module.css';

export default function SpherePage() {
  const { posts, loading: postsLoading } = usePosts();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  // INSTANT redirect + reload when user logs out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser && !userLoading) {
        router.replace('/auth');
        window.location.reload(); // kills all state instantly
      }
    });
    return () => unsubscribe();
  }, [router, userLoading]);

  // Optional: show nothing while checking auth (prevents flash)
  if (userLoading) {
    return <div className={styles.container}><div className={styles.skeleton}>Loading...</div></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>For You</h1>

      {postsLoading ? (
        <div className={styles.skeleton}>Loading thoughts...</div>
      ) : (
        <div className={styles.feed}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={() => {}} />
          ))}
        </div>
      )}

      {user && <FAB />}
    </div>
  );
}