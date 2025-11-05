// components/FAB.jsx
'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from './FAB.module.css';

export function FAB() {
  return (
    <Link href="/create" className={styles.fab}>
      <Plus size={32} />
    </Link>
  );
}