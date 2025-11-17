// src/app/about/page.jsx
'use client';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Globe, Heart, Zap } from 'lucide-react';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}><ArrowLeft size={28} /></Link>
      </div>

      <div className={styles.hero}>
        <Sparkles size={64} className={styles.sparkle} />
        <h1>Wemsty</h1>
        <p>Where thoughts become conversations.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <Globe size={40} />
          <h3>Global</h3>
          <p>Connect across borders, cultures, and time zones.</p>
        </div>
        <div className={styles.card}>
          <Heart size={40} />
          <h3>Ad-Free</h3>
          <p>No distractions. Just pure thought.</p>
        </div>
        <div className={styles.card}>
          <Zap size={40} />
          <h3>Instant</h3>
          <p>Post in milliseconds. Real-time sync.</p>
        </div>
      </div>

      <div className={styles.footer}>
        <p>Made with <Heart size={18} fill="red" /> for thinkers.</p>
        <p className={styles.version}>v1.0 • Open Source • Forever Free</p>
      </div>
    </div>
  );
}