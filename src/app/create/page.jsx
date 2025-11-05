// src/app/create/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { createPost } from '@/lib/posts';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, Image, Send, Globe, Lock } from 'lucide-react';
import { searchEverything } from '@/lib/algolia';
import styles from './page.module.css';

export default function CreatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useUser();
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [privacy, setPrivacy] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const circleId = searchParams.get('circleId');
    const privacyParam = searchParams.get('privacy');
    if (circleId && privacyParam && ['global', 'circle', 'both'].includes(privacyParam)) {
      setPrivacy(privacyParam);
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = await searchEverything(searchQuery);
    setSearchResults(results.results[0]?.hits || []);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setMedia(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    setPosting(true);
    try {
      let mediaUrl = null;
      if (media) {
        setUploading(true);
        mediaUrl = await uploadToCloudinary(media);
        setUploading(false);
      }

      await createPost({
        text: text.trim(),
        media: mediaUrl,
        authorUid: user.uid,
        circleId: selectedCircle?.id || null,
        privacy
      });

      router.push(privacy === 'global' ? '/' : `/circles/${selectedCircle?.id || ''}`);
    } catch (error) {
      console.error(error);
      alert('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.header}>
          <img src={user.photoURL || '/default-avatar.png'} alt={user.displayName} className={styles.avatar} />
          <div>
            <h3 className={styles.name}>{user.displayName}</h3>
            <p className={styles.handle}>@{user.username || 'user'}</p>
          </div>
        </div>

        <textarea
          placeholder="What's making sense to you?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.textarea}
          maxLength={500}
        />
        <div className={styles.charCount}>{text.length}/500</div>

        {preview && (
          <div className={styles.preview}>
            <img src={preview} alt="Preview" className={styles.previewImg} />
            <button type="button" onClick={removeImage} className={styles.removeBtn}><X size={18} /></button>
          </div>
        )}

        <div className={styles.searchBox}>
          <input
            placeholder="Search circles to post in..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={handleSearch}
            className={styles.searchInput}
          />
          <div className={styles.searchResults}>
            {searchResults.map(c => (
              <button
                key={c.objectID}
                type="button"
                onClick={() => {
                  setSelectedCircle(c);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className={styles.resultItem}
              >
                #{c.tag} • {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.privacy}>
          <button type="button" onClick={() => setPrivacy('global')} className={privacy === 'global' ? styles.active : ''}>
            <Globe size={16} /> Global
          </button>
          {selectedCircle && (
            <>
              <button type="button" onClick={() => setPrivacy('circle')} className={privacy === 'circle' ? styles.active : ''}>
                <Lock size={16} /> Circle Only
              </button>
              <button type="button" onClick={() => setPrivacy('both')} className={privacy === 'both' ? styles.active : ''}>
                <Globe size={16} /> Also Global
              </button>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <label className={styles.imageBtn}>
            <Image size={22} />
            <input type="file" accept="image/*" onChange={handleImage} hidden disabled={uploading || posting} />
          </label>
          <button type="submit" disabled={posting || uploading} className={styles.postBtn}>
            {posting || uploading ? 'Posting...' : <><Send size={20} /> Post</>}
          </button>
        </div>
      </form>
    </div>
  );
}