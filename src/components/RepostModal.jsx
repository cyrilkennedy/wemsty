// components/RepostButton.jsx
'use client';
import { Repeat2 } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import styles from './RepostModal.module.css';

export function RepostButton({ postId, reposted = false, count = 0, onToggle }) {
  const { user } = useUser();

  const toggle = async () => {
    if (!user) return alert('Sign in');
    const ref = doc(db, 'users', user.uid, 'reposts', postId);
    if (reposted) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { post: doc(db, 'posts', postId), createdAt: new Date() });
    }
    onToggle?.(!reposted);
  };
}