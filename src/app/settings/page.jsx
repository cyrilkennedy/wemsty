'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft, Moon, Sun, Monitor, Key, Bell, Shield } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SettingsPage() {
  const { user } = useUser();
  const [theme, setTheme] = useState('system');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'system';
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (t) => {
    if (t === 'dark') document.documentElement.classList.add('dark');
    else if (t === 'light') document.documentElement.classList.remove('dark');
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  const changeTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    applyTheme(t);
  };

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/profile/me" className={styles.back}><ArrowLeft size={24} /></Link>
        <h1>Settings</h1>
      </div>

      <div className={styles.section}>
        <h2>Appearance</h2>
        <div className={styles.themeGrid}>
          <button onClick={() => changeTheme('light')} className={theme === 'light' ? styles.active : ''}>
            <Sun size={20} /> Light
          </button>
          <button onClick={() => changeTheme('dark')} className={theme === 'dark' ? styles.active : ''}>
            <Moon size={20} /> Dark
          </button>
          <button onClick={() => changeTheme('system')} className={theme === 'system' ? styles.active : ''}>
            <Monitor size={20} /> System
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Account</h2>
        <button onClick={resetPassword} className={styles.resetBtn}>
          <Key size={20} /> Reset Password
          {resetSent && <span className={styles.sent}>Email sent!</span>}
        </button>
      </div>

      <div className={styles.section}>
        <h2>Privacy</h2>
        <Link href="/privacy" className={styles.link}><Shield size={20} /> Privacy Policy</Link>
      </div>
    </div>
  );
}