import { useState, useEffect } from 'react';
import { searchEverything } from '@/lib/algolia';
import { X } from 'lucide-react';
import styles from './Search.module.css';

export function Search({ onResults, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-search when initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Searching for:', query);
      const searchResults = await searchEverything(query);
      console.log('📦 Raw results:', searchResults);
      
      const formatted = {
        circles: searchResults.results[0]?.hits || [],
        posts: searchResults.results[1]?.hits || [],
        users: searchResults.results[2]?.hits || [],
        tags: searchResults.results[3]?.hits || []
      };
      
      console.log('✅ Formatted results:', formatted);
      
      if (onResults) {
        onResults(formatted);
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setError('');
    if (onResults) {
      onResults({ circles: [], posts: [], users: [], tags: [] });
    }
  };

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.form}>
        <div className={styles.inputWrapper}>
          <input
            placeholder="Search posts, users, circles, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className={styles.input}
            disabled={loading}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearBtn}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button 
          type="button"
          onClick={handleSearch}
          className={styles.btn} 
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}