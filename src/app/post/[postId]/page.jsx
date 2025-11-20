'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, increment, updateDoc, getDoc, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { Avatar } from '@/components/Avatar';
import { Timestamp } from '@/components/Timestamp';
import { CommentList } from '@/components/CommentList';
import { Badge } from '@/components/ui/Badge';
import { toggleRepost } from '@/lib/repost';
import { toggleBookmark, isBookmarked } from '@/lib/bookmarks';
import { ArrowLeft, Heart, Repeat2, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function PostDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const { user: currentUser } = useUser();

  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Reaction states
  const [hasLoved, setHasLoved] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);

  // Live counts
  const [hearts, setHearts] = useState(0);
  const [reposts, setReposts] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  const format = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n);

  // Main post listener
  useEffect(() => {
    if (!postId) return;

    const unsub = onSnapshot(doc(db, 'posts', postId), async (snap) => {
      if (!snap.exists()) {
        router.replace('/');
        return;
      }

      const data = snap.data();
      setPost({ id: snap.id, ...data });

      // Update all live counts
      setHearts(data.reactions?.heart || 0);
      setReposts(data.reactions?.reposts || 0);
      setBookmarks(data.reactions?.bookmarks || 0);
      setCommentCount(data.commentCount || 0);

      // Load author
      if (data.authorUid) {
        const authorSnap = await getDoc(doc(db, 'users', data.authorUid));
        setAuthor(authorSnap.exists() ? authorSnap.data() : { displayName: 'Deleted', username: 'deleted' });
      }

      setLoading(false);

      // View count
      if (!sessionStorage.getItem(`view_${postId}`)) {
        updateDoc(doc(db, 'posts', postId), { views: increment(1) });
        sessionStorage.setItem(`view_${postId}`, 'true');
      }
    });

    return unsub;
  }, [postId, router]);

  // Load user reaction states
  useEffect(() => {
    if (!currentUser || !postId) return;

    // Love (from localStorage)
    setHasLoved(localStorage.getItem(`love_${postId}`) === 'true');

    // Bookmark
    isBookmarked(postId)
      .then(setHasBookmarked)
      .catch(() => setHasBookmarked(false));

    // Repost
    getDoc(doc(db, 'users', currentUser.uid, 'reposts', postId))
      .then(snap => setHasReposted(snap.exists()));

    // Follow status
    checkFollowStatus();
  }, [currentUser, postId]);

  // Check if following
  const checkFollowStatus = async () => {
    if (!currentUser || !post?.authorUid) return;
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid, 'following', post.authorUid));
      setIsFollowing(snap.exists());
    } catch (err) {
      console.error('Follow check error:', err);
    }
  };

  // Handlers
  const handleLove = async () => {
    if (!currentUser) return;
    const newVal = !hasLoved;
    await updateDoc(doc(db, 'posts', postId), {
      'reactions.heart': increment(newVal ? 1 : -1)
    });
    setHasLoved(newVal);
    localStorage.setItem(`love_${postId}`, newVal.toString());
  };

  const handleRepost = async () => {
    if (!currentUser) return;
    const result = await toggleRepost(postId);
    setHasReposted(result !== false);
  };

  const handleBookmark = async () => {
    if (!currentUser) return;
    const result = await toggleBookmark(postId);
    setHasBookmarked(result);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${author?.username}`,
          text: post?.text,
          url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share error:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !post?.authorUid) return;
    try {
      const followingRef = doc(db, 'users', currentUser.uid, 'following', post.authorUid);
      const followerRef = doc(db, 'users', post.authorUid, 'followers', currentUser.uid);

      if (isFollowing) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
      } else {
        await updateDoc(followingRef, { followedAt: new Date() });
        await updateDoc(followerRef, { followedAt: new Date() });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading || !post || !author) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Post</h1>
      </div>

      <article className={styles.post}>
        {/* Author */}
        <div className={styles.author}>
          <Link href={`/profile/${post.authorUid}`} className={styles.avatarWrapper}>
            <Avatar src={author.photoURL} size="lg" />
          </Link>
          <div className={styles.authorInfo}>
            <div className={styles.nameLine}>
              <Link href={`/profile/${post.authorUid}`} className={styles.name}>
                {author.displayName}
              </Link>
              {author.monetization?.tier && <Badge tier={author.monetization.tier} />}
            </div>
            <div className={styles.handle}>@{author.username}</div>
          </div>
          {currentUser?.uid !== post.authorUid && (
            <button 
              onClick={handleFollow}
              className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <div className={styles.text}>{post.text}</div>

        {post.mediaUrls?.[0] && (
          <img src={post.mediaUrls[0]} alt="post" className={styles.media} />
        )}

        <div className={styles.meta}>
          <Timestamp date={post.createdAt} className={styles.time} />
          <span className={styles.views}>· {format(post.views || 0)} Views</span>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div><strong>{format(commentCount)}</strong> Replies</div>
          <div><strong>{format(reposts)}</strong> Reposts</div>
          <div><strong>{format(hearts)}</strong> Likes</div>
          <div><strong>{format(bookmarks)}</strong> Bookmarks</div>
        </div>

        {/* ACTION BAR */}
        <div className={styles.actions}>
          <button className={styles.actionBtn}>
            <MessageCircle size={20} />
            {commentCount > 0 && <span>{format(commentCount)}</span>}
          </button>

          <button
            onClick={handleRepost}
            className={`${styles.actionBtn} ${hasReposted ? styles.active : ''}`}
          >
            <Repeat2 size={20} />
            {reposts > 0 && <span>{format(reposts)}</span>}
          </button>

          <button
            onClick={handleLove}
            className={`${styles.actionBtn} ${hasLoved ? styles.loved : ''}`}
          >
            <Heart size={20} fill={hasLoved ? "#f91880" : "none"} />
            {hearts > 0 && <span>{format(hearts)}</span>}
          </button>

          <button
            onClick={handleBookmark}
            className={`${styles.actionBtn} ${hasBookmarked ? styles.bookmarked : ''}`}
          >
            <Bookmark size={20} fill={hasBookmarked ? "#ffd60a" : "none"} />
            {bookmarks > 0 && <span>{format(bookmarks)}</span>}
          </button>

          <button 
            onClick={handleShare}
            className={styles.actionBtn}
          >
            <Share2 size={20} />
          </button>
        </div>
      </article>

      {/* Comments */}
      <CommentList postId={postId} authorUid={post.authorUid} currentUserUid={currentUser?.uid} />
    </div>
  );
}