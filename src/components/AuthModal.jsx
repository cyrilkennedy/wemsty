// src/components/AuthModal.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  updateUserPassword,
  checkEmailExists
} from '@/lib/firebase';
import { generateOTP, saveOTP, verifyOTP } from '@/lib/otp';
import { sendEmail } from '@/lib/email';
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import styles from './AuthModal.module.css';

export function AuthModal({ isOpen, onClose }) {
  const router = useRouter();
  const [step, setStep] = useState('initial');
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState({});
  const [resendTimer, setResendTimer] = useState(0);

  const togglePass = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const sendOTP = async (type = 'verify') => {
    const code = generateOTP();
    await saveOTP(email, code, type);
    await sendEmail(
      email,
      `WEMSTY ${type === 'reset' ? 'Password Reset' : 'Verification'} Code`,
      `
      <div style="font-family: system-ui; text-align: center; padding: 2rem; background: #000; color: #fff; border-radius: 16px;">
        <h1 style="font-size: 2.5rem; color: #1da1f2; margin: 0;">${code}</h1>
        <p style="margin: 1rem 0 0; color: #e2e8f0;">Your ${type === 'reset' ? 'reset' : 'verification'} code</p>
        <p style="font-size: 0.8rem; color: #71767b; margin: 0.5rem 0 0;">Expires in 5 minutes</p>
      </div>
      `
    );
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) return setError('Enter email');
    if (mode !== 'reset' && (!password || password.length < 6)) return setError('Password too short');
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords don\'t match');

    if (mode === 'reset') {
      const exists = await checkEmailExists(email);
      if (!exists) return setError('No account with this email');
    }

    setLoading(true);
    try {
      if (mode === 'signup') await signUpWithEmail(email, password);
      else if (mode === 'signin') await signInWithEmail(email, password);
      await sendOTP(mode === 'reset' ? 'reset' : 'verify');
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async () => {
    if (otp.length !== 6) return setError('Enter 6-digit code');
    setLoading(true);
    setError('');
    
    try {
      const valid = await verifyOTP(email, otp);
      if (!valid) {
        setError('Invalid or expired code');
        setLoading(false);
        return;
      }
      
      if (mode === 'reset') {
        setStep('newPassword');
      } else {
        // Close modal first, then redirect
        onClose();
        // Small delay to ensure modal closes before navigation
        setTimeout(() => {
          router.push('/sphere');
          router.refresh(); // Force refresh to update user state
        }, 100);
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) return setError('Passwords don\'t match');
    if (newPassword.length < 6) return setError('Password too short');
    setLoading(true);
    try {
      await updateUserPassword(newPassword);
      alert('Password updated!');
      onClose();
      router.push('/sphere');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setStep('initial');
    setMode('signin');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setError('');
    setShowPass({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={handleClose} className={styles.closeBtn}><X size={24} /></button>

        {step === 'initial' && (
          <>
            <h2>{mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Join WEMSTY' : 'Reset Password'}</h2>
            <div className={styles.authButtons}>
              {mode !== 'reset' && (
                <button onClick={async () => {
                  setLoading(true);
                  try { 
                    await signInWithGoogle(); 
                    onClose();
                    router.push('/sphere');
                    router.refresh();
                  }
                  catch { setError('Google failed'); }
                  finally { setLoading(false); }
                }} className={styles.googleBtn}>
                  Continue with Google
                </button>
              )}
              <div className={styles.divider}><span>or</span></div>
              <button onClick={() => setStep('email')} className={styles.emailBtn}>
                {mode === 'reset' ? 'Continue with Email' : mode === 'signin' ? 'Sign In with Email' : 'Sign Up with Email'}
              </button>
              {mode !== 'reset' && (
                <p className={styles.switch}>
                  {mode === 'signin' ? "No account? " : 'Have account? '}
                  <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className={styles.switchLink}>
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                  {' | '}
                  <button onClick={() => { setMode('reset'); setStep('email'); }} className={styles.switchLink}>
                    Forgot password?
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {step === 'email' && (
          <>
            <button onClick={() => setStep('initial')} className={styles.backBtn}><ArrowLeft /> Back</button>
            <h2>{mode === 'reset' ? 'Reset Password' : mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
            <form onSubmit={handleEmailSubmit}>
              <div className={styles.inputGroup}>
                <Mail size={20} className={styles.icon} />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} required />
              </div>
              {mode !== 'reset' && (
                <>
                  <div className={styles.inputGroup}>
                    <Lock size={20} className={styles.icon} />
                    <input
                      type={showPass.password ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={styles.input}
                      minLength={6}
                      required
                    />
                    <button type="button" onClick={() => togglePass('password')} className={styles.eyeBtn}>
                      {showPass.password ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <div className={styles.inputGroup}>
                      <Lock size={20} className={styles.icon} />
                      <input
                        type={showPass.confirm ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        required
                      />
                      <button type="button" onClick={() => togglePass('confirm')} className={styles.eyeBtn}>
                        {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  )}
                </>
              )}
              <button type="submit" disabled={loading} className={styles.emailBtn}>
                {loading ? 'Please wait...' : mode === 'reset' ? 'Send Code' : 'Continue'}
              </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
          </>
        )}

        {step === 'otp' && (
          <>
            <button onClick={() => setStep('email')} className={styles.backBtn}><ArrowLeft /> Back</button>
            <h2>Enter Code</h2>
            <p>Sent to <strong>{email}</strong></p>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={styles.otpInput}
              maxLength={6}
            />
            <button onClick={handleOTP} disabled={loading || otp.length < 6} className={styles.emailBtn}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <p className={styles.resend}>
              Didn't get it?{' '}
              <button
                onClick={async () => {
                  if (resendTimer > 0) return;
                  await sendOTP(mode === 'reset' ? 'reset' : 'verify');
                }}
                disabled={resendTimer > 0}
                className={styles.resendLink}
              >
                Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
              </button>
            </p>
            {error && <p className={styles.error}>{error}</p>}
          </>
        )}

        {step === 'newPassword' && (
          <>
            <button onClick={() => setStep('otp')} className={styles.backBtn}><ArrowLeft /> Back</button>
            <h2>Set New Password</h2>
            <form onSubmit={handleResetPassword}>
              <div className={styles.inputGroup}>
                <Lock size={20} className={styles.icon} />
                <input
                  type={showPass.new ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={styles.input}
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => togglePass('new')} className={styles.eyeBtn}>
                  {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className={styles.inputGroup}>
                <Lock size={20} className={styles.icon} />
                <input
                  type={showPass.confirmNew ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className={styles.input}
                  required
                />
                <button type="button" onClick={() => togglePass('confirmNew')} className={styles.eyeBtn}>
                  {showPass.confirmNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" disabled={loading} className={styles.emailBtn}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}