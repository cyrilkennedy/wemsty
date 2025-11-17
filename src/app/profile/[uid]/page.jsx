'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import {
  doc, getDoc, updateDoc, collection, query, where, orderBy,
  onSnapshot, getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { PostCard } from '@/components/PostCard';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createPortal } from 'react-dom';
import { MessageCircle, Bookmark } from 'lucide-react';
import styles from './page.module.css';
import { Badge } from '@/components/ui/Badge';
import { FollowButton } from '@/components/FollowButton';

export default function ProfilePage() {
  const { uid } = useParams();
  const { user: currentUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('thoughts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const fileInputRef = useRef(null);

  const isOwner = currentUser?.uid === uid;
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${uid}` : '';

  /* --------------------------------------------------------------- */
  /* Load Profile + Posts + Bookmarks                                */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) notFound();
      const data = snap.data();
      setProfile(data);
      setEditForm({
        displayName: data.displayName || '',
        username: data.username || '',
        bio: data.bio || '',
        photoURL: data.photoURL || '',
      });
    };
    fetchProfile();

    // Posts — USING authorUid (CORRECT)
    const qPosts = query(
      collection(db, 'posts'),
      where('authorUid', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubPosts = onSnapshot(qPosts, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate()
      }));
      setPosts(list);
    }, (error) => {
      console.error('Posts query failed:', error);
    });

    // Bookmarks (only if owner)
    let unsubBookmarks;
    if (isOwner) {
      const qBookmarks = query(
        collection(db, 'users', uid, 'bookmarks'),
        orderBy('savedAt', 'desc')
      );
      unsubBookmarks = onSnapshot(qBookmarks, async (snap) => {
        const bookmarkPosts = await Promise.all(
          snap.docs.map(async (d) => {
            const postRef = d.data().post;
            const postSnap = await getDoc(postRef);
            if (!postSnap.exists()) return null;
            return {
              id: postSnap.id,
              ...postSnap.data(),
              createdAt: postSnap.data().createdAt?.toDate()
            };
          })
        );
        setBookmarks(bookmarkPosts.filter(Boolean));
      }, (error) => {
        console.error('Bookmarks query failed:', error);
      });
    }

    setLoading(false);

    return () => {
      unsubPosts();
      unsubBookmarks?.();
    };
  }, [uid, isOwner]);

  /* --------------------------------------------------------------- */
  /* Username Check                                                  */
  /* --------------------------------------------------------------- */
  const checkUsername = async (newName) => {
    if (!newName || newName === profile?.username) {
      setUsernameError('');
      return true;
    }
    const q = query(collection(db, 'users'), where('username', '==', newName));
    const snap = await getDocs(q);
    if (!snap.empty) {
      setUsernameError('Username already taken');
      return false;
    }
    setUsernameError('');
    return true;
  };

  /* --------------------------------------------------------------- */
  /* Image Upload                                                    */
  /* --------------------------------------------------------------- */
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForm(p => ({ ...p, photoURL: url }));
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------------------------------------- */
  /* Save Profile                                                    */
  /* --------------------------------------------------------------- */
  const handleSave = async () => {
    if (!editForm.username) {
      setUsernameError('Username required');
      return;
    }
    const ok = await checkUsername(editForm.username);
    if (!ok) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        displayName: editForm.displayName,
        username: editForm.username,
        bio: editForm.bio,
        photoURL: editForm.photoURL,
      });
      setProfile(p => ({ ...p, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------------------------------------- */
  /* Copy Profile Link                                               */
  /* --------------------------------------------------------------- */
  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setShowCopyMsg(true);
      setTimeout(() => setShowCopyMsg(false), 2000);
    } catch {
      alert('Copy failed – select the URL manually');
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!profile) return null;

  const currentPosts = activeTab === 'thoughts' ? posts : bookmarks;

  return (
    <>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          {isEditing ? (
            <div className={styles.editAvatar}>
              <img
                src={editForm.photoURL || '/default-avatar.png'}
                alt="avatar"
                className={styles.avatar}
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <small>Click to change</small>
            </div>
          ) : (
            <img
              src={profile.photoURL || '/default-avatar.png'}
              alt={profile.displayName}
              className={styles.avatar}
            />
          )}

          <div className={styles.info}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Display name"
                  value={editForm.displayName}
                  onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))}
                  className={styles.editInput}
                />
                <div className={styles.usernameWrapper}>
                  <input
                    type="text"
                    placeholder="username"
                    value={editForm.username}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setEditForm(p => ({ ...p, username: val }));
                      if (val !== profile.username) checkUsername(val);
                    }}
                    maxLength={20}
                    className={styles.editInput}
                  />
                  {usernameError && <small className={styles.error}>{usernameError}</small>}
                </div>
                <textarea
                  placeholder="Bio…"
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  className={styles.editTextarea}
                  rows={3}
                />
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  <h1 className={styles.displayName}>{profile.displayName}</h1>
                  {profile?.monetization?.tier && (
                    <Badge tier={profile.monetization.tier} />
                  )}
                </div>
                {profile.username && <p className={styles.username}>@{profile.username}</p>}
                <p className={styles.bio}>{profile.bio || 'No bio yet.'}</p>
              </>
            )}
<div className={styles.stats}>
  <span><strong>{posts.length}</strong> Thoughts</span>
  <span><strong>{profile.followers || 0}</strong> Followers</span>
  <span><strong>{profile.following || 0}</strong> Following</span>
</div>

            <div className={styles.actions}>
              <button onClick={copyProfileLink} className={styles.shareBtn}>Share</button>
              {!isOwner && currentUser && (
  <FollowButton targetUid={uid} />
)}
              {isOwner && !isEditing && (
                <button onClick={() => setIsEditing(true)} className={styles.editBtn}>Edit</button>
              )}
              {isEditing && (
                <>
                  <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TABS — ONLY FOR OWNER */}
        {isOwner && (
          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab('thoughts')}
              className={activeTab === 'thoughts' ? styles.tabActive : styles.tab}
            >
              <MessageCircle size={20} />
              <span>Thoughts</span>
              {posts.length > 0 && <span className={styles.count}>{posts.length}</span>}
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={activeTab === 'bookmarks' ? styles.tabActive : styles.tab}
            >
              <Bookmark size={20} />
              <span>Bookmarks</span>
              {bookmarks.length > 0 && <span className={styles.count}>{bookmarks.length}</span>}
            </button>
          </div>
        )}

        {/* Posts */}
        <div className={styles.posts}>
          {currentPosts.length === 0 ? (
            <p className={styles.noPosts}>
              {activeTab === 'thoughts' ? 'No thoughts yet.' : 'No bookmarks yet.'}
            </p>
          ) : (
            currentPosts.map(p => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>

      {showCopyMsg && createPortal(
        <div className={styles.copyPopup}>URL copied!</div>,
        document.body
      )}
    </>
  );
}