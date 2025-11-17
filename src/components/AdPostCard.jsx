// components/AdPostCard.jsx
'use client';
import { Heart, MessageCircle, Share } from 'lucide-react';
import styles from './AdPostCard.module.css';

export function AdPostCard({ post, author }) {
  return (
    <article className={styles.card}>
      {/* === SPONSORED TAG === */}
      <div className={styles.sponsored}>Sponsored</div>

      {/* === HEADER === */}
      <div className={styles.header}>
        <img src={author.photoURL || '/default-avatar.png'} alt="" className={styles.avatar} />
        <div className={styles.userInfo}>
          <div className={styles.nameLine}>
            <span className={styles.name}>{author.displayName}</span>
            {author.monetization?.tier && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2" className={styles.badge}>
                <path d="M12 2L2 22h20L12 2z" />
              </svg>
            )}
          </div>
          <div className={styles.meta}>
            <span className={styles.handle}>@{author.username}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.time}>just now </span>
          </div>
        </div>
        <button className={styles.moreBtn}>⋯</button>
      </div>

      {/* === BODY === */}
      <div className={styles.body}>
        <p className={styles.text}>{post.text}</p>
        {post.mediaUrls?.[0] && <img src={post.mediaUrls[0]} alt="" className={styles.media} />}
      </div>

      {/* === REACTIONS (only heart, comment, share) ===
      <div className={styles.reactions}>
        <button className={styles.reactBtn}>
          <Heart size={18} fill="#F91880" stroke="#F91880" />
          <span className={styles.count}>1</span>
        </button>
        <button className={styles.reactBtn}>
          <MessageCircle size={18} />
          <span className={styles.count}>0</span>
        </button>
        <button className={styles.reactBtn}>
          <Share size={18} />
        </button>
      </div> */}
    </article>
  );
}