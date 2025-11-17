// src/app/circles/[id]/page.jsx
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PostCard } from '@/components/PostCard';
import { useUser } from '@/hooks/useUser';
import styles from './page.module.css';
import { ArrowLeft, Share2, Globe, Lock, Edit, UserPlus, Trash2 } from 'lucide-react';
import { requestCircleDelete, approveCircleDelete, rejectCircleDelete } from '@/lib/circleAdmin';

export default function CircleFeed() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const circleRef = doc(db, 'circles', id);
    const unsubCircle = onSnapshot(circleRef, (docSnap) => {
      if (!docSnap.exists()) {
        router.push('/circles');
        return;
      }

      const data = docSnap.data();
      const members = Array.isArray(data.members) ? data.members : [];
      const admins = Array.isArray(data.admins) ? data.admins : [];

      const isMember = members.includes(user.uid);
      const isAdmin = admins.includes(user.uid);
      const isCreator = data.createdBy === user.uid;

      setCircle({ id: docSnap.id, ...data, members, admins });
      setIsMember(isMember);
      setIsAdmin(isAdmin);
      setIsCreator(isCreator);
      setLoading(false);
    });

    const q = query(
      collection(db, 'posts'),
      where('circleId', '==', id),
      where('privacy', 'in', ['circle', 'both']),
      orderBy('createdAt', 'desc')
    );
    const unsubPosts = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate()
      })));
    });

    return () => {
      unsubCircle();
      unsubPosts();
    };
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

  const handleDeleteRequest = async () => {
    if (isCreator) {
      if (confirm('Delete this circle permanently?')) {
        await deleteDoc(doc(db, 'circles', id));
        router.push('/circles');
      }
    } else {
      await requestCircleDelete(id, user.uid);
      alert('Delete request sent to creator.');
    }
    setShowDeleteModal(false);
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
              <button onClick={() => setShowDeleteModal(true)} className={styles.dangerBtn}>
                <Trash2 size={16} />
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Delete Circle?</h3>
            {isCreator ? (
              <p>This action cannot be undone.</p>
            ) : (
              <p>Request will be sent to the original creator for approval.</p>
            )}
            <div className={styles.modalActions}>
              <button onClick={handleDeleteRequest} className={styles.dangerBtn}>
                {isCreator ? 'Delete Now' : 'Request Delete'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}