// src/lib/circleAdmin.js
import { db } from '@/lib/firebase';
import { doc, addDoc, collection, updateDoc, deleteDoc, arrayRemove, serverTimestamp } from 'firebase/firestore';

export const requestCircleDelete = async (circleId, userId) => {
  await addDoc(collection(db, 'circleDeleteRequests'), {
    circleId,
    requestedBy: userId,
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

export const approveCircleDelete = async (requestId, circleId) => {
  await deleteDoc(doc(db, 'circles', circleId));
  await deleteDoc(doc(db, 'circleDeleteRequests', requestId));
};

export const rejectCircleDelete = async (requestId) => {
  await updateDoc(doc(db, 'circleDeleteRequests', requestId), {
    status: 'rejected'
  });
};

export const removeCircleMember = async (circleId, userId) => {
  await updateDoc(doc(db, 'circles', circleId), {
    members: arrayRemove(userId)
  });
};

export const removeCircleAdmin = async (circleId, userId) => {
  await updateDoc(doc(db, 'circles', circleId), {
    admins: arrayRemove(userId)
  });
};