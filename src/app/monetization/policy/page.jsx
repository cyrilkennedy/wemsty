// app/monetization/policy/page.jsx
'use client';
import Link from 'next/link';
import { ArrowLeft, Shield, DollarSign, TrendingUp, Megaphone } from 'lucide-react';
import styles from './page.module.css';

export default function MonetizationPolicyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/sphere" className={styles.back}>
          <ArrowLeft size={24} />
        </Link>
        <h1>Monetization Policy</h1>
      </div>

      <div className={styles.content}>
        {/* Introduction */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>Overview</h2>
          </div>
          <p>
            Wemsty's monetization system allows creators to earn revenue from their content through our subscription-based model. 
            This policy outlines the terms, earning structure, and requirements for all monetization tiers.
          </p>
        </section>

        {/* Subscription Tiers */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <DollarSign size={24} />
            <h2>Subscription Tiers</h2>
          </div>

          <div className={styles.tier}>
            <div className={styles.tierHeader}>
              <span className={styles.badge} data-tier="creator">🔵 CREATOR</span>
              <span className={styles.price}>₦2,500/month | ₦27,000/year</span>
            </div>
            <div className={styles.tierContent}>
              <h3>Monetization:</h3>
              <ul>
                <li>Earn ₦5 per like on your posts</li>
                <li>No earnings from comments</li>
              </ul>
              <h3>Analytics:</h3>
              <ul>
                <li>Total Likes</li>
                <li>Total Earnings</li>
                <li>Basic activity overview</li>
              </ul>
              <h3>Privileges:</h3>
              <ul>
                <li>Blue verification badge</li>
                <li>Can monetize posts</li>
                <li>Access to trending feeds</li>
              </ul>
            </div>
          </div>

          <div className={styles.tier}>
            <div className={styles.tierHeader}>
              <span className={styles.badge} data-tier="pro">⚪ CREATOR PRO</span>
              <span className={styles.price}>₦5,000/month | ₦54,000/year</span>
            </div>
            <div className={styles.tierContent}>
              <h3>Monetization:</h3>
              <ul>
                <li>Earn ₦5 per like on your posts</li>
                <li>Earn ₦0.75 per comment (bonus payout)</li>
              </ul>
              <h3>Analytics:</h3>
              <ul>
                <li>Likes and Comments breakdown</li>
                <li>Extended performance insights</li>
                <li>Earnings tracking</li>
              </ul>
              <h3>Privileges:</h3>
              <ul>
                <li>White verification badge</li>
                <li>Full monetization features</li>
                <li>Higher earning potential</li>
              </ul>
            </div>
          </div>

          <div className={styles.tier}>
            <div className={styles.tierHeader}>
              <span className={styles.badge} data-tier="enterprise">🟡 ENTERPRISE</span>
              <span className={styles.price}>₦7,000/month | ₦75,600/year</span>
            </div>
            <div className={styles.tierContent}>
              <h3>Monetization:</h3>
              <ul>
                <li>Earn ₦5 per like on your posts</li>
                <li>Earn ₦0.75 per comment</li>
              </ul>
              <h3>Analytics:</h3>
              <ul>
                <li>Full analytics dashboard</li>
                <li>Impressions and geography data</li>
                <li>Performance charts</li>
                <li>Post-by-post breakdown</li>
              </ul>
              <h3>Privileges:</h3>
              <ul>
                <li>Yellow verification badge</li>
                <li>Run In-House Ads (promoted posts)</li>
                <li>Access to Ads Manager</li>
                <li>Business features</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Earning System */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={24} />
            <h2>Earning Structure</h2>
          </div>
          
          <div className={styles.infoBox}>
            <h3>Per Like Earnings</h3>
            <p><strong>₦5 for all tiers</strong></p>
            <p>Every like on your post generates ₦5 in earnings.</p>
          </div>

          <div className={styles.infoBox}>
            <h3>Per Comment Earnings</h3>
            <ul>
              <li><strong>Creator:</strong> ₦0 (no comment earnings)</li>
              <li><strong>Creator Pro:</strong> ₦0.75 per comment</li>
              <li><strong>Enterprise:</strong> ₦0.75 per comment</li>
            </ul>
            <p className={styles.note}>
              💡 <strong>Why comments pay:</strong> More comments = more ad placements in comment sections = more platform revenue to share with creators.
            </p>
          </div>
        </section>

        {/* Payout System */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <DollarSign size={24} />
            <h2>Payout System</h2>
          </div>

          <div className={styles.infoBox}>
            <h3>Payout Schedule</h3>
            <ul>
              <li><strong>Frequency:</strong> End of month only</li>
              <li><strong>Minimum payout:</strong> ₦1,000</li>
              <li><strong>Processing time:</strong> 3-5 business days</li>
            </ul>
          </div>

          <div className={styles.infoBox}>
            <h3>Payment Options</h3>
            <ul>
              <li>Monthly payouts (default)</li>
              <li>Yearly payouts (accumulate earnings)</li>
            </ul>
            <p className={styles.note}>
              ⚠️ Funds are paid from Wemsty's Paystack settlement account. Admin triggers manual or automated payouts.
            </p>
          </div>
        </section>

        {/* In-House Ads */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Megaphone size={24} />
            <h2>In-House Ads (Enterprise Only)</h2>
          </div>

          <p>Enterprise users can create promoted posts to reach a wider audience.</p>

          <div className={styles.pricingTable}>
            <div className={styles.pricingColumn}>
              <h3>Duration-Based</h3>
              <table>
                <tbody>
                  <tr><td>1 hour</td><td>₦200</td></tr>
                  <tr><td>6 hours</td><td>₦1,000</td></tr>
                  <tr><td>12 hours</td><td>₦1,800</td></tr>
                  <tr><td>24 hours</td><td>₦4,500</td></tr>
                  <tr><td>48 hours</td><td>₦8,500</td></tr>
                  <tr><td>72 hours</td><td>₦12,000</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.pricingColumn}>
              <h3>Impression-Based</h3>
              <table>
                <tbody>
                  <tr><td>1,000 views</td><td>₦3,000</td></tr>
                  <tr><td>5,000 views</td><td>₦7,000</td></tr>
                  <tr><td>10,000 views</td><td>₦15,000</td></tr>
                  <tr><td>20,000 views</td><td>₦28,000</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Terms */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>Terms & Conditions</h2>
          </div>

          <div className={styles.terms}>
            <h3>Subscription Terms</h3>
            <ul>
              <li>All subscriptions are non-refundable</li>
              <li>You may unsubscribe at any time, but fees are not prorated</li>
              <li>Subscription remains active until the end of the billing period</li>
              <li>Automatic renewal unless cancelled</li>
            </ul>

            <h3>Content Requirements</h3>
            <ul>
              <li>Content must comply with Wemsty's Community Guidelines</li>
              <li>Spam, bot activity, or fraudulent engagement will result in suspension</li>
              <li>Earnings from violating content may be forfeited</li>
            </ul>

            <h3>Account Suspension</h3>
            <ul>
              <li>Wemsty reserves the right to suspend monetization for policy violations</li>
              <li>Pending earnings may be withheld if account is suspended</li>
              <li>Appeals can be submitted within 30 days</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className={styles.cta}>
          <h2>Ready to Start Earning?</h2>
          <p>Choose a plan that fits your goals and start monetizing your content today.</p>
          <Link href="/monetization" className={styles.ctaBtn}>
            View Subscription Plans
          </Link>
        </div>
      </div>
    </div>
  );
}