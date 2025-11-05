// components/CircleCard.jsx
import { useRouter } from 'next/navigation';
import styles from './CircleCard.module.css';
import { Users, Zap } from 'lucide-react';

export function CircleCard({ id, name, tag, members, live }) {
  const router = useRouter();

  return (
    <div
      className={styles.card}
      onClick={() => router.push(`/circles/${id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.header}>
        <div className={styles.icon}>
          {live ? <Zap size={20} /> : <Users size={20} />}
        </div>
        <span className={styles.tag}>#{tag}</span>
      </div>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.members}>{members} members</p>
      <div className={styles.joinBtn}>View Feed</div>
    </div>
  );
}