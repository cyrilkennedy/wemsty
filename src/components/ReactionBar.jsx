// components/ReactionBar.jsx - OPTIMIZED VERSION
import { useState, useEffect, useRef } from 'react';
import { Heart, Repeat2, Bookmark } from 'lucide-react';
import { toggleLike } from '@/lib/reactions';
import { toggleRepost } from '@/lib/repost';
import { toggleBookmark } from '@/lib/bookmarks';
import { getUserReactions } from '@/lib/reactions';
import { useUser } from '@/hooks/useUser';
import styles from './ReactionBar.module.css';

export function ReactionBar({ postId, reactions = {}, postData = null }) {
  const { user } = useUser();
  const [likes, setLikes] = useState(reactions.likes || 0);
  const [reposts, setReposts] = useState(reactions.reposts || 0);
  const [bookmarks, setBookmarks] = useState(reactions.bookmarks || 0);

  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [animating, setAnimating] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Prevent double-clicks
  const processingRef = useRef({
    like: false,
    repost: false,
    bookmark: false
  });

  // Load user reactions once
  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }

    let mounted = true;

    const loadReactions = async () => {
      try {
        const userReactions = await getUserReactions(postId);
        
        if (mounted) {
          setIsLiked(userReactions.liked);
          setIsReposted(userReactions.reposted);
          setIsBookmarked(userReactions.bookmarked);
          setLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load reactions:', err);
        if (mounted) setLoaded(true);
      }
    };

    loadReactions();

    return () => {
      mounted = false;
    };
  }, [postId, user]);

  // INSTANT RESPONSE - Optimistic updates
  const handleLike = async () => {
    if (!user || processingRef.current.like) return;
    
    processingRef.current.like = true;
    
    // Update UI INSTANTLY
    const newVal = !isLiked;
    setIsLiked(newVal);
    setLikes(l => newVal ? l + 1 : Math.max(0, l - 1));
    setAnimating('like');
    setTimeout(() => setAnimating(''), 300);
    
    // Then save to database in background
    try {
      await toggleLike(postId);
    } catch (err) {
      console.error('Like failed:', err);
      // Revert on error
      setIsLiked(!newVal);
      setLikes(l => newVal ? Math.max(0, l - 1) : l + 1);
    } finally {
      processingRef.current.like = false;
    }
  };

  const handleRepost = async () => {
    if (!user || processingRef.current.repost) return;
    
    processingRef.current.repost = true;
    
    // Update UI INSTANTLY
    const newVal = !isReposted;
    setIsReposted(newVal);
    setReposts(r => newVal ? r + 1 : Math.max(0, r - 1));
    
    // Save to database in background
    try {
      const result = await toggleRepost(postId);
      // Sync with actual result
      setIsReposted(result);
    } catch (err) {
      console.error('Repost failed:', err);
      // Revert on error
      setIsReposted(!newVal);
      setReposts(r => newVal ? Math.max(0, r - 1) : r + 1);
    } finally {
      processingRef.current.repost = false;
    }
  };

  const handleBookmark = async () => {
    if (!user || processingRef.current.bookmark) return;
    
    processingRef.current.bookmark = true;
    
    // Update UI INSTANTLY
    const newVal = !isBookmarked;
    setIsBookmarked(newVal);
    setBookmarks(b => newVal ? b + 1 : Math.max(0, b - 1));
    
    // Save to database in background
    try {
      await toggleBookmark(postId, postData);
    } catch (err) {
      console.error('Bookmark failed:', err);
      // Revert on error
      setIsBookmarked(!newVal);
      setBookmarks(b => newVal ? Math.max(0, b - 1) : b + 1);
    } finally {
      processingRef.current.bookmark = false;
    }
  };

  return (
    <div className={styles.bar} style={{ opacity: loaded ? 1 : 0.5 }}>
      <button 
        onClick={handleLike} 
        className={`${styles.btn} ${isLiked ? styles.liked : ''}`}
        disabled={!loaded || !user}
      >
        <div className={`${styles.icon} ${animating === 'like' ? styles.pulse : ''}`}>
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </div>
        {likes > 0 && <span className={styles.count}>{format(likes)}</span>}
      </button>

      <button 
        onClick={handleRepost} 
        className={`${styles.btn} ${isReposted ? styles.reposted : ''}`}
        disabled={!loaded || !user}
      >
        <div className={styles.icon}>
          <Repeat2 size={18} />
        </div>
        {reposts > 0 && <span className={styles.count}>{format(reposts)}</span>}
      </button>

      <button 
        onClick={handleBookmark} 
        className={`${styles.btn} ${isBookmarked ? styles.bookmarked : ''}`}
        disabled={!loaded || !user}
      >
        <div className={styles.icon}>
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        </div>
        {bookmarks > 0 && <span className={styles.count}>{format(bookmarks)}</span>}
      </button>
    </div>
  );
}

function format(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}