'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { ArrowLeft, Plus, Clock, Eye, TrendingUp, Megaphone, Lock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdsManagerPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState(null);
  const [activeAds, setActiveAds] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adType, setAdType] = useState('duration');
  const [selectedPost, setSelectedPost] = useState(null);
  const [creating, setCreating] = useState(false);

  const durationPricing = [
    { duration: 1, label: '1 hour', price: 200 },
    { duration: 6, label: '6 hours', price: 1000 },
    { duration: 12, label: '12 hours', price: 1800 },
    { duration: 24, label: '24 hours', price: 4500 },
    { duration: 48, label: '48 hours', price: 8500 },
    { duration: 72, label: '72 hours', price: 12000 },
  ];
  const impressionPricing = [
    { impressions: 1000, label: '1,000 views', price: 3000 },
    { impressions: 5000, label: '5,000 views', price: 7000 },
    { impressions: 10000, label: '10,000 views', price: 15000 },
    { impressions: 20000, label: '20,000 views', price: 28000 },
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/sphere');
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (!userSnap.exists()) return setLoading(false);
      const data = userSnap.data();
      setTier(data.monetization?.tier);
      if (!data.monetization?.tier) return setLoading(false);

      const postsSnap = await getDocs(query(collection(db, 'posts'), where('authorUid', '==', user.uid)));
      const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUserPosts(posts);

      const adsSnap = await getDocs(query(
        collection(db, 'ads'),
        where('authorUid', '==', user.uid),
        where('status', '==', 'active')
      ));
      const ads = adsSnap.docs.map(d => {
        const ad = d.data();
        return {
          id: d.id,
          ...ad,
          postText: posts.find(p => p.id === ad.postId)?.text || 'Post not found',
          createdAt: ad.createdAt?.toDate(),
        };
      });
      setActiveAds(ads);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // DELETE AD
  const deleteAd = async (adId, postId) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'ads', adId));
      await updateDoc(doc(db, 'posts', postId), { isPromoted: false, promotedAt: null });
      setActiveAds(prev => prev.filter(a => a.id !== adId));
      alert('Ad deleted');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // PROMOTE EXISTING POST
  const createAd = async (pricing) => {
    if (!selectedPost) return alert('Select a post');
    setCreating(true);
    try {
      const ref = `ad_${Date.now()}_${user.uid}`;
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: user.email,
        amount: pricing.price * 100,
        currency: 'NGN',
        ref,
        metadata: {
          postId: selectedPost,
          adType,
          ...(adType === 'duration' ? { duration: pricing.duration } : { impressions: pricing.impressions }),
          uid: user.uid,
        },
        callback: async (res) => {
          const verify = await fetch('/api/paystack/verify', {
            method: 'POST',
            body: JSON.stringify({ reference: res.reference, expectedAmount: pricing.price }),
          });
          const { success } = await verify.json();
          if (!success) return alert('Payment failed');
          const adData = {
            postId: selectedPost,
            authorUid: user.uid,
            type: adType,
            status: 'active',
            impressions: 0,
            spent: pricing.price,
            reference: res.reference,
            createdAt: serverTimestamp(),
          };
          if (adType === 'duration') {
            adData.duration = pricing.duration;
            adData.expiresAt = new Date(Date.now() + pricing.duration * 3600000);
          } else {
            adData.targetImpressions = pricing.impressions;
          }
          await addDoc(collection(db, 'ads'), adData);
          await updateDoc(doc(db, 'posts', selectedPost), { isPromoted: true, promotedAt: serverTimestamp() });
          alert('Ad created!');
          setShowCreateModal(false);
          setSelectedPost(null);
          fetchData();
        },
        onClose: () => setCreating(false),
      });
      handler.openIframe();
    } catch (err) {
      alert('Error: ' + err.message);
      setCreating(false);
    }
  };

  const calculateRemaining = (ad) => {
    if (ad.type === 'duration') {
      const now = new Date();
      const expires = ad.expiresAt?.toDate?.() || new Date(ad.expiresAt);
      const hrs = Math.max(0, Math.ceil((expires - now) / 3600000));
      return `${hrs}h remaining`;
    }
    return `${ad.impressions || 0}/${ad.targetImpressions} views`;
  };

  if (authLoading || loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  if (!tier) {
    return (
      <div className={styles.container}>
        <div className={styles.noAccess}>
          <Lock size={64} />
          <h2>Verified Badge Required</h2>
          <p>You need a verified badge to run ads</p>
          <Link href="/monetization" className={styles.upgradeBtn}>Get Verified</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <Link href="/sphere" className={styles.back}><ArrowLeft size={24} /></Link>
        <h1>Ads Manager</h1>
        <div className={styles.createWrapper}>
          <button onClick={() => setShowCreateMenu(!showCreateMenu)} className={styles.createBtn}>
            <Plus size={20} /> Create Ad <ChevronDown size={16} />
          </button>
          {showCreateMenu && (
            <div className={styles.createDropdown}>
              <button onClick={() => { setShowCreateModal(true); setShowCreateMenu(false); }}>
                Promote Existing Post
              </button>
              <button onClick={() => { router.push('/monetization/ads/create-ad'); setShowCreateMenu(false); }}>
                Create New Ad Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <TrendingUp size={24} />
          <div><p className={styles.statLabel}>Active Ads</p><p className={styles.statValue}>{activeAds.length}</p></div>
        </div>
        <div className={styles.statCard}>
          <Eye size={24} />
          <div><p className={styles.statLabel}>Total Impressions</p><p className={styles.statValue}>
            {activeAds.reduce((s, a) => s + (a.impressions || 0), 0).toLocaleString()}
          </p></div>
        </div>
        <div className={styles.statCard}>
          <DollarSignIcon size={24} />
          <div><p className={styles.statLabel}>Total Spent</p><p className={styles.statValue}>
            ₦{activeAds.reduce((s, a) => s + (a.spent || 0), 0).toLocaleString()}
          </p></div>
        </div>
      </div>

      {/* ACTIVE ADS */}
      <div className={styles.section}>
        <h2>Active Campaigns</h2>
        {activeAds.length === 0 ? (
          <div className={styles.emptyState}>
            <Megaphone size={48} />
            <p>No active ads yet</p>
            <button onClick={() => setShowCreateMenu(true)} className={styles.emptyBtn}>Create Your First Ad</button>
          </div>
        ) : (
          <div className={styles.adsList}>
            {activeAds.map(ad => (
              <div key={ad.id} className={styles.adCard}>
                <div className={styles.adHeader}>
                  <span className={styles.adStatus}>{ad.status}</span>
                  <span className={styles.adType}>
                    {ad.type === 'duration' ? <Clock size={16} /> : <Eye size={16} />}
                    {ad.type === 'duration' ? 'Duration-based' : 'Impression-based'}
                  </span>
                </div>
                <div className={styles.adContent}>
                  <p className={styles.adText}>{ad.postText.slice(0, 100)}...</p>
                </div>
                <div className={styles.adStats}>
                  <div className={styles.adStat}><Eye size={18} /><span>{(ad.impressions || 0).toLocaleString()} impressions</span></div>
                  <div className={styles.adStat}><Clock size={18} /><span>{calculateRemaining(ad)}</span></div>
                </div>
                <div className={styles.adFooter}>
                  Spent: ₦{(ad.spent || 0).toLocaleString()}
                  <button onClick={() => deleteAd(ad.id, ad.postId)} className={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.noteBox}>
        <p>Note: Promoted posts do not earn monetization revenue</p>
      </div>

      {/* MODAL: PROMOTE EXISTING POST */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Promote Existing Post</h2>
            <div className={styles.modalSection}>
              <label>Select Post</label>
              <select value={selectedPost || ''} onChange={e => setSelectedPost(e.target.value)} className={styles.select}>
                <option value="">Choose a post</option>
                {userPosts.map(p => <option key={p.id} value={p.id}>{p.text.slice(0, 60)}...</option>)}
              </select>
            </div>
            <div className={styles.modalSection}>
              <label>Ad Type</label>
              <div className={styles.adTypeToggle}>
                <button onClick={() => setAdType('duration')} className={adType === 'duration' ? styles.activeType : ''}>
                  <Clock size={18} /> Duration
                </button>
                <button onClick={() => setAdType('impression')} className={adType === 'impression' ? styles.activeType : ''}>
                  <Eye size={18} /> Impressions
                </button>
              </div>
            </div>
            <div className={styles.modalSection}>
              <label>Package</label>
              <div className={styles.pricingGrid}>
                {(adType === 'duration' ? durationPricing : impressionPricing).map(p => (
                  <button key={p.label} onClick={() => createAd(p)} disabled={creating || !selectedPost} className={styles.pricingCard}>
                    <span>{p.label}</span>
                    <span>₦{p.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowCreateModal(false)} className={styles.closeModalBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DollarSignIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}