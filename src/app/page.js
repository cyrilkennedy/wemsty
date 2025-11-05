// src/app/page.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { GradientButton } from '@/components/GradientButton';
import { GlassCard } from '@/components/GlassCard';
import styles from './page.module.css';

const valueProps = [
  { icon: '🧠', title: 'Share Your Logic', desc: 'Post thoughts that make sense to you — no filters.' },
  { icon: '🤝', title: 'Connect Deeply', desc: 'Engage with thinkers who value clarity.' },
  { icon: '🚀', title: 'Grow Together', desc: 'Challenge ideas, refine perspectives.' },
];

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // Redirect logged-in users to their feed
  useEffect(() => {
    if (!loading && user) {
      router.push('/sphere');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Only show landing page to visitors
  if (user) return null; // Will redirect via useEffect

  return (
    <>
      {/* Hero Section - Only for visitors */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.logo}>WEMSTY</h1>
          <p className={styles.tagline}>What Ever Makes Sense To You</p>
          <p className={styles.subtitle}>Where logic meets creativity</p>
          <div className={styles.ctaGroup}>
            <GradientButton href="/auth">Join WEMSTY</GradientButton>
            <GradientButton href="/auth" variant="ghost">Sign In</GradientButton>
          </div>
          <div className={styles.trustBadge}>
            <span className={styles.badgeIcon}>✓</span>
            Trusted by 10,000+ thinkers
          </div>
        </div>
        <div className={styles.orbs}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
        </div>
      </section>

      {/* Value Props - Only for visitors */}
      <section className={styles.values}>
        <div className={styles.container}>
          <h2 className={styles.valuesTitle}>Why Join WEMSTY?</h2>
          <div className={styles.valueGrid}>
            {valueProps.map((prop, i) => (
              <GlassCard key={i} className={styles.valueCard}>
                <div className={styles.valueIcon}>{prop.icon}</div>
                <h3 className={styles.valueTitle}>{prop.title}</h3>
                <p className={styles.valueDesc}>{prop.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to share what makes sense to you?</h2>
          <p className={styles.ctaText}>Join thousands of thinkers already on WEMSTY</p>
          <GradientButton href="/auth" className={styles.ctaBtn}>
            Get Started Free
          </GradientButton>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.quote}>"Not everything has to make sense — just yours."</p>
          <div className={styles.links}>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/auth">Join</Link>
          </div>
          <p className={styles.copyright}>
            © 2025 <span className={styles.wemsty}>WEMSTY</span>. All thoughts reserved.
          </p>
        </div>
      </footer>
    </>
  );
}