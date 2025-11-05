// src/app/not-found.jsx
import Link from 'next/link';
import { GlassCard } from '@/components/GlassCard';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <GlassCard className={styles.card}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Oops! This page doesn’t exist.</p>
        <Link href="/" className={styles.link}>
          Back to Home
        </Link>
      </GlassCard>
    </div>
  );
}