// src/components/CommentThread.jsx
'use client';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addComment, addReply } from '@/lib/comments';
import { useUser } from '@/hooks/useUser';
import { Avatar } from './Avatar';
import { X, Send, Heart } from 'lucide-react';
import { Timestamp } from './Timestamp';
import styles from './CommentThread.module.css';

export function CommentThread({ postId, onClose }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(list);
      setLoading(false);
    });
    return unsub;
  }, [postId]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    await addComment(postId, newComment, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    setNewComment('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.thread} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Comments</h3>
          <button onClick={onClose} className={styles.close} aria-label="Close comments">
            <X size={24} />
          </button>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.loading}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className={styles.empty}>
              <p>No comments yet</p>
              <span>Be the first to comment!</span>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} postId={postId} />
            ))
          )}
        </div>

        {user && (
          <div className={styles.inputWrapper}>
            <Avatar src={user.photoURL} size="sm" />
            <div className={styles.inputBox}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a comment..."
                rows="1"
              />
              <button 
                onClick={submitComment} 
                disabled={!newComment.trim()}
                className={styles.sendBtn}
                aria-label="Post comment"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, postId }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [likes, setLikes] = useState(comment.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const { user } = useUser();

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await addReply(postId, comment.id, replyText, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    setReplyText('');
    setShowReply(false);
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setHasLiked(!hasLiked);
  };

  return (
    <div className={styles.comment}>
      <Avatar src={comment.authorPhoto} size="sm" />
      <div className={styles.commentContent}>
        <div className={styles.commentHeader}>
          <strong className={styles.author}>{comment.authorName}</strong>
          <Timestamp date={comment.createdAt} className={styles.timestamp} />
        </div>
        <p className={styles.commentText}>{comment.text}</p>
        <div className={styles.commentActions}>
          <button 
            onClick={handleLike} 
            className={`${styles.likeBtn} ${hasLiked ? styles.liked : ''}`}
          >
            <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          {user && (
            <button 
              onClick={() => setShowReply(!showReply)} 
              className={styles.replyBtn}
            >
              Reply
            </button>
          )}
        </div>
        {showReply && (
          <div className={styles.replyBox}>
            <textarea 
              value={replyText} 
              onChange={e => setReplyText(e.target.value)} 
              placeholder="Write a reply..."
              rows="2"
            />
            <div className={styles.replyActions}>
              <button onClick={() => setShowReply(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button 
                onClick={submitReply} 
                disabled={!replyText.trim()}
                className={styles.submitBtn}
              >
                Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}