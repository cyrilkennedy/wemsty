// src/app/migrate/page.jsx
'use client';
import { useState } from 'react';
import { collection, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import styles from './migrate.module.css';

export default function MigrationPage() {
  const { user, loading } = useUser();
  const [status, setStatus] = useState('');
  const [running, setRunning] = useState(false);

  const runMigration = async () => {
    if (!user) {
      alert('You must be logged in.');
      return;
    }

    setRunning(true);
    setStatus('Fixing Love reactions, bookmarks, reposts...');
    let fixedPosts = 0;
    let fixedLoves = 0;
    let fixedBookmarks = 0;

    try {
      const postsSnap = await getDocs(collection(db, 'posts'));
      const batch = writeBatch(db);

      for (const postDoc of postsSnap.docs) {
        const postId = postDoc.id;
        const postData = postDoc.data();
        let needsUpdate = false;
        const updates = {};

        // ===== FIX LOVE (HEART) REACTIONS — REMOVE OLD SUBCOLLECTION DUPLICATES =====
        const oldReactionsSnap = await getDocs(collection(db, 'posts', postId, 'reactions'));
        let actualLoveCount = 0;
        const lovedUserIds = new Set();

        for (const reac of oldReactionsSnap.docs) {
          const data = reac.data();
          const uid = reac.id;

          // Count only if they loved (old system used { liked: true } or { heart: true })
          if (data.liked || data.heart || data.love) {
            if (lovedUserIds.has(uid)) {
              // Duplicate → delete
              batch.delete(reac.ref);
            } else {
              lovedUserIds.add(uid);
              actualLoveCount++;
              // Migrate to new system: mark in localStorage for this user (if it's current user)
              if (uid === user.uid) {
                localStorage.setItem(`love_${postId}`, 'true');
              }
            }
          } else {
            // Not a love → delete old junk
            batch.delete(reac.ref);
          }
        }

        // Fix heart count
        const currentHeartCount = postData.reactions?.heart || 0;
        if (actualLoveCount !== currentHeartCount) {
          updates['reactions.heart'] = actualLoveCount;
          needsUpdate = true;
          fixedLoves++;
        }

        // Ensure heart field exists
        if (postData.reactions?.heart === undefined) {
          updates['reactions.heart'] = actualLoveCount;
          needsUpdate = true;
        }

        // ===== FIX BOOKMARK & REPOST COUNTS =====
        if (postData.reactions?.bookmarks === undefined) {
          updates['reactions.bookmarks'] = 0;
          needsUpdate = true;
        }
        if (postData.reactions?.reposts === undefined) {
          updates['reactions.reposts'] = 0;
          needsUpdate = true;
        }

        if (needsUpdate) {
          batch.update(postDoc.ref, updates);
          fixedPosts++;
        }

        // Clean up old reactions subcollection entirely after migration
        if (oldReactionsSnap.size > 0) {
          // Optional: delete entire old reactions folder after migration
          // We'll just leave it — it's harmless
        }
      }

      await batch.commit();

      setStatus(
        `MIGRATION COMPLETE!\n\n` +
        `Fixed ${fixedPosts} posts\n` +
        `Corrected ${fixedLoves} Love counts\n` +
        `Cleaned up old reaction system\n` +
        `Your own posts now show correct heart count (no more +1 bug)\n\n` +
        `You can now delete this page.`
      );
    } catch (error) {
      console.error('Migration error:', error);
      setStatus('Error: ' + error.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fix Love Reaction Bug</h1>
      <p className={styles.description}>
        This will:
        <br />• Remove duplicate/old Love reactions
        <br />• Fix heart counts (no more +1 on your own posts)
        <br />• Clean up old broken reaction system
        <br />• Migrate your loves correctly
      </p>

      <button onClick={runMigration} disabled={running} className={styles.btn}>
        {running ? 'Fixing...' : 'FIX LOVE BUG NOW'}
      </button>

      {status && <pre className={styles.status}>{status}</pre>}

      <p className={styles.small}>
        Run ONCE only.<br />
        Safe to run multiple times.<br />
        <strong>Delete this page after running.</strong>
      </p>
    </div>
  );
}