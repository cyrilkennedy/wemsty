// src/components/RepostIndicator.jsx
import { Repeat2 } from 'lucide-react';
import Link from 'next/link';
import styles from './RepostIndicator.module.css';

export function RepostIndicator({ repostedBy }) {
  return (
    <div className={styles.indicator}>
      <Repeat2 size={14} className={styles.icon} />
      <span>
        <Link href={`/profile/${repostedBy.uid}`} className={styles.link}>
          {repostedBy.displayName}
        </Link>
        {' '}reposted
      </span>
    </div>
  );
}