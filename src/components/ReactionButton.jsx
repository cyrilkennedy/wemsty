// components/ReactionButton.jsx
import styles from './ReactionButton.module.css';

export function ReactionButton({ emoji, label, count, onClick }) {
  return (
    <button onClick={onClick} className={styles.button}>
      <span className={styles.emoji}>{emoji}</span>
      <span className={styles.count}>{count}</span>
    </button>
  );
}