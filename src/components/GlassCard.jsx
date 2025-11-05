// components/GlassCard.jsx
import styles from './GlassCard.module.css';

export function GlassCard({ children, className = '' }) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}