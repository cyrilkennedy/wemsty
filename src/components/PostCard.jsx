"use client";

import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/hooks/useUser";
import { deletePost } from "@/lib/posts";
import { toggleRepost } from "@/lib/repost";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";
import { Avatar } from "@/components/Avatar";
import { Timestamp } from "@/components/Timestamp";
import { Badge } from "@/components/ui/Badge";
import {
  MoreHorizontal, Trash2, Flag, UserMinus,
  MessageCircle, Heart, Repeat2, Bookmark
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./PostCard.module.css";
import { CommentThread } from "@/components/CommentThread";
import { RepostIndicator } from "./RepostIndicator";

export function PostCard({ post, onDelete }) {
  const [author, setAuthor] = useState(null);
  const [circle, setCircle] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [hearts, setHearts] = useState(post.reactions?.heart || 0);
  const [reposts, setReposts] = useState(post.reactions?.reposts || 0);
  const [bookmarks, setBookmarks] = useState(post.reactions?.bookmarks || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const [hasLoved, setHasLoved] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);

  const { user: currentUser } = useUser();
  const isSponsored = post.isPromoted;
  const router = useRouter();

  const format = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n);

  // Load author
  useEffect(() => {
    if (!post.authorUid) return;
    const unsub = onSnapshot(doc(db, "users", post.authorUid), (snap) => {
      setAuthor(snap.exists() ? snap.data() : { displayName: "Deleted", username: "deleted", photoURL: null });
    });
    return unsub;
  }, [post.authorUid]);

  // Load circle
  useEffect(() => {
    if (!post.circleId) return;
    const unsub = onSnapshot(doc(db, "circles", post.circleId), (snap) => {
      setCircle(snap.exists() ? snap.data() : null);
    });
    return unsub;
  }, [post.circleId]);

  // Load user reaction state
  useEffect(() => {
    if (!currentUser) return;
    setHasLoved(localStorage.getItem(`love_${post.id}`) === "true");
    isBookmarked(post.id).then(setHasBookmarked).catch(() => setHasBookmarked(false));

    const checkRepost = async () => {
      const snap = await getDoc(doc(db, "users", currentUser.uid, "reposts", post.id));
      setHasReposted(snap.exists());
    };
    checkRepost();
  }, [post.id, currentUser]);

  // Live sync from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "posts", post.id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setHearts(data.reactions?.heart || 0);
      setReposts(data.reactions?.reposts || 0);
      setBookmarks(data.reactions?.bookmarks || 0);
      setCommentCount(data.commentCount || 0);
    });
    return unsub;
  }, [post.id]);

  const handleLove = async () => {
    if (!currentUser || isSponsored) return;
    const newVal = !hasLoved;
    await updateDoc(doc(db, "posts", post.id), {
      "reactions.heart": increment(newVal ? 1 : -1)
    });
    setHasLoved(newVal);
    localStorage.setItem(`love_${post.id}`, newVal);
  };

  const handleRepost = async () => {
    if (!currentUser || isSponsored) return;
    const result = await toggleRepost(post.id);
    setHasReposted(result !== false);
  };

  const handleBookmark = async () => {
    if (!currentUser || isSponsored) return;
    const result = await toggleBookmark(post.id);
    setHasBookmarked(result);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await deletePost(post.id);
    onDelete?.(post.id);
    setShowMenu(false);
  };

  if (!author) return <div className={styles.skeleton}>Loading...</div>;

  const isOwner = currentUser?.uid === post.authorUid;

  const handleCardClick = (e) => {
    if (e.target.closest("button,a,input,textarea")) return;
    router.push(`/post/${post.id}`);
  };

  return (
    <article className={styles.card} onClick={handleCardClick}>
      {post.isRepost && post.repostedBy && <RepostIndicator repostedBy={post.repostedBy} />}
      {isSponsored && <div className={styles.sponsored}>Sponsored</div>}

      <Link
        href={`/profile/${post.authorUid}`}
        onClick={(e) => e.stopPropagation()}
        className={styles.avatarWrapper}
      >
        <Avatar src={author.photoURL} size="md" />
      </Link>

      <div className={styles.main}>
        <div className={styles.header}>
          <Link href={`/profile/${post.authorUid}`} className={styles.userInfo}>
            <span className={styles.name}>{author.displayName}</span>
            {author?.monetization?.tier && <Badge tier={author.monetization.tier} />}
            <span className={styles.handle}>@{author.username}</span>
            {circle && <Link href={`/circles/${post.circleId}`} className={styles.circle}>#{circle.tag}</Link>}
            <span className={styles.dot}>·</span>
            <Timestamp date={post.createdAt} className={styles.time} />
          </Link>
<div className={styles.postMenuWrapper}>
  <button 
    onClick={(e) => { 
      e.stopPropagation(); 
      setShowMenu(prev => !prev); 
    }} 
    className={styles.moreBtn}
    aria-label="More options"
  >
    <MoreHorizontal size={20} />
  </button>

  {showMenu && (
    <div className={styles.overlay} onClick={() => setShowMenu(false)}>
      <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
        {isOwner ? (
          <button onClick={handleDelete} className={styles.delete}>
            <Trash2 size={18} /> Delete
          </button>
        ) : (
          <>
            <button className={styles.option}>
              <UserMinus size={18} /> Unfollow @{author.username}
            </button>
            <button className={styles.option}>
              <Flag size={18} /> Report post
            </button>
          </>
        )}
      </div>
    </div>
  )}
</div>
        </div>

        <div className={styles.text}>{post.text}</div>

        {post.mediaUrls?.[0] && (
          <div className={styles.mediaWrapper}>
            <img src={post.mediaUrls[0]} alt="" className={styles.media} loading="lazy" />
          </div>
        )}

        {/* YOUR ORIGINAL REACTION STYLE — BUT NOW FIXED & WORKING */}
        <div className={styles.actions}>
          <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className={styles.commentBtn}>
            <MessageCircle size={18} />
            {commentCount > 0 && <span>{format(commentCount)}</span>}
          </button>

          <button onClick={(e) => { e.stopPropagation(); handleRepost(); }} className={`${styles.reactionBtn} ${hasReposted ? styles.active : ""}`}>
            <Repeat2 size={18} fill={hasReposted ? "#00ba7c" : "none"} />
            {reposts > 0 && <span>{format(reposts)}</span>}
          </button>

          <button onClick={(e) => { e.stopPropagation(); handleLove(); }} className={`${styles.reactionBtn} ${hasLoved ? styles.loved : ""}`}>
            <Heart size={18} fill={hasLoved ? "#f91880" : "none"} />
            {hearts > 0 && <span>{format(hearts)}</span>}
          </button>

          <button onClick={(e) => { e.stopPropagation(); handleBookmark(); }} className={`${styles.reactionBtn} ${hasBookmarked ? styles.bookmarked : ""}`}>
            <Bookmark size={18} fill={hasBookmarked ? "#ffd60a" : "none"} />
            {bookmarks > 0 && <span>{format(bookmarks)}</span>}
          </button>
        </div>
      </div>

      {showComments && (
        <CommentThread postId={post.id} authorHandle={author.username} />
      )}




      
    </article>
  );
}