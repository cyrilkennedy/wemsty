// components/Navbar.jsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Compass, 
  Users, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Search,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Shield,
  BarChart3,
  Megaphone
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { AuthModal } from './AuthModal';
import { signOutUser } from '@/lib/firebase';
import styles from './Navbar.module.css';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    setOpen(false);
    setShowSettings(false);
  };

  const handleNavClick = (href) => {
    if (!user && href !== '/') {
      setShowAuthModal(true);
      setOpen(false);
      return;
    }
    router.push(href);
    setOpen(false);
    setShowSettings(false);
  };

  const mainNav = [
    { href: '/sphere', label: 'Home', icon: Home, authRequired: true },
    // { href: '/explore', label: 'Explore', icon: Compass, authRequired: true },
    { href: '/circles', label: 'Circles', icon: Users, authRequired: true },
    { href: '/create', label: 'Create', icon: PlusCircle, authRequired: true },
  ];

  const settingsMenu = [
    { href: '/monetization/policy', label: 'Monetization Policy', icon: Shield },
    { href: '/monetization/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/monetization/ads', label: 'Ads Manager', icon: Megaphone },
    { href: '/monetization', label: 'Subscribe', icon: DollarSign },
  ];

  return (
    <>
      {/* TOP BAR */}
      <nav className={styles.topBar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>WEMSTY</span>
        </Link>
        <div className={styles.topRight}>
          <button 
            onClick={() => handleNavClick('/search')} 
            className={styles.searchBtn}
            aria-label="Search"
          >
            <Search size={22} />
          </button>
          <button 
            onClick={() => setOpen(!open)} 
            className={styles.hamburger}
            aria-label="Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* LEFT SIDEBAR */}
      <div className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logoSidebar} onClick={() => setOpen(false)}>
            <span className={styles.logoGradient}>WEMSTY</span>
          </Link>
        </div>

        <div className={styles.menuItems}>
          {user ? (
            <>
              {/* MAIN LINKS */}
              {mainNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={styles.menuItem}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}

              {/* SETTINGS DROPDOWN */}
              <div className={styles.dropdown}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={styles.dropdownToggle}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                  {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {showSettings && (
                  <div className={styles.dropdownMenu}>
                    {settingsMenu.map(({ href, label, icon: Icon }) => (
                      <Link 
                        key={href}
                        href={href} 
                        onClick={() => { setOpen(false); setShowSettings(false); }} 
                        className={styles.dropdownItem}
                      >
                        <Icon size={18} />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* USER PROFILE */}
              <div className={styles.userSection}>
                <Link 
                  href={`/profile/${user.uid}`} 
                  onClick={() => setOpen(false)}
                  className={styles.userInfo}
                >
                  <div className={styles.avatarPlaceholder}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" />
                    ) : (
                      <div className={styles.initial}>
                        {user.displayName?.[0] || user.email[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <p className={styles.userName}>{user.displayName || 'User'}</p>
                    <p className={styles.userEmail}>{user.email}</p>
                  </div>
                </Link>
                <button onClick={handleSignOut} className={styles.signOutBtn}>
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* GUEST NAVIGATION */}
              <Link href="/" onClick={() => setOpen(false)} className={styles.menuItem}>
                <Home size={20} />
                <span>Home</span>
              </Link>
              
              {mainNav.slice(0, 2).map(({ href, label, icon: Icon }) => (
                <button
                  key={href}
                  onClick={() => handleNavClick(href)}
                  className={styles.menuItemDisabled}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                  <span className={styles.lockBadge}>🔒</span>
                </button>
              ))}

              <button
                onClick={() => { setShowAuthModal(true); setOpen(false); }}
                className={styles.joinBtn}
              >
                <PlusCircle size={20} />
                <span>Join WEMSTY</span>
              </button>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.sidebarFooter}>
          <p>© 2024 Wemsty</p>
        </div>
      </div>

      {/* OVERLAY */}
      {open && (
        <div 
          className={styles.overlay} 
          onClick={() => {
            setOpen(false);
            setShowSettings(false);
          }} 
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}