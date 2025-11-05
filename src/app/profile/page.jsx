// src/app/profile/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export default function ProfileRedirect() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(`/profile/${user.uid}`);
    } else {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  return <div>Redirecting...</div>;
}