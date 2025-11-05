// components/Navbar.jsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, LogOut, Search } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { AuthModal } from './AuthModal';
import { signOutUser } from '@/lib/firebase';
import { searchEverything } from '@/lib/algolia';
import styles from './Navbar.module.css';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOutUser();
    setOpen(false);
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    // Optional: Add live search later
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={styles.desktop}>
        <Link href="/" className={styles.logo}>WEMSTY</Link>

        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search posts, circles, people..."
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        {user ? (
          <>
            <div className={styles.links}>
              <Link href="/sphere">Home</Link>
              <Link href="/explore">Explore</Link>
              <Link href="/circles">Circles</Link>
              <Link href="/create">Create</Link>
            </div>
            <div className={styles.userSection}>
              <span className={styles.userName}>{user.displayName || user.email}</span>
              <button onClick={handleSignOut} className={styles.signOutBtn}>
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.links}>
              <Link href="/">Home</Link>
            </div>
            <button onClick={() => setShowAuthModal(true)} className={styles.join}>
              Join
            </button>
          </>
        )}
      </nav>

      {/* Mobile Navbar */}
      <nav className={styles.mobile}>
        <Link href="/" className={styles.logo}>WEMSTY</Link>

        <div className={styles.mobileRight}>
          <div className={styles.mobileSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.mobileSearchInput}
            />
          </div>
          <button onClick={() => setOpen(!open)} className={styles.hamburger}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* RIGHT-SIDE HALF SCREEN MENU */}
      <div className={`${styles.mobileMenu} ${open ? styles.open : ''}`}>
        <div className={styles.menuContent}>
          {user ? (
            <>
              <Link href="/sphere" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/explore" onClick={() => setOpen(false)}>Explore</Link>
              <Link href="/circles" onClick={() => setOpen(false)}>Circles</Link>
              <Link href="/create" onClick={() => setOpen(false)}>Create</Link>
              <div className={styles.mobileUser}>
                <span>{user.displayName || user.email}</span>
                <button onClick={handleSignOut} className={styles.signOutBtnMobile}>
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/" onClick={() => setOpen(false)}>Home</Link>
              <button onClick={() => { setShowAuthModal(true); setOpen(false); }} className={styles.joinMobile}>
                Join WEMSTY
              </button>
            </>
          )}
        </div>
      </div>

      {/* LEFT HALF OVERLAY */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}