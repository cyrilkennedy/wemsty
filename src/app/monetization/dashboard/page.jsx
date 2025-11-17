// app/monetization/dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ArrowLeft, DollarSign, TrendingUp, Users, Eye, Calendar, CheckCircle, XCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState(null);
  const [userData, setUserData] = useState(null);
  const [earnings, setEarnings] = useState({
    likes: 0,
    comments: 0,
    total: 0,
    pending: 0,
    paid: 0,
  });
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    totalFollowers: 0,
  });
  const [eligibility, setEligibility] = useState({
    followers: false,
    views: false,
    likes: false,
    allMet: false,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);

  const REQUIREMENTS = {
    followers: 100,
    views: 5000,
    likes: 1000,
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/sphere');
      return;
    }
    fetchDashboardData();
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      // Get user data
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (!userSnap.exists()) {
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      setUserData(userData);
      setTier(userData.monetization?.tier || null);

      // Get follower count
      const followersSnap = await getDocs(
        collection(db, 'users', user.uid, 'followers')
      );
      const followerCount = followersSnap.size;

      // Get posts analytics
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const postsSnap = await getDocs(postsQuery);

      let totalLikes = 0;
      let totalComments = 0;
      let totalViews = 0;
      const posts = [];

      postsSnap.forEach((doc) => {
        const post = doc.data();
        const likesCount = post.reactions?.length || 0;
        const commentsCount = post.commentCount || 0;
        const views = post.views || 0;

        totalLikes += likesCount;
        totalComments += commentsCount;
        totalViews += views;

        posts.push({
          id: doc.id,
          text: post.text,
          likes: likesCount,
          comments: commentsCount,
          views: views,
          earnings: 0,
          createdAt: post.createdAt?.toDate(),
        });
      });

      // Calculate earnings only if monetized
      if (userData.monetization?.tier) {
        const likesEarnings = totalLikes * 5;
        const commentsEarnings = 
          (userData.monetization.tier === 'pro' || userData.monetization.tier === 'enterprise')
            ? totalComments * 0.75
            : 0;

        const totalEarnings = likesEarnings + commentsEarnings;

        setEarnings({
          likes: totalLikes,
          comments: totalComments,
          total: totalEarnings,
          pending: userData.earnings?.pending || totalEarnings,
          paid: userData.earnings?.paid || 0,
        });

        // Update post earnings
        posts.forEach(post => {
          const postLikesEarnings = post.likes * 5;
          const postCommentsEarnings = 
            (userData.monetization.tier === 'pro' || userData.monetization.tier === 'enterprise')
              ? post.comments * 0.75
              : 0;
          post.earnings = postLikesEarnings + postCommentsEarnings;
        });
      }

      setAnalytics({
        totalPosts: postsSnap.size,
        totalLikes,
        totalComments,
        totalViews,
        totalFollowers: followerCount,
      });

      // Check eligibility
      const eligible = {
        followers: followerCount >= REQUIREMENTS.followers,
        views: totalViews >= REQUIREMENTS.views,
        likes: totalLikes >= REQUIREMENTS.likes,
      };
      eligible.allMet = eligible.followers && eligible.views && eligible.likes;

      setEligibility(eligible);

      // Sort posts by earnings
      setRecentPosts(posts.sort((a, b) => b.earnings - a.earnings).slice(0, 5));

      // Fetch payout history from Firestore
      const payoutsQuery = query(
        collection(db, 'users', user.uid, 'payouts'),
        orderBy('createdAt', 'desc')
      );
      const payoutsSnap = await getDocs(payoutsQuery);
      const payouts = payoutsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate(),
      }));
      setPayoutHistory(payouts);

      setLoading(false);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    if (earnings.pending < 1000) {
      alert('Minimum payout is N1,000');
      return;
    }
    alert('Payout request submitted! Processing time: 3-5 business days');
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/sphere" className={styles.back}>
          <ArrowLeft size={24} />
        </Link>
        <h1>Dashboard</h1>
      </div>

      {/* Monetization Status */}
      {!tier ? (
        <div className={styles.eligibilitySection}>
          <h2>Monetization Eligibility</h2>
          <p className={styles.eligibilityText}>
            Complete these requirements to become eligible for monetization
          </p>

          <div className={styles.requirementsList}>
            <div className={`${styles.requirement} ${eligibility.followers ? styles.met : ''}`}>
              {eligibility.followers ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <div className={styles.requirementContent}>
                <h3>Followers</h3>
                <p>
                  {analytics.totalFollowers} / {REQUIREMENTS.followers}
                  {eligibility.followers && ' - Complete'}
                </p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${Math.min((analytics.totalFollowers / REQUIREMENTS.followers) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={`${styles.requirement} ${eligibility.views ? styles.met : ''}`}>
              {eligibility.views ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <div className={styles.requirementContent}>
                <h3>Total Views</h3>
                <p>
                  {analytics.totalViews.toLocaleString()} / {REQUIREMENTS.views.toLocaleString()}
                  {eligibility.views && ' - Complete'}
                </p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${Math.min((analytics.totalViews / REQUIREMENTS.views) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={`${styles.requirement} ${eligibility.likes ? styles.met : ''}`}>
              {eligibility.likes ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <div className={styles.requirementContent}>
                <h3>Total Likes</h3>
                <p>
                  {analytics.totalLikes.toLocaleString()} / {REQUIREMENTS.likes.toLocaleString()}
                  {eligibility.likes && ' - Complete'}
                </p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${Math.min((analytics.totalLikes / REQUIREMENTS.likes) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {eligibility.allMet ? (
            <div className={styles.eligibleBox}>
              <CheckCircle size={32} />
              <h3>You are eligible for monetization!</h3>
              <p>Subscribe to a plan to start earning from your content</p>
              <Link href="/monetization" className={styles.subscribeBtn}>
                View Subscription Plans
              </Link>
            </div>
          ) : (
            <div className={styles.ineligibleBox}>
              <Lock size={32} />
              <h3>Keep growing your account</h3>
              <p>Complete all requirements above to unlock monetization</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tier Badge */}
          <div className={styles.tierBadge} data-tier={tier}>
            <span className={styles.badge}>
              {tier === 'creator' && 'Creator'}
              {tier === 'pro' && 'Creator Pro'}
              {tier === 'enterprise' && 'Enterprise'}
            </span>
          </div>

          {/* Earnings Overview */}
          <div className={styles.section}>
            <h2>Earnings Overview</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DollarSign size={24} />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Total Earnings</p>
                  <p className={styles.statValue}>N{earnings.total.toFixed(2)}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={24} />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Pending Payout</p>
                  <p className={styles.statValue}>N{earnings.pending.toFixed(2)}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Calendar size={24} />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Paid Out</p>
                  <p className={styles.statValue}>N{earnings.paid.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className={styles.section}>
            <h2>Analytics</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticCard}>
                <Users size={20} />
                <span>{analytics.totalPosts}</span>
                <p>Total Posts</p>
              </div>
              <div className={styles.analyticCard}>
                <TrendingUp size={20} />
                <span>{analytics.totalLikes}</span>
                <p>Total Likes</p>
              </div>
              <div className={styles.analyticCard}>
                <Users size={20} />
                <span>{analytics.totalComments}</span>
                <p>Comments</p>
              </div>
              <div className={styles.analyticCard}>
                <Eye size={20} />
                <span>{analytics.totalViews}</span>
                <p>Total Views</p>
              </div>
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className={styles.section}>
            <h2>Top Earning Posts</h2>
            <div className={styles.postsTable}>
              {recentPosts.length === 0 ? (
                <p className={styles.emptyState}>No posts yet</p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className={styles.postRow}>
                    <div className={styles.postText}>
                      {post.text.slice(0, 60)}{post.text.length > 60 ? '...' : ''}
                    </div>
                    <div className={styles.postStats}>
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                      <span className={styles.postEarnings}>N{post.earnings.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payout Section */}
          <div className={styles.section}>
            <h2>Request Payout</h2>
            <div className={styles.payoutCard}>
              <div className={styles.payoutInfo}>
                <p>Minimum payout: <strong>N1,000</strong></p>
                <p>Next payout date: <strong>1st of every month</strong></p>
                <p>Available balance: <strong>N{earnings.pending.toFixed(2)}</strong></p>
              </div>
              <button 
                onClick={requestPayout}
                disabled={earnings.pending < 1000}
                className={styles.payoutBtn}
              >
                Request Payout
              </button>
            </div>
          </div>

          {/* Payout History */}
          {payoutHistory.length > 0 && (
            <div className={styles.section}>
              <h2>Payout History</h2>
              <div className={styles.historyTable}>
                {payoutHistory.map((payout) => (
                  <div key={payout.id} className={styles.historyRow}>
                    <div>
                      <p className={styles.historyDate}>
                        {payout.date?.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className={styles.historyStatus}>{payout.status}</p>
                    </div>
                    <p className={styles.historyAmount}>N{payout.amount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}