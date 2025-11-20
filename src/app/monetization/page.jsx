// src/app/monetization/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { subscribeToPlan, getPlanDetails } from '@/lib/paystack';
import { ArrowLeft, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { serverTimestamp } from 'firebase/firestore';

export default function MonetizationPage() {
  const { user } = useUser();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [tier, setTier] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      setTier(data.monetization?.tier || null);
    }
  };

  const subscribe = (planId) => {
    const plan = getPlanDetails(planId);
    if (!plan) return alert('Invalid plan');

    setLoadingPlan(planId);
    const ref = `wemsty_${Date.now()}_${user.uid}`;

    const handler = window.PaystackPop.setup({
  key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
  email: user.email,
  amount: plan.amount * 100,
  currency: 'NGN',
  ref,
  metadata: { planId, uid: user.uid },
  // ADD THIS LINE — FORCES TEST MODE CARD ONLY
  channels: ['card'],
  callback: (response) => {
    verifyAndActivate(response, planId);
  },
  onClose: () => setLoadingPlan(null),
});
    handler.openIframe();
  };
// ONLY CHANGE THESE PARTS — rest of your file stays EXACTLY the same

// In src/app/monetization/page.jsx - replace verifyAndActivate function with this:

const verifyAndActivate = async (response, planId) => {
  try {
    // 1️⃣ Verify with backend
    const res = await fetch('/api/paystack/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: response.reference,
        expectedAmount: getPlanDetails(planId).amount,
        uid: user.uid,
        planId: planId,
      }),
    });

    const verifyRes = await res.json();

    if (verifyRes.success) {
      // 2️⃣ Write to Firestore as authenticated client
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'monetization.tier': verifyRes.monetization.tier,
        'monetization.active': verifyRes.monetization.active,
        'monetization.expiresAt': verifyRes.monetization.expiresAt,
        'monetization.updatedAt': serverTimestamp(), // Use server timestamp
        'monetization.lastReference': verifyRes.monetization.lastReference,
      });

      // 3️⃣ Update UI
      await fetchUserData();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } else {
      alert('Payment failed: ' + verifyRes.error);
    }
  } catch (error) {
    console.error('Verification error:', error);
    alert('Error: ' + error.message);
  } finally {
    setLoadingPlan(null);
  }
};

  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to unsubscribe? No refunds will be issued.')) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        'monetization.active': false,
        'monetization.tier': null,
      });
      setTier(null);
      setShowUnsubscribe(false);
      alert('Unsubscribed successfully');
    } catch (error) {
      alert('Failed to unsubscribe: ' + error.message);
    }
  };

  const plans = [
    {
      id: 'creator_monthly',
      tier: 'creator',
      name: 'Creator',
      price: 2500,
      yearly: false,
      badge: '🔵 Blue Tick',
      badgeColor: '#2563eb',
      tagline: 'Start earning from your content',
      features: [
        { text: 'Earn ₦5 per like', locked: false },
        { text: 'Blue verification badge', locked: false },
        { text: 'Basic analytics dashboard', locked: false },
        { text: 'Trending feed access', locked: false },
        { text: 'Earn from comments', locked: false },
        { text: 'Run in-house ads', locked: true },
        { text: 'Full analytics suite', locked: true },
      ],
    },
    {
      id: 'creator_yearly',
      tier: 'creator',
      name: 'Creator (Yearly)',
      price: 27000,
      yearly: true,
      badge: '🔵 Blue Tick',
      badgeColor: '#2563eb',
      tagline: 'Save ₦3,000 yearly',
      features: [
        { text: 'Earn ₦5 per like', locked: false },
        { text: 'Blue verification badge', locked: false },
        { text: 'Basic analytics dashboard', locked: false },
        { text: 'Save ₦3,000 per year', locked: false },
        { text: 'Earn from comments', locked: false },
        { text: 'Run in-house ads', locked: true },
        { text: 'Full analytics suite', locked: true },
      ],
    },
    {
      id: 'pro_monthly',
      tier: 'pro',
      name: 'Creator Pro',
      price: 5000,
      yearly: false,
      badge: '⚪ White Tick',
      badgeColor: '#e5e7eb',
      tagline: 'Maximize your earnings',
      features: [
        { text: 'Earn ₦5 per like', locked: false },
        { text: 'Earn ₦0.75 per comment', locked: false },
        { text: 'White verification badge', locked: false },
        { text: 'Extended analytics insights', locked: false },
        { text: 'Priority support', locked: false },
        { text: 'Run in-house ads', locked: true },
        { text: 'Business tools', locked: true },
      ],
    },
    {
      id: 'pro_yearly',
      tier: 'pro',
      name: 'Creator Pro (Yearly)',
      price: 54000,
      yearly: true,
      badge: '⚪ White Tick',
      badgeColor: '#e5e7eb',
      tagline: 'Save ₦6,000 yearly',
      features: [
        { text: 'Earn ₦5 per like', locked: false },
        { text: 'Earn ₦0.75 per comment', locked: false },
        { text: 'White verification badge', locked: false },
        { text: 'Extended analytics insights', locked: false },
        { text: 'Save ₦6,000 per year', locked: false },
        { text: 'Run in-house ads', locked: true },
        { text: 'Business tools', locked: true },
      ],
    },
    {
      id: 'enterprise_monthly',
      tier: 'enterprise',
      name: 'Enterprise',
      price: 7000,
      yearly: false,
      badge: '🟡 Yellow Tick',
      badgeColor: '#eab308',
      tagline: 'For serious creators & brands',
      features: [
        { text: 'Earn ₦5 per like', locked: false },
        { text: 'Earn ₦0.75 per comment', locked: false },
        { text: 'Yellow verification badge', locked: false },
        { text: 'Run in-house ads', locked: false },
        { text: 'Full analytics dashboard', locked: false },
        { text: 'Ads manager access', locked: false },
        { text: 'Brand partnership tools', locked: false },
      ],
    },
    {
      id: 'enterprise_yearly',
      tier: 'enterprise',
      name: 'Enterprise (Yearly)',
      price: 75600,
      yearly: true,
      badge: '🟡 Yellow Tick',
      badgeColor: '#eab308',
      tagline: 'Save ₦8,400 yearly',
      features: [
        { text: 'Earn ₦5 per like', locked: false },
        { text: 'Earn ₦0.75 per comment', locked: false },
        { text: 'Yellow verification badge', locked: false },
        { text: 'Run in-house ads', locked: false },
        { text: 'Full analytics dashboard', locked: false },
        { text: 'Save ₦8,400 per year', locked: false },
        { text: 'Priority brand support', locked: false },
      ],
    },
  ];

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Please sign in to access monetization.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showSuccess && (
        <div className={styles.success}>
          <CheckCircle size={20} />
          Subscription activated!
        </div>
      )}

      <div className={styles.header}>
        <Link href="/sphere" className={styles.back}>
          <ArrowLeft size={24} />
        </Link>
        <h1>Monetization Plans</h1>
      </div>

      {tier && (
        <div className={styles.currentTier}>
          <div className={styles.badge} data-tier={tier}>
            {tier === 'creator' && '🔵 Blue Tick'}
            {tier === 'pro' && '⚪ White Tick'}
            {tier === 'enterprise' && '🟡 Yellow Tick'}
          </div>
          <h3>Active Subscription: {tier.toUpperCase()}</h3>
          <button onClick={() => setShowUnsubscribe(!showUnsubscribe)} className={styles.unsubBtn}>
            {showUnsubscribe ? 'Cancel' : 'Unsubscribe'}
          </button>
          
          {showUnsubscribe && (
            <div className={styles.unsubWarning}>
              <AlertTriangle size={18} />
              <p><strong>No refunds will be issued.</strong> Your subscription will remain active until the end of your billing period.</p>
              <button onClick={handleUnsubscribe} className={styles.confirmUnsubBtn}>
                Confirm Unsubscribe
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.plansScroll}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles.planCard} data-tier={plan.tier}>
            <div className={styles.planHeader}>
              <div>
                <h3>{plan.name}</h3>
                <p className={styles.tagline}>{plan.tagline}</p>
              </div>
              <div className={styles.badge} style={{ background: plan.badgeColor }}>
                {plan.badge}
              </div>
            </div>

            <div className={styles.price}>
              <span className={styles.amount}>₦{plan.price.toLocaleString()}</span>
              <span className={styles.period}>/{plan.yearly ? 'year' : 'month'}</span>
            </div>

            <ul className={styles.features}>
              {plan.features.map((feature, i) => (
                <li key={i} className={feature.locked ? styles.locked : ''}>
                  {feature.locked ? (
                    <>
                      <Lock size={16} />
                      <span>{feature.text}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>{feature.text}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <button
              onClick={() => subscribe(plan.id)}
              disabled={loadingPlan !== null || tier === plan.tier}
              className={styles.subscribeBtn}
            >
              {loadingPlan === plan.id
                ? 'Processing...'
                : tier === plan.tier
                ? 'Current Plan'
                : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>💡 <strong>View your earnings and analytics in Settings → Dashboard</strong></p>
      </div>
    </div>
  );
}