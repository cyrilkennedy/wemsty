// components/Avatar.jsx
import styles from './Avatar.module.css';

export function Avatar({ src, size = 'md' }) {
  const sizes = { sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-20 h-20' };
  return (
    <div className={`${styles.avatar} ${sizes[size]}`}>
      <div className={styles.inner}>
        {src ? <img src={src} alt="" /> : <div className={styles.fallback} />}
      </div>
    </div>
  );
}