// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updatePassword
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyChxEcDvKxFvcifxJCzZdxknjC2lsc2wTo",
  authDomain: "wemsty-9a7f8.firebaseapp.com",
  projectId: "wemsty-9a7f8",
  storageBucket: "wemsty-9a7f8.firebasestorage.app",
  messagingSenderId: "62430694543",
  appId: "1:62430694543:web:c44a4e347fd9eaf4c634fa",
  measurementId: "G-RL6FQHWJMS"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// ── AUTH FUNCTIONS ──
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
};

export const signUpWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(result.user);
  return result.user;
};

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(result.user);
  return result.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const updateUserPassword = async (newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  await updatePassword(user, newPassword);
};

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch {
    return false;
  }
};

// ── USER PROFILE ──
export const ensureUserProfile = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || 'User',
      email: user.email,
      photoURL: user.photoURL || null,
      bio: 'Hey, I\'m using WEMSTY!',
      createdAt: new Date().toISOString(),
      postsCount: 0,
      followers: 0,
      following: 0
    });
  }
};