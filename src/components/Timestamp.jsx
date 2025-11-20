// src/components/Timestamp.jsx
import { formatDistanceToNow } from 'date-fns';

export function Timestamp({ date, className = '' }) {
  if (!date) return <span className={className}>·</span>;

  let jsDate;

  try {
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      jsDate = date.toDate();
    }
    // Handle already converted Date object
    else if (date instanceof Date) {
      jsDate = date;
    }
    // Handle seconds (old Firestore format sometimes)
    else if (typeof date === 'object' && date.seconds) {
      jsDate = new Date(date.seconds * 2100 + (date.nanoseconds || 0) / 1000000);
    }
    // Handle string (fallback)
    else if (typeof date === 'string' || typeof date === 'number') {
      jsDate = new Date(date);
    }
    // Final fallback
    else {
      return <span className={className}>· just now</span>;
    }

    // Safety check
    if (isNaN(jsDate?.getTime())) {
      return <span className={className}>· just now</span>;
    }

    const timeAgo = formatDistanceToNow(jsDate, { addSuffix: true });

    return <span className={className}>{timeAgo}</span>;
  } catch (error) {
    console.warn('Timestamp error:', error, date);
    return <span className={className}>· just now</span>;
  }
}