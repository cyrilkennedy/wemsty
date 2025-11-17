// components/PrivacyToggle.jsx
'use client';
import { Globe, Users, Lock } from 'lucide-react';
import styles from './PrivacyToggle.module.css';

const options = [
  { value: 'global', label: 'Global', icon: Globe },
  { value: 'circle', label: 'Circle', icon: Users },
  { value: 'private', label: 'Private', icon: Lock },
];

export function PrivacyToggle({ value, onChange }) {
  return (
    <div className={styles.toggle}>
      {options.map(opt => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={value === opt.value ? styles.active : styles.btn}
          >
            <Icon size={18} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}