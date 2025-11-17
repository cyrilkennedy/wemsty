// src/app/notifications/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { approveCircleDelete, rejectCircleDelete } from '@/lib/circleAdmin';
import styles from './page.module.css';

export default function NotificationsPage() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'circleDeleteRequests'),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = [];
      for (const d of snap.docs) {
        const data = d.data();
        const circleSnap = await getDoc(doc(db, 'circles', data.circleId));
        if (circleSnap.exists() && circleSnap.data().createdBy === user.uid) {
          list.push({ id: d.id, ...data, circle: circleSnap.data() });
        }
      }
      setRequests(list);
    });

    return unsub;
  }, [user]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notifications</h1>
      {requests.length === 0 ? (
        <p className={styles.empty}>No pending requests</p>
      ) : (
        <div className={styles.list}>
          {requests.map(req => (
            <div key={req.id} className={styles.request}>
              <p>
                <strong>@{req.requestedBy}</strong> wants to delete <strong>#{req.circle.tag}</strong>
              </p>
              <div className={styles.actions}>
                <button onClick={() => approveCircleDelete(req.id, req.circleId)} className={styles.approveBtn}>
                  Approve
                </button>
                <button onClick={() => rejectCircleDelete(req.id)} className={styles.rejectBtn}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}