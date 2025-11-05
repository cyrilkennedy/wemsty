// lib/auth.js
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};