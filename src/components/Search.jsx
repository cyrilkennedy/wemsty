// components/Search.jsx
'use client';

import { useState } from 'react';
import { searchEverything } from '@/lib/algolia';
import styles from './Search.module.css';

export function Search({ onResults }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchEverything(query);
      const formatted = {
        circles: searchResults.results[0]?.hits || [],
        posts: searchResults.results[1]?.hits || [],
        users: searchResults.results[2]?.hits || [],
        tags: searchResults.results[3]?.hits || []
      };
      setResults(formatted);
      onResults(formatted);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={styles.form}>
      <input
        placeholder="Search posts, users, circles, tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
        disabled={loading}
      />
      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}