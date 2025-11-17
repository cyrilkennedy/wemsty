// src/lib/otp.js
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const OTP_EXPIRY = 5 * 60 * 1000; // 5 mins

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = async (email, otp, type = 'verify') => {
  const ref = doc(db, 'otps', email);
  await setDoc(ref, {
    otp,
    type,
    expiresAt: Date.now() + OTP_EXPIRY,
    createdAt: serverTimestamp(),
  });
};

export const verifyOTP = async (email, otp) => {
  const ref = doc(db, 'otps', email);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;

  const data = snap.data();
  if (data.otp !== otp) return false;
  if (Date.now() > data.expiresAt) return false;

  await deleteDoc(ref);
  return true;
};