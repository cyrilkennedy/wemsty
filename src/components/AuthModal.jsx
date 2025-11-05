// src/components/AuthModal.jsx
'use client';
import { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase';
import { X, Mail, Lock } from 'lucide-react';
import styles from './AuthModal.module.css';

export function AuthModal({ isOpen, onClose }) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }
      
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
      // Reset form
      handleClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onClose();
      handleClose();
    } catch (err) {
      setError(
        err.code === 'auth/popup-closed-by-user' 
          ? 'Sign-in cancelled. Please try again.' 
          : 'Google sign-in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowEmailForm(false);
    setError('');
    setEmail('');
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={handleClose} className={styles.closeBtn}>
          <X size={24} />
        </button>

        <h2>{mode === 'signin' ? 'Welcome Back' : 'Join WEMSTY'}</h2>
        <p className={styles.subtitle}>
          {mode === 'signin' ? 'Sign in to continue' : 'Where logic meets creativity'}
        </p>

        {error && <p className={styles.error}>{error}</p>}

        {!showEmailForm ? (
          // Initial view - authentication options
          <div className={styles.authButtons}>
            <button onClick={handleGoogle} disabled={loading} className={styles.googleBtn}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button 
              onClick={() => setShowEmailForm(true)} 
              className={styles.emailBtn}
              disabled={loading}
            >
              {mode === 'signin' ? 'Sign In with Email' : 'Sign Up with Email'}
            </button>

            <p className={styles.switch}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                className={styles.switchLink}
                disabled={loading}
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        ) : (
          // Email form view
          <>
            <form onSubmit={handleEmailAuth} className={styles.form}>
              <div className={styles.inputGroup}>
                <Mail size={20} className={styles.icon} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <Lock size={20} className={styles.icon} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} className={styles.emailBtn}>
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <button 
              onClick={() => setShowEmailForm(false)} 
              className={styles.backBtn}
              disabled={loading}
            >
              ← Back to options
            </button>
          </>
        )}
      </div>
    </div>
  );
}