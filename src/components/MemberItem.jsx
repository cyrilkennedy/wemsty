// components/MemberItem.jsx
'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X } from 'lucide-react';
import styles from './MemberItem.module.css';

export function MemberItem({ uid, isAdmin, canRemove, onRemove }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      setUser(snap.exists() ? snap.data() : { displayName: 'Unknown', photoURL: '' });
    });
    return unsub;
  }, [uid]);

  if (!user) return <div className={styles.skeleton}>Loading...</div>;

  return (
    <div className={styles.item}>
      <img src={user.photoURL || '/default-avatar.png'} alt="" className={styles.avatar} />
      <div className={styles.info}>
        <span className={styles.name}>{user.displayName}</span>
        {isAdmin && <span className={styles.badge}>Admin</span>}
      </div>
      {canRemove && (
        <button onClick={onRemove} className={styles.removeBtn}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}