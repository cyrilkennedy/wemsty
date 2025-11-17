// lib/formatDate.js
import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  const d = typeof date === 'object' ? date : date.toDate();
  return format(d, 'MMM d, yyyy');
};

export const timeAgo = (date) => {
  const d = typeof date === 'object' ? date : date.toDate();
  return formatDistanceToNow(d, { addSuffix: true });
};