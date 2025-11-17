// components/Timestamp.jsx
import { formatDistanceToNow } from 'date-fns';
import styles from './Timestamp.module.css';

export function Timestamp({ date }) {
  if (!date) return null;
  const time = typeof date === 'object' ? date : date.toDate();
  return <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{formatDistanceToNow(time, { addSuffix: true })}</span>;
}