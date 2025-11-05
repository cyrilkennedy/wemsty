// src/hooks/usePosts.js
'use client';

import { useState, useEffect } from 'react';
import { subscribeToSphere, subscribeToCircle } from '@/lib/posts';

export function usePosts({ circleId } = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePosts = (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    };

    let unsub;
    
    if (circleId) {
      // Subscribe to specific circle
      unsub = subscribeToCircle(circleId, handlePosts);
    } else {
      // Subscribe to global sphere
      unsub = subscribeToSphere(handlePosts);
    }

    return () => unsub();
  }, [circleId]);

  return { posts, loading };
}