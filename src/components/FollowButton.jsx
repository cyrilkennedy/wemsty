// src/components/FollowButton.jsx
'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { followUser, unfollowUser } from '@/lib/follow';
import { useUser } from '@/hooks/useUser';

export function FollowButton({ targetUid }) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'following', targetUid);
    const unsub = onSnapshot(ref, (doc) => {
      setIsFollowing(doc.exists());
    });
    return unsub;
  }, [user, targetUid]);

  const toggleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(targetUid, user.uid);
      } else {
        await followUser(targetUid, user.uid);
      }
    } catch (err) {
      alert('Follow failed');
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={isFollowing ? styles.followingBtn : styles.followBtn}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}