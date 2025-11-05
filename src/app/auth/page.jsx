// src/app/auth/page.js
'use client'; // ← MUST BE CLIENT (uses state)

import { useState } from 'react';
import { signInWithGoogle, signOutUser } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { AuthModal } from '@/components/AuthModal';
import styles from './page.module.css';

export default function AuthPage() {
  const { user, loading } = useUser();
  const [showModal, setShowModal] = useState(false);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert('Sign in failed');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {user ? (
        <div className={styles.profile}>
          <img src={user.photoURL} alt={user.displayName} className={styles.avatar} />
          <h2>{user.displayName}</h2>
          <p>{user.email}</p>
          <button onClick={handleSignOut} className={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      ) : (
        <div className={styles.guest}>
          <h1>Join WEMSTY</h1>
          <p>Where logic meets creativity</p>
          <button onClick={() => setShowModal(true)} className={styles.joinBtn}>
           Sign in / Sign up           </button>
        </div>
      )}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}