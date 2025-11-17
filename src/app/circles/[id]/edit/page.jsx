// src/app/circles/[id]/edit/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { ArrowLeft } from 'lucide-react';
import { MemberItem } from '@/components/MemberItem';
import styles from './edit.module.css';
import { removeCircleMember, removeCircleAdmin } from '@/lib/circleAdmin';

export default function EditCirclePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [circle, setCircle] = useState(null);
  const [tag, setTag] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(null);
  const [showRemoveAdmin, setShowRemoveAdmin] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      const snap = await getDoc(doc(db, 'circles', id));
      if (!snap.exists()) {
        router.push('/404');
        return;
      }
      const data = snap.data();
      if (!Array.isArray(data.admins) || !data.admins.includes(user.uid)) {
        router.push(`/circles/${id}`);
        return;
      }
      setCircle({ id: snap.id, ...data });
      setTag(data.tag || '');
      setName(data.name || '');
      setDescription(data.description || '');
    };
    load();
  }, [id, user, router]);

  const handleSave = async () => {
    if (!tag.trim() || !name.trim()) {
      alert('Tag and Name are required');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'circles', id), {
        tag: tag.trim(),
        name: name.trim(),
        description: description.trim()
      });
      router.push(`/circles/${id}`);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (uid) => {
    await removeCircleMember(id, uid);
    setShowRemoveMember(null);
  };

  const handleRemoveAdmin = async (uid) => {
    if (circle.createdBy === uid) {
      alert('Cannot remove original creator.');
      return;
    }
    await removeCircleAdmin(id, uid);
    setShowRemoveAdmin(null);
  };

  if (!circle) return <div className={styles.loading}>Loading...</div>;

  const isCreator = circle.createdBy === user.uid;

  return (
    <div className={styles.container}>
      <button onClick={() => router.push(`/circles/${id}`)} className={styles.backBtn}>
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className={styles.title}>Edit Circle</h1>

      <div className={styles.form}>
        <label className={styles.formLabel}>
          Tag
          <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="#my-circle" className={styles.input} />
        </label>
        <label className={styles.formLabel}>
          Name
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Circle" className={styles.input} />
        </label>
        <label className={styles.formLabel}>
          Description
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this circle about?" className={styles.textarea} rows={4} />
        </label>

        <div className={styles.actions}>
          <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => router.push(`/circles/${id}`)} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>

      {/* MEMBERS */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Members ({circle.members?.length || 0})</h2>
        <div className={styles.memberList}>
          {circle.members?.map(uid => (
            <MemberItem
              key={uid}
              uid={uid}
              canRemove={true}
              onRemove={() => setShowRemoveMember(uid)}
            />
          ))}
        </div>
      </div>

      {/* ADMINS */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Admins ({circle.admins?.length || 0})</h2>
        <div className={styles.memberList}>
          {circle.admins?.map(uid => (
            <MemberItem
              key={uid}
              uid={uid}
              isAdmin={true}
              canRemove={isCreator && uid !== circle.createdBy}
              onRemove={() => setShowRemoveAdmin(uid)}
            />
          ))}
        </div>
      </div>

      {/* CONFIRM MODALS */}
      {showRemoveMember && (
        <div className={styles.modalOverlay} onClick={() => setShowRemoveMember(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <p>Remove this member?</p>
            <div className={styles.modalActions}>
              <button onClick={() => handleRemoveMember(showRemoveMember)} className={styles.dangerBtn}>Remove</button>
              <button onClick={() => setShowRemoveMember(null)} className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRemoveAdmin && (
        <div className={styles.modalOverlay} onClick={() => setShowRemoveAdmin(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <p>Remove this admin?</p>
            <div className={styles.modalActions}>
              <button onClick={() => handleRemoveAdmin(showRemoveAdmin)} className={styles.dangerBtn}>Remove</button>
              <button onClick={() => setShowRemoveAdmin(null)} className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}