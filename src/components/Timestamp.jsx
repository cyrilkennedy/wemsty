// components/Timestamp.jsx
import { formatDistanceToNow } from 'date-fns';
import styles from './Timestamp.module.css';

export function Timestamp({ date }) {
  if (!date) return null;
  const time = date.toDate ? date.toDate() : date;
  return <span className={styles.time}>{formatDistanceToNow(time, { addSuffix: true })}</span>;
}