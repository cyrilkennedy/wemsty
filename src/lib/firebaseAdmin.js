// src/lib/firebaseAdmin.js
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import path from 'path';

let serviceAccount;

try {
  // Option 1: Use environment variable (recommended for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Firebase: Loaded from environment variable');
  } 
  // Option 2: Fall back to file path for local development
  else {
    const serviceAccountPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'wemsty-9a7f8-firebase-adminsdk-fbsvc-6cabdd0799.json'
    );
    
    const fileContent = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
    console.log('✅ Firebase: Loaded from file');
  }

  // Validate required fields
  if (!serviceAccount.private_key?.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Invalid or missing private_key in service account');
  }

  if (!serviceAccount.project_id || !serviceAccount.client_email) {
    throw new Error('Missing required fields in service account');
  }

  console.log(`📁 Project ID: ${serviceAccount.project_id}`);
} catch (error) {
  console.error('❌ Firebase Admin SDK Error:', error.message);
  throw new Error('Failed to load Firebase service account credentials');
}

// Initialize Firebase Admin (singleton pattern)
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();