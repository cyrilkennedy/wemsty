// components/BottomNav.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Compass, User } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import styles from './BottomNav.module.css';

const items = [
  { href: '/sphere', icon: Home, label: 'Home' },
  // { href: '/explore', icon: Search, label: 'Explore' },
  { href: '/create', icon: PlusCircle, label: 'Create' },
  { href: '/circles', icon: Compass, label: 'Circles' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  // Don't show bottom nav if user is not logged in
  if (!user) return null;

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={styles.item}>
            <Icon size={24} className={active ? styles.activeIcon : ''} />
            <span className={active ? styles.activeLabel : ''}>{item.label}</span>
            {active && <div className={styles.activeBar} />}
          </Link>
        );
      })}
    </nav>
  );
}