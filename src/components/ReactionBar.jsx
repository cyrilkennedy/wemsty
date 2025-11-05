// components/ReactionBar.jsx
'use client';
import { useState } from 'react';
import { ReactionButton } from './ReactionButton';
import styles from './ReactionBar.module.css';

const reactions = [
  { emoji: 'Check', label: 'Makes Sense', color: '#FFD700' },
  { emoji: 'Lightbulb', label: 'Interesting', color: '#FFFFFF' },
  { emoji: 'Cross', label: 'Challenge', color: '#FF3333' },
];

export function ReactionBar({ postId, reactions: initial }) {
  const [counts, setCounts] = useState(initial || {});

  const handleReact = (label) => {
    setCounts(prev => ({ ...prev, [label]: (prev[label] || 0) + 1 }));
    // TODO: Save to Firestore
  };

  return (
    <div className={styles.bar}>
      <div className={styles.buttons}>
        {reactions.map(r => (
          <ReactionButton
            key={r.label}
            emoji={r.emoji}
            label={r.label}
            count={counts[r.label] || 0}
            onClick={() => handleReact(r.label)}
          />
        ))}
      </div>
      <span className={styles.total}>
        {Object.values(counts).reduce((a, b) => a + b, 0)} reactions
      </span>
    </div>
  );
}