import { useState, useEffect } from 'react';
import { Heart, Repeat2, Bookmark } from 'lucide-react';
import { toggleLike } from '@/lib/reactions';
import { toggleRepost } from '@/lib/repost';
import { toggleBookmark } from '@/lib/bookmarks';
import { getUserReactions } from '@/lib/reactions';
import styles from './ReactionBar.module.css';

export function ReactionBar({ postId, reactions = {}, postData = null }) {
  const [likes, setLikes] = useState(reactions.likes || 0);
  const [reposts, setReposts] = useState(reactions.reposts || 0);
  const [bookmarks, setBookmarks] = useState(reactions.bookmarks || 0);

  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [animating, setAnimating] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Load all user reactions at once
  useEffect(() => {
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
  }, [postId]);

  const handleLike = async () => {
    const newVal = !isLiked;
    setIsLiked(newVal);
    setLikes(l => newVal ? l + 1 : l - 1);
    setAnimating('like');
    
    try {
      await toggleLike(postId);
    } catch (err) {
      console.error('Like failed:', err);
      setIsLiked(!newVal);
      setLikes(l => newVal ? l - 1 : l + 1);
    }
    
    setTimeout(() => setAnimating(''), 300);
  };

  const handleRepost = async () => {
    const newVal = !isReposted;
    setIsReposted(newVal);
    setReposts(r => newVal ? r + 1 : r - 1);
    
    try {
      await toggleRepost(postId);
    } catch (err) {
      console.error('Repost failed:', err);
      setIsReposted(!newVal);
      setReposts(r => newVal ? r - 1 : r + 1);
    }
  };

  const handleBookmark = async () => {
    const newVal = !isBookmarked;
    setIsBookmarked(newVal);
    setBookmarks(b => newVal ? b + 1 : b - 1);
    
    try {
      await toggleBookmark(postId, postData);
    } catch (err) {
      console.error('Bookmark failed:', err);
      setIsBookmarked(!newVal);
      setBookmarks(b => newVal ? b - 1 : b + 1);
    }
  };

  return (
    <div className={styles.bar} style={{ opacity: loaded ? 1 : 0.5 }}>
      <button 
        onClick={handleLike} 
        className={`${styles.btn} ${isLiked ? styles.liked : ''}`}
        disabled={!loaded}
      >
        <div className={`${styles.icon} ${animating === 'like' ? styles.pulse : ''}`}>
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </div>
        {likes > 0 && <span className={styles.count}>{format(likes)}</span>}
      </button>

      <button 
        onClick={handleRepost} 
        className={`${styles.btn} ${isReposted ? styles.reposted : ''}`}
        disabled={!loaded}
      >
        <div className={styles.icon}>
          <Repeat2 size={18} />
        </div>
        {reposts > 0 && <span className={styles.count}>{format(reposts)}</span>}
      </button>

      <button 
        onClick={handleBookmark} 
        className={`${styles.btn} ${isBookmarked ? styles.bookmarked : ''}`}
        disabled={!loaded}
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
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n;
}