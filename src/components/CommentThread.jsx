'use client';
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Avatar } from './Avatar';
import { addComment } from '@/lib/comments';
import { Send, Image, Smile } from 'lucide-react';
import styles from './CommentThread.module.css';

export function CommentThread({ postId, authorUid }) {
  const { user } = useUser();
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [text]);

  const submit = async () => {
    if (!text.trim() || !user || loading) return;
    
    setLoading(true);
    try {
      await addComment(postId, text, { uid: user.uid });
      setText('');
      setHasCommented(true);
      
      // Auto-redirect to post after 1 second
      setTimeout(() => {
        router.push(`/post/${postId}`);
      }, 1000);
    } catch (error) {
      console.error('Comment error:', error);
      alert('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.thread_container}>
      <div className={styles.input}>
        {user && (
          <>
            <Avatar src={user.photoURL} size="md" />

            <div className={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    submit();
                  }
                }}
                placeholder="What's happening?!"
                className={styles.textarea}
              />
              
              <div className={styles.toolbar}>
                <div className={styles.icons}>
                  <button className={styles.iconBtn} title="Add image">
                    <Image size={18} />
                  </button>
                  <button className={styles.iconBtn} title="Add emoji">
                    <Smile size={18} />
                  </button>
                </div>

                <button
                  onClick={submit}
                  disabled={!text.trim() || loading}
                  className={styles.sendBtn}
                >
                  {loading ? 'Posting...' : <Send size={20} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}