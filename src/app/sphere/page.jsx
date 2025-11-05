'use client'; // ← ADD THIS AT THE TOP
// app/sphere/page.jsx
import { PostCard } from '@/components/PostCard';
import { FAB } from '@/components/FAB';
import { usePosts } from '@/hooks/usePosts';
import { useUser } from '@/hooks/useUser';
import styles from './page.module.css';

export default function SpherePage() {
  const { posts, loading } = usePosts();
  const { user } = useUser();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>For You</h1>
      {loading ? (
        <div className={styles.skeleton}>Loading thoughts...</div>
      ) : (
        <div className={styles.feed}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      {user && <FAB />}
    </div>
  );
}