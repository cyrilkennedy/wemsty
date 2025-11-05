// components/Confetti.jsx
'use client';
import { useEffect, useState } from 'react';
import styles from './Confetti.module.css';

export function Confetti() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ['#FFD700', '#5A00FF', '#00D4FF'];
    const newPieces = Array.from({ length: 50 }, () => ({
      left: Math.random() * 100 + '%',
      delay: Math.random() * 3 + 's',
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className={styles.container}>
      {pieces.map((p, i) => (
        <div key={i} className={styles.piece} style={{ left: p.left, animationDelay: p.delay, background: p.color }} />
      ))}
    </div>
  );
}