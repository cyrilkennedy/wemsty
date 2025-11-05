// src/app/circles/[id]/page.jsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PostCard } from '@/components/PostCard';
import { useUser } from '@/hooks/useUser';
import styles from './page.module.css';
import { ArrowLeft, Share2, Plus, Users, Globe, Lock, Edit, UserPlus } from 'lucide-react';

export default function CircleFeed() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

 useEffect(() => {
  if (!user || !id) return;

  const circleRef = doc(db, 'circles', id);
  const unsubCircle = onSnapshot(circleRef, (docSnap) => {
    if (!docSnap.exists()) {
      router.push('/circles');
      return;
    }

    const data = docSnap.data();

    // SAFE: Always ensure arrays
    const members = Array.isArray(data.members) ? data.members : [];
    const admins = Array.isArray(data.admins) ? data.admins : [];

    const isMember = members.includes(user.uid);
    const isAdmin = admins.includes(user.uid);

    setCircle({ id: docSnap.id, ...data, members, admins });
    setIsMember(isMember);
    setIsAdmin(isAdmin);
    setLoading(false);
  });

  // ... rest unchanged

  }, [id, user, router]);

  const handleJoin = async () => {
    await updateDoc(doc(db, 'circles', id), {
      members: arrayUnion(user.uid)
    });
    setIsMember(true);
  };

  const handlePost = (toGlobal = false) => {
    const privacy = toGlobal ? 'both' : 'circle';
    router.push(`/create?circleId=${id}&privacy=${privacy}`);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!circle) return null;

  if (!isMember) {
    return (
      <div className={styles.container}>
        <button onClick={() => router.back()} className={styles.backBtn}>Back</button>
        <div className={styles.joinPrompt}>
          <h1>#{circle.tag}</h1>
          <h2>{circle.name}</h2>
          <p>{circle.members?.length || 0} members</p>
          <button onClick={handleJoin} className={styles.joinBtn}>Join Circle</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>Back</button>
      <div className={styles.header}>
        <div>
          <h1>#{circle.tag}</h1>
          <h2>{circle.name}</h2>
          <p>{circle.members?.length || 0} members • {posts.length} posts</p>
        </div>
        <div className={styles.actions}>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className={styles.shareBtn}>
            <Share2 size={16} /> Share
          </button>
          {isAdmin && (
            <>
              <button onClick={() => router.push(`/circles/${id}/edit`)} className={styles.editBtn}>
                <Edit size={16} />
              </button>
              <button onClick={() => {
                const url = `${window.location.origin}/circles/${id}?admin=1`;
                navigator.clipboard.writeText(url);
                alert('Admin invite link copied!');
              }} className={styles.adminBtn}>
                <UserPlus size={16} /> Invite Admin
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.feed}>
        {posts.map(post => (
          <div key={post.id} className={styles.postWrapper}>
            <PostCard post={post} />
            <div className={styles.privacyBadge}>
              {post.privacy === 'both' ? 'Also Global' : 'Circle Only'}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.fabMenu}>
        <button onClick={() => handlePost(false)} className={styles.fabCircle}><Lock size={24} /></button>
        <button onClick={() => handlePost(true)} className={styles.fabGlobal}><Globe size={24} /></button>
      </div>
    </div>
  );
}