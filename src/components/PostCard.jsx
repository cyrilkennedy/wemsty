'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { deletePost } from '@/lib/posts';
import { toggleRepost } from '@/lib/repost';  // ← Fixed path
import { toggleBookmark, isBookmarked } from '@/lib/bookmarks';
import { Avatar } from '@/components/Avatar';
import { Timestamp } from '@/components/Timestamp';
import { Badge } from '@/components/ui/Badge';
import { 
  MoreHorizontal, 
  Trash2, 
  Flag, 
  UserMinus, 
  MessageCircle, 
  Heart, 
  Repeat2, 
  Bookmark 
} from 'lucide-react';
import Link from 'next/link';
import styles from './PostCard.module.css';
import { CommentThread } from '@/components/CommentThread';

export function PostCard({ post, onDelete }) {
  const [author, setAuthor] = useState(null);
  const [circle, setCircle] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const [hearts, setHearts] = useState(post.reactions?.heart || 0);
  const [reposts, setReposts] = useState(post.reactions?.reposts || 0);
  const [bookmarks, setBookmarks] = useState(post.reactions?.bookmarks || 0);
  
  const [hasLoved, setHasLoved] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  
  const { user: currentUser } = useUser();
  const isSponsored = post.isPromoted;

  // Load author
  useEffect(() => {
    if (post.authorUid) {
      const unsub = onSnapshot(doc(db, 'users', post.authorUid), (snap) => {
        setAuthor(snap.exists() ? snap.data() : { displayName: 'Deleted', username: 'deleted' });
      });
      return unsub;
    }
  }, [post.authorUid]);

  // Load circle
  useEffect(() => {
    if (post.circleId) {
      const unsub = onSnapshot(doc(db, 'circles', post.circleId), (snap) => {
        setCircle(snap.exists() ? snap.data() : null);
      });
      return unsub;
    }
  }, [post.circleId]);

  // Load user interactions — FULLY STATIC, NO DYNAMIC IMPORTS
  useEffect(() => {
    if (!currentUser) {
      setHasLoved(false);
      setHasReposted(false);
      setHasBookmarked(false);
      return;
    }

    // Love from localStorage
    const loved = localStorage.getItem(`love_${post.id}`);
    setHasLoved(loved === 'true');

    // Bookmark
    isBookmarked(post.id).then(setHasBookmarked).catch(() => setHasBookmarked(false));

    // Repost — Manual check (safe & fast)
    const checkRepost = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid, 'reposts', post.id));
        setHasReposted(snap.exists());
      } catch (err) {
        setHasReposted(false);
      }
    };
    checkRepost();

  }, [post.id, currentUser]);

  // Real-time counts
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'posts', post.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setHearts(data.reactions?.heart || 0);
        setReposts(data.reactions?.reposts || 0);
        setBookmarks(data.reactions?.bookmarks || 0);
      }
    });
    return unsub;
  }, [post.id]);

  const handleLove = async () => {
    if (!currentUser || isSponsored) return;
    const newVal = !hasLoved;
    await updateDoc(doc(db, 'posts', post.id), {
      'reactions.heart': increment(newVal ? 1 : -1)
    });
    setHasLoved(newVal);
    localStorage.setItem(`love_${post.id}`, newVal);
  };

  const handleRepost = async () => {
    if (!currentUser || isSponsored) return;
    const result = await toggleRepost(post.id);
    setHasReposted(result !== false); // toggleRepost returns true/false or undefined
  };

  const handleBookmark = async () => {
    if (!currentUser || isSponsored) return;
    const result = await toggleBookmark(post.id);
    setHasBookmarked(result);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    await deletePost(post.id);
    onDelete?.(post.id);
    setShowMenu(false);
  };

  if (!author) return <div className={styles.skeleton}>Loading...</div>;
  const isOwner = currentUser?.uid === post.authorUid;

  return (
    <article className={styles.card}>
      {isSponsored && <div className={styles.sponsored}>Sponsored</div>}

      <Link href={`/profile/${post.authorUid}`} className={styles.avatarLink}>
        <Avatar src={author.photoURL} size="md" />
      </Link>

      <div className={styles.main}>
        <div className={styles.header}>
          <Link href={`/profile/${post.authorUid}`} className={styles.userInfo}>
            <span className={styles.nameWithBadge}>
              <span className={styles.name}>{author.displayName}</span>
              {author?.monetization?.tier && <Badge tier={author.monetization.tier} />}
            </span>
            <span className={styles.handle}>@{author.username}</span>
            {circle && <Link href={`/circles/${post.circleId}`} className={styles.circle}>#{circle.tag}</Link>}
            <span className={styles.dot}>·</span>
            <Timestamp date={post.createdAt} className={styles.time} />
          </Link>

          <div className={styles.menuWrapper}>
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className={styles.moreBtn}>
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className={styles.dropdown}>
                {isOwner ? (
                  <button onClick={handleDelete} className={styles.deleteOption}>
                    <Trash2 size={18} /> <span>Delete</span>
                  </button>
                ) : (
                  <>
                    <button className={styles.menuOption}><UserMinus size={18} /> <span>Unfollow @{author.username}</span></button>
                    <button className={styles.menuOption}><Flag size={18} /> <span>Report post</span></button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.text}>{post.text}</p>
          {post.mediaUrls?.[0] && (
            <div className={styles.mediaWrapper}>
              <img src={post.mediaUrls[0]} alt="" className={styles.media} />
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {!isSponsored ? (
            <>
              <button onClick={handleLove} className={`${styles.reactionBtn} ${hasLoved ? styles.active : ''}`}>
                <Heart size={18} fill={hasLoved ? '#f91880' : 'none'} stroke={hasLoved ? '#f91880' : 'currentColor'} />
                {hearts > 0 && <span>{hearts}</span>}
              </button>

              <button onClick={() => setShowComments(true)} className={styles.commentBtn}>
                <MessageCircle size={18} />
                <span>{post.commentCount || 0}</span>
              </button>

              <button onClick={handleRepost} className={`${styles.reactionBtn} ${hasReposted ? styles.active : ''}`}>
                <Repeat2 size={18} fill={hasReposted ? '#00ba7c' : 'none'} />
                {reposts > 0 && <span>{reposts}</span>}
              </button>

              <button onClick={handleBookmark} className={`${styles.reactionBtn} ${hasBookmarked ? styles.active : ''}`}>
                <Bookmark size={18} fill={hasBookmarked ? '#ffd60a' : 'none'} />
                {bookmarks > 0 && <span>{bookmarks}</span>}
              </button>
            </>
          ) : (
            <div className={styles.sponsoredActions}>
              <span className={styles.sponsoredHeart}>❤️ {hearts}</span>
              <span className={styles.sponsoredComment}>Comment</span>
              <span className={styles.sponsoredShare}>Share</span>
            </div>
          )}
        </div>
      </div>

      {showComments && <CommentThread postId={post.id} onClose={() => setShowComments(false)} />}
      {showMenu && <div className={styles.overlay} onClick={() => setShowMenu(false)} />}
    </article>
  );
}