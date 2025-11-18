// src/app/search/SearchPageClient.jsx
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from '@/components/Search';
import Link from 'next/link';
import styles from './page.module.css';

export default function SearchPageClient() {
  const [results, setResults] = useState(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // ... rest of your existing code stays exactly the same


  const handleResults = (newResults) => {
    console.log('Got results:', newResults);
    setResults(newResults);
  };

  const totalResults = results 
    ? results.posts.length + results.users.length + results.circles.length + results.tags.length
    : 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Search</h1>
      
      <Search onResults={handleResults} initialQuery={initialQuery} />

      {results && (
        <div className={styles.results}>
          <div className={styles.resultHeader}>
            {totalResults === 0 ? (
              <p>No results found. Try different keywords.</p>
            ) : (
              <p>Found {totalResults} result{totalResults !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* POSTS */}
          {results.posts.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📝 Posts ({results.posts.length})</h2>
              <div className={styles.list}>
                {results.posts.map(post => (
                  <Link 
                    href={`/post/${post.objectID}`} 
                    key={post.objectID}
                    className={styles.card}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.author}>{post.authorName}</span>
                      <span className={styles.username}>@{post.username}</span>
                    </div>
                    <p className={styles.text}>{post.text}</p>
                    {post.tags?.length > 0 && (
                      <div className={styles.tags}>
                        {post.tags.map(tag => (
                          <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* USERS */}
          {results.users.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>👤 Users ({results.users.length})</h2>
              <div className={styles.list}>
                {results.users.map(user => (
                  <Link 
                    href={`/profile/${user.objectID}`} 
                    key={user.objectID}
                    className={styles.card}
                  >
                    <div className={styles.displayName}>{user.displayName}</div>
                    <div className={styles.username}>@{user.username}</div>
                    {user.bio && <p className={styles.bio}>{user.bio}</p>}
                    <div className={styles.stats}>
                      <span>{user.followers || 0} followers</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CIRCLES */}
          {results.circles.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>⭕ Circles ({results.circles.length})</h2>
              <div className={styles.list}>
                {results.circles.map(circle => (
                  <Link 
                    href={`/circles/${circle.objectID}`}
                    key={circle.objectID}
                    className={styles.card}
                  >
                    <div className={styles.circleName}>{circle.name}</div>
                    <div className={styles.circleTag}>#{circle.tag}</div>
                    <div className={styles.stats}>
                      <span>{circle.members || 0} members</span>
                      {circle.live && <span className={styles.liveBadge}>🔴 Live</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* TAGS */}
          {results.tags.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🏷️ Tags ({results.tags.length})</h2>
              <div className={styles.tagsList}>
                {results.tags.map(tag => (
                  <div 
                    key={tag.objectID} 
                    className={styles.tagCard}
                    onClick={() => alert(`Tag search coming soon! Search for #${tag.name} to see posts with this tag.`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={styles.tagName}>#{tag.name}</span>
                    <span className={styles.tagCount}>{tag.count} posts</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}