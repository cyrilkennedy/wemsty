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
import styles from './page.module.css';
import { createPortal } from 'react-dom';

export default function ProfilePage() {
  const { uid } = useParams();
  const { user: currentUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const fileInputRef = useRef(null);

  const isOwner = currentUser?.uid === uid;
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${uid}`
    : '';

  /* --------------------------------------------------------------- */
  /* 1. Load profile + posts                                         */
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

    const q = query(
      collection(db, 'posts'),
      where('author.uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate(),
      }));
      setPosts(list);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  /* --------------------------------------------------------------- */
  /* 2. Username availability check                                   */
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
  /* 3. Image upload (Cloudinary)                                    */
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
  /* 4. Save profile                                                 */
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
  /* 5. Share → copy URL + tiny popup                                 */
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

  /* --------------------------------------------------------------- */
  /* Render                                                          */
  /* --------------------------------------------------------------- */
  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!profile) return null;

  return (
    <>
      {/* ==== MAIN CONTENT (safe under navbar) ==== */}
      <div className={styles.container}>
        <div className={styles.header}>
          {/* Avatar */}
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

          {/* Info */}
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
                <h1 className={styles.displayName}>{profile.displayName}</h1>
                {profile.username && <p className={styles.username}>@{profile.username}</p>}
                <p className={styles.bio}>{profile.bio || 'No bio yet.'}</p>
              </>
            )}

            <div className={styles.stats}>
              <span><strong>{posts.length}</strong> Thoughts</span>
              <span><strong>{profile.followers || 0}</strong> Followers</span>
            </div>

            <div className={styles.actions}>
              <button onClick={copyProfileLink} className={styles.shareBtn}>
                Share Profile
              </button>

              {isOwner && !isEditing && (
                <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                  Edit Profile
                </button>
              )}
              {isEditing && (
                <>
                  <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.posts}>
          {posts.length === 0 ? (
            <p className={styles.noPosts}>No thoughts yet.</p>
          ) : (
            posts.map(p => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>

      {/* ==== URL COPIED POPUP ==== */}
      {showCopyMsg && createPortal(
        <div className={styles.copyPopup}>URL copied!</div>,
        document.body
      )}
    </>
  );
}