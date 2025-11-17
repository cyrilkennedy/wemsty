// components/ViewCount.jsx
'use client';
import { Eye } from 'lucide-react';
import styles from './ViewCount.module.css';

export function ViewCount({ count }) {
  return (
    <div className={styles.count}>
      <Eye size={16} />
      <span>{count}</span>
    </div>
  );
}