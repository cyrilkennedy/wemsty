// src/app/algolia-setup/page.jsx
'use client';
import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { indexPost, indexUser, indexCircle } from '@/lib/algolia';
import { useUser } from '@/hooks/useUser';

export default function AlgoliaSetupPage() {
  const { user, loading: userLoading } = useUser();
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState({ posts: 0, users: 0, circles: 0 });
  const [running, setRunning] = useState(false);

  const indexAllData = async () => {
    if (!user) {
      alert('You must be logged in.');
      return;
    }

    setRunning(true);
    setStatus('Starting Algolia indexing...');

    try {
      // ========== INDEX USERS ==========
      setStatus('📝 Indexing users...');
      const usersSnap = await getDocs(collection(db, 'users'));
      let userCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        await indexUser({
          uid: userDoc.id,
          displayName: userData.displayName || '',
          username: userData.username || '',
          bio: userData.bio || '',
          followers: userData.followers || 0,
          following: userData.following || 0
        });
        userCount++;
        setProgress(p => ({ ...p, users: userCount }));
      }

      // ========== INDEX POSTS ==========
      setStatus('📝 Indexing posts...');
      const postsSnap = await getDocs(collection(db, 'posts'));
      let postCount = 0;

      for (const postDoc of postsSnap.docs) {
        const postData = postDoc.data();
        
        // Get author info
        let authorName = 'Unknown';
        let username = 'unknown';
        if (postData.authorUid) {
          const authorDoc = await getDocs(collection(db, 'users'));
          const author = authorDoc.docs.find(d => d.id === postData.authorUid);
          if (author) {
            authorName = author.data().displayName || 'Unknown';
            username = author.data().username || 'unknown';
          }
        }

        await indexPost({
          id: postDoc.id,
          text: postData.text || '',
          author: { displayName: authorName, username: username },
          tags: postData.tags || [],
          circle: postData.circle || null,
          createdAt: postData.createdAt?.toDate(),
          mediaUrls: postData.mediaUrls || []
        });
        postCount++;
        setProgress(p => ({ ...p, posts: postCount }));
      }

      // ========== INDEX CIRCLES ==========
      setStatus('📝 Indexing circles...');
      const circlesSnap = await getDocs(collection(db, 'circles'));
      let circleCount = 0;

      for (const circleDoc of circlesSnap.docs) {
        const circleData = circleDoc.data();
        await indexCircle({
          id: circleDoc.id,
          name: circleData.name || '',
          tag: circleData.tag || '',
          members: circleData.members || 0,
          live: circleData.live || false,
          createdBy: circleData.createdBy || ''
        });
        circleCount++;
        setProgress(p => ({ ...p, circles: circleCount }));
      }

      setStatus(
        `✅ Algolia Setup Complete!\n\n` +
        `Indexed:\n` +
        `- ${userCount} users\n` +
        `- ${postCount} posts\n` +
        `- ${circleCount} circles\n\n` +
        `You can now search! 🎉`
      );
    } catch (error) {
      console.error('Algolia indexing error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setRunning(false);
    }
  };

  if (userLoading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔍 Algolia Setup</h1>
      
      <p style={styles.description}>
        This will index all your existing data into Algolia so you can search it.
        <br />
        <strong>Run this once</strong> to populate your search indexes.
      </p>

      <div style={styles.progress}>
        <div>👤 Users: {progress.users}</div>
        <div>📝 Posts: {progress.posts}</div>
        <div>⭕ Circles: {progress.circles}</div>
      </div>

      <button
        onClick={indexAllData}
        disabled={running}
        style={{
          ...styles.btn,
          opacity: running ? 0.6 : 1,
          cursor: running ? 'not-allowed' : 'pointer'
        }}
      >
        {running ? '⏳ Indexing...' : '🚀 Index All Data'}
      </button>

      {status && (
        <pre style={styles.status}>{status}</pre>
      )}

      <p style={styles.small}>
        ⚠️ This may take a few minutes depending on your data size.
        <br />
        After running, delete this page for security.
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '4rem auto',
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'white'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    marginBottom: '1rem'
  },
  description: {
    color: '#e2e8f0',
    lineHeight: 1.6,
    marginBottom: '1.5rem'
  },
  progress: {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '1.5rem 0',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 600
  },
  btn: {
    background: '#1da1f2',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.2s',
    minWidth: '200px',
    marginTop: '1rem'
  },
  status: {
    marginTop: '1.5rem',
    padding: '16px',
    borderRadius: '8px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#86efac',
    fontWeight: 500,
    textAlign: 'left',
    whiteSpace: 'pre-line',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.9rem',
    lineHeight: 1.6
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8'
  },
  small: {
    marginTop: '2rem',
    color: '#64748b',
    fontSize: '0.85rem'
  }
};