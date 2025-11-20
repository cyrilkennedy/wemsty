// src/components/Avatar.jsx
import styles from './Avatar.module.css';

export function Avatar({ src, size = 'md', className = '' }) {
  // Pixel-perfect sizes matching real X (2025)
  const sizeMap = {
    sm: '32px',   // rarely used
    md: '48px',   // posts, replies, comments
    lg: '80px',   // profile header
  };

  const pixelSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`${styles.avatar} ${className}`.trim()}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {src ? (
        <img
          src={src}
          alt="profile"
          className={styles.img}
          loading="lazy"
        />
      ) : (
        <div className={styles.fallback} />
      )}
    </div>
  );
}