'use client';
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { X, Image as ImageIcon, Send, Globe } from 'lucide-react';
import { AdPostCard } from '@/components/AdPostCard';
import styles from './page.module.css';

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

export default function CreateAdPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // Form
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  // Package
  const [adType, setAdType] = useState('duration');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paying, setPaying] = useState(false);

  // ---------- Image ----------
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setMediaFile(null);
    setPreviewUrl(null);
  };

  // ---------- Pay & Verify ----------
const payAndVerify = () => {
  if (!selectedPackage) return alert('Select a package');
  setPaying(true);

  const ref = `ad_${Date.now()}_${user.uid}`;

  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
    email: user.email,
    amount: selectedPackage.price * 100,
    currency: 'NGN',
    ref,
    metadata: {
      adType,
      createNew: true,
      text,
      ...(previewUrl ? { mediaUrl: 'temp' } : {}),
      ...(adType === 'duration'
        ? { duration: selectedPackage.duration }
        : { impressions: selectedPackage.impressions }),
      uid: user.uid,
    },
    // NON-ASYNC CALLBACK (Paystack requirement)
    callback: (response) => {
      // Now we can use async inside
      verifyPayment(response.reference);
    },
    onClose: () => setPaying(false),
  });

  handler.openIframe();
};

// Separate async verify function
const verifyPayment = async (reference) => {
  try {
    const res = await fetch('/api/paystack/verify', {
      method: 'POST',
      body: JSON.stringify({
        reference,
        expectedAmount: selectedPackage.price,
      }),
    });
    const data = await res.json();

    if (data.success) {
      setPaymentVerified(true);
      alert('Payment successful! You can now post.');
    } else {
      alert('Payment failed or was not verified.');
    }
  } catch (err) {
    alert('Verification error: ' + err.message);
  } finally {
    setPaying(false);
  }
};

  // ---------- Final Post ----------
  const finalPost = async () => {
    if (!paymentVerified || !selectedPackage) return;
    setPosting(true);
    try {
      let mediaUrl = null;
      if (mediaFile) {
        setUploading(true);
        mediaUrl = await uploadToCloudinary(mediaFile);
        setUploading(false);
      }

      const postRef = await addDoc(collection(db, 'posts'), {
        text: text.trim(),
        mediaUrls: mediaUrl ? [mediaUrl] : [],
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        isPromoted: true,
        promotedAt: serverTimestamp(),
        monetizationEligible: false,
        reactions: { heart: 0 },
        repostCount: 0,
        commentCount: 0,
      });

      const adData = {
        postId: postRef.id,
        authorUid: user.uid,
        type: adType,
        status: 'active',
        impressions: 0,
        spent: selectedPackage.price,
        reference: `verified_${Date.now()}`,
        createdAt: serverTimestamp(),
        isNewAdPost: true,
      };
      if (adType === 'duration') {
        adData.duration = selectedPackage.duration;
        adData.expiresAt = new Date(Date.now() + selectedPackage.duration * 3600000);
      } else {
        adData.targetImpressions = selectedPackage.impressions;
      }
      await addDoc(collection(db, 'ads'), adData);

      alert('Ad posted successfully!');
      router.push('/monetization/ads');
    } catch (err) {
      alert('Post failed: ' + err.message);
      setPosting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        {/* Header */}
        <div className={styles.header}>
          <img src={user.photoURL || '/default-avatar.png'} alt="" className={styles.avatar} />
          <div>
            <h3 className={styles.name}>{user.displayName}</h3>
            <p className={styles.handle}>@{user.username || 'user'}</p>
          </div>
        </div>

        {/* Text */}
        <textarea
          placeholder="What's your promotion about?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.textarea}
          maxLength={500}
        />
        <div className={styles.charCount}>{text.length}/500</div>

        {/* Image */}
        {previewUrl && (
          <div className={styles.previewImgBox}>
            <img src={previewUrl} alt="" className={styles.previewImg} />
            <button type="button" onClick={removeImage} className={styles.removeBtn}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Global Only */}
        <div className={styles.privacy}>
          <button type="button" className={styles.active}>
            <Globe size={16} /> Global
          </button>

        </div>

<AdPostCard
  post={{
    text: text || 'Wemsty to the moon',
    mediaUrls: previewUrl ? [previewUrl] : [],
    createdAt: new Date(), // ← real time
    isPromoted: true,
    reactions: { heart: 1 },
    commentCount: 0,
  }}
  author={{
    displayName: user.displayName,
    username: user.username,
    photoURL: user.photoURL,
    monetization: user.monetization, // ← real badge data
  }}
/>

        {/* PACKAGE SELECTION (below preview) */}
        <div className={styles.packageSection}>
          <div className={styles.typeToggle}>
            <button
              onClick={() => setAdType('duration')}
              className={adType === 'duration' ? styles.activeType : ''}
            >
              Duration
            </button>
            <button
              onClick={() => setAdType('impression')}
              className={adType === 'impression' ? styles.activeType : ''}
            >
              Impressions
            </button>
          </div>

          <div className={styles.pricingGrid}>
            {(adType === 'duration' ? durationPricing : impressionPricing).map((pkg) => (
              <button
                key={pkg.label}
                onClick={() => setSelectedPackage(pkg)}
                className={
                  selectedPackage?.label === pkg.label ? styles.selectedPkg : styles.pricingCard
                }
              >
                <span>{pkg.label}</span>
                <span>₦{pkg.price.toLocaleString()}</span>
              </button>
            ))}
          </div>

          {/* Pay Button */}
          {selectedPackage && !paymentVerified && (
            <button onClick={payAndVerify} disabled={paying} className={styles.payBtn}>
              {paying ? 'Processing...' : `Pay ₦${selectedPackage.price.toLocaleString()}`}
            </button>
          )}

          {/* Final Post Button */}
          {paymentVerified && (
            <button
              onClick={finalPost}
              disabled={posting || uploading}
              className={styles.postBtn}
            >
              {posting || uploading ? 'Posting...' : (
                <>
                  <Send size={20} /> Post Ad
                </>
              )}
            </button>
          )}
        </div>

        {/* Image Upload */}
        <div className={styles.actions}>
          <label className={styles.imageBtn}>
            <ImageIcon size={22} /> Add Image
            <input type="file" accept="image/*" onChange={handleImage} hidden />
          </label>
        </div>
      </form>
    </div>
  );
}