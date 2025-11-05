// components/CreateComposer.jsx
'use client';
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { createPost } from '@/lib/posts';
import { MediaUploader } from '@/components/MediaUploader';
import { GradientButton } from '@/components/GradientButton';
import { Confetti } from '@/components/Confetti';
import { Avatar } from '@/components/Avatar';
import styles from './CreateComposer.module.css';

export function CreateComposer() {
  const { user } = useUser();
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;
    setLoading(true);
    await createPost({ text, media, author: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } });
    setLoading(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setText('');
    setMedia(null);
  };

  return (
    <div className={styles.composer}>
      <div className={styles.header}>
        <Avatar src={user?.photoURL} size="md" />
        <div>
          <p className={styles.name}>{user?.displayName || 'Guest'}</p>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What makes sense to you today?"
        className={styles.textarea}
        rows={6}
      />
      <MediaUploader media={media} onUpload={setMedia} />
      <div className={styles.footer}>
        <GradientButton onClick={handleSubmit} disabled={loading || !text.trim()}>
          {loading ? 'Posting...' : 'Post Thought'}
        </GradientButton>
      </div>
      {showConfetti && <Confetti />}
    </div>
  );
}