// src/hooks/usePosts.js
import { useState, useEffect } from 'react';
import { subscribeToSphere, subscribeToCircle } from '@/lib/posts';

export function usePosts({ circleId } = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscribe = circleId ? subscribeToCircle : subscribeToSphere;
    const unsub = subscribe(circleId || (() => {}), (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => unsub();
  }, [circleId]);

  return { posts, loading };
}