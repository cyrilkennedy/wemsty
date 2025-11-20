// src/components/PostCardSkeleton.jsx
import styles from './PostCardSkeleton.module.css';

export function PostCardSkeleton() {
  return (
    <div className={styles.skeleton_card}>
      <div className={styles.skeleton_header}>
        <div className={styles.avatarSkeleton} />
        <div className={styles.textSkeleton}>
          <div className={styles.line} style={{ width: '60%' }} />
          <div className={styles.line} style={{ width: '40%' }} />
        </div>
      </div>

      <div className={styles.bodySkeleton}>
        <div className={styles.line} style={{ width: '90%' }} />
        <div className={styles.line} style={{ width: '70%' }} />
        <div className={styles.line} style={{ width: '80%' }} />
      </div>

      <div className={styles.mediaSkeleton} />

      <div className={styles.reactionSkeleton}>
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
}