'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, deleteDoc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { Avatar } from '@/components/Avatar';
import { Timestamp } from './Timestamp';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Heart, Repeat2, Bookmark, Trash2, MoreHorizontal } from 'lucide-react';
import styles from './CommentList.module.css';

export function CommentList({ postId, authorUid, currentUserUid }) {
  const { user: currentUser } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    if (!postId) return;

    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, async (snap) => {
      const list = [];
      const userCache = new Map();

      for (const d of snap.docs) {
        const data = d.data();

        let userData = {
          displayName: data.authorDisplayName || 'Deleted User',
          username: data.authorUsername || 'deleted',
          photoURL: data.authorPhotoURL || null,
          tier: data.authorTier,
        };

        if (data.authorUid && !data.authorDisplayName && !userCache.has(data.authorUid)) {
          const userSnap = await getDoc(doc(db, 'users', data.authorUid));
          if (userSnap.exists()) {
            const u = userSnap.data();
            userData = {
              displayName: u.displayName || 'User',
              username: u.username || 'user',
              photoURL: u.photoURL,
              tier: u.monetization?.tier,
            };
          }
          userCache.set(data.authorUid, userData);
        } else if (userCache.has(data.authorUid)) {
          userData = userCache.get(data.authorUid);
        }

        list.push({
          id: d.id,
          text: data.text || '',
          mediaUrl: data.mediaUrl,
          authorUid: data.authorUid,
          authorName: userData.displayName,
          authorUsername: userData.username,
          authorPhotoURL: userData.photoURL,
          tier: userData.tier,
          createdAt: data.createdAt?.toDate() || new Date(),
          reactions: data.reactions || { heart: 0 },
        });
      }

      setComments(list);
      setLoading(false);
    });

    return unsub;
  }, [postId]);

  const handleLike = async (id, currentCount) => {
    if (!currentUser) return;

    const key = `comment_love_${id}`;
    const wasLiked = localStorage.getItem(key) === 'true';
    const newLiked = !wasLiked;
    
    localStorage.setItem(key, newLiked.toString());

    // Update Firestore
    try {
      await updateDoc(doc(db, 'posts', postId, 'comments', id), {
        'reactions.heart': newLiked ? currentCount + 1 : currentCount - 1
      });
    } catch (err) {
      console.error('Like error:', err);
    }

    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, reactions: { ...c.reactions, heart: newLiked ? currentCount + 1 : currentCount - 1 } }
        : c
    ));
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      // Decrement post comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(-1)
      });
      setShowMenu(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete comment');
    }
  };

  if (loading) return <div className={styles.commentlist_loading}>Loading replies...</div>;

  return (
    <div className={styles.commentlist_container}>
      {comments.length === 0 ? (
        <div className={styles.commentlist_empty}>No replies yet. Be first!</div>
      ) : (
        comments.map(c => {
          const isLiked = currentUser && localStorage.getItem(`comment_love_${c.id}`) === 'true';
          const count = c.reactions.heart;
          const isCommentOwner = currentUser?.uid === c.authorUid;
          const isPostOwner = currentUser?.uid === authorUid;
          const canDelete = isCommentOwner || isPostOwner;

          return (
            <div key={c.id} className={styles.commentlist_item}>
              <Link
                href={`/profile/${c.authorUid}`}
                onClick={(e) => e.stopPropagation()}
                className={styles.commentAvatarWrapper}
              >
                <Avatar src={c.authorPhotoURL} size="md" />
              </Link>

              <div className={styles.commentlist_content}>
                <div className={styles.commentlist_header}>
                  <div className={styles.commentlist_user}>
                    <Link href={`/profile/${c.authorUid}`} className={styles.commentlist_name_link}>
                      <span className={styles.commentlist_name}>
                        {c.authorName}
                        {c.tier && <Badge tier={c.tier} />}
                      </span>
                      <span className={styles.commentlist_username}>@{c.authorUsername}</span>
                    </Link>
                    <Timestamp date={c.createdAt} className={styles.commentlist_time} />
                  </div>
                  
                  {canDelete && (
                    <div className={styles.menuWrapper}>
                      <button 
                        onClick={() => setShowMenu(showMenu === c.id ? null : c.id)}
                        className={styles.menuBtn}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {showMenu === c.id && (
                        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className={styles.deleteOption}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.commentlist_text}>{c.text}</div>

                {c.mediaUrl && (
                  <div className={styles.commentlist_media_wrapper}>
                    <img
                      src={c.mediaUrl}
                      alt="comment media"
                      className={styles.commentlist_media}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className={styles.commentlist_actions}>
                  <button 
                    onClick={() => handleLike(c.id, count)} 
                    className={`${styles.commentlist_btn} ${isLiked ? styles.commentlist_liked : ''}`}
                  >
                    <Heart size={18} fill={isLiked ? '#f91880' : 'none'} />
                    {count > 0 && <span className={styles.commentlist_count}>{count}</span>}
                  </button>
                  <button className={styles.commentlist_btn}><Repeat2 size={18} /></button>
                  <button className={styles.commentlist_btn}><Bookmark size={18} /></button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}