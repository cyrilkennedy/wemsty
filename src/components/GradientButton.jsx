// components/GradientButton.jsx
import Link from 'next/link';
import styles from './GradientButton.module.css';

export function GradientButton({ href, children, variant = 'primary' }) {
  const Component = href ? Link : 'button';
  return (
    <Component href={href} className={variant === 'ghost' ? styles.ghost : styles.primary}>
      {children}
    </Component>
  );
}