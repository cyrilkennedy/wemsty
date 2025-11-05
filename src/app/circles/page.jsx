// src/app/circles/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { CircleCard } from '@/components/CircleCard';
import styles from './page.module.css';
import { Plus } from 'lucide-react';

export default function CirclesPage() {
  const { user, loading: userLoading } = useUser();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'circles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCircles(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !tag.trim()) return;
    await addDoc(collection(db, 'circles'), {
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      members: [user.uid],
      admins: [user.uid],
      createdAt: serverTimestamp()
    });
    setName('');
    setTag('');
    setShowCreate(false);
  };

  if (loading || userLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Circles</h1>
        {user && (
          <button onClick={() => setShowCreate(!showCreate)} className={styles.createBtn}>
            <Plus size={20} /> New Circle
          </button>
        )}
      </div>

      {showCreate && (
        <div className={styles.createForm}>
          <input placeholder="Circle Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="#tag" value={tag} onChange={e => setTag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} />
          <div className={styles.actions}>
            <button onClick={() => setShowCreate(false)}>Cancel</button>
            <button onClick={handleCreate}>Create</button>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {circles.map(circle => (
          <CircleCard key={circle.id} {...circle} />
        ))}
      </div>
    </div>
  );
}