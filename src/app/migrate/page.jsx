// src/app/migrate/page.jsx
'use client';

import { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
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
    setStatus('Running migration...');
    let fixed = 0;

    try {
      const circlesRef = collection(db, 'circles');
      const snapshot = await getDocs(circlesRef);

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        const updates = {};

        if (typeof data.members === 'number') {
          const creatorUid = Array.isArray(data.admins) ? data.admins[0] : data.admins || user.uid;
          updates.members = [creatorUid];
          fixed++;
        } else if (!Array.isArray(data.members)) {
          updates.members = [];
        }

        if (!Array.isArray(data.admins)) {
          updates.admins = [data.admins || user.uid];
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, 'circles', docSnap.id), updates);
        }
      }

      setStatus(`Migration Complete! Fixed ${fixed} circle(s).`);
    } catch (error) {
      console.error(error);
      setStatus('Error: ' + error.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fix Old Circles</h1>
      <p className={styles.description}>
        Click below to fix circles with broken <span className={styles.inlineCode}>members</span> (number instead of array).
      </p>

      <button 
        onClick={runMigration} 
        disabled={running}
        className={styles.btn}
      >
        {running ? 'Running...' : 'Fix All Circles'}
      </button>

      {status && <p className={styles.status}>{status}</p>}

      <p className={styles.small}>You can delete this page after running.</p>
    </div>
  );
}