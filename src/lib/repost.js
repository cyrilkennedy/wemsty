// src/lib/repost.js
import { db, auth } from "@/lib/firebase";
import {
  doc,
  runTransaction,
  serverTimestamp,
  getDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

export async function toggleRepost(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to repost");

  const repostRef = doc(db, "users", user.uid, "reposts", postId);
  const postRef = doc(db, "posts", postId);

  try {
    let isReposted = false;

    await runTransaction(db, async (transaction) => {
      const repostSnap = await transaction.get(repostRef);
      const postSnap = await transaction.get(postRef);

      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }

      const wasReposted = repostSnap.exists();
      isReposted = !wasReposted;

      const currentReposts = postSnap.data()?.reactions?.reposts || 0;

      if (wasReposted) {
        transaction.delete(repostRef);
        transaction.update(postRef, {
          "reactions.reposts": Math.max(0, currentReposts - 1),
        });
      } else {
        // SAFEST way: build repostedBy object without any undefined values
        const repostedBy = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split("@")[0] || "User",
          photoURL: user.photoURL || null,
        };

        // Only add username if it's actually defined and not empty
        if (user.username && user.username.trim() !== "") {
          repostedBy.username = user.username.trim();
        } else if (user.email) {
          repostedBy.username = user.email.split("@")[0];
        } else {
          repostedBy.username = "user";
        }

        transaction.set(repostRef, {
          postId,
          originalAuthorUid: postSnap.data().authorUid,
          repostedAt: serverTimestamp(),
          repostedBy,
        });

        transaction.update(postRef, {
          "reactions.reposts": currentReposts + 1,
        });
      }
    });

    return isReposted;
  } catch (error) {
    console.error("Toggle repost error:", error);
    throw error;
  }
}

export async function isReposted(postId) {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, "users", user.uid, "reposts", postId));
  return snap.exists();
}

export async function getUserReposts(userId) {
  try {
    const repostsQuery = query(
      collection(db, "users", userId, "reposts"),
      orderBy("repostedAt", "desc")
    );

    const repostsSnap = await getDocs(repostsQuery);

    const repostPromises = repostsSnap.docs.map(async (repostDoc) => {
      const repostData = repostDoc.data();
      const postSnap = await getDoc(doc(db, "posts", repostDoc.id));

      if (postSnap.exists()) {
        return {
          id: postSnap.id,
          ...postSnap.data(),
          isRepost: true,
          repostedBy: repostData.repostedBy,
          repostedAt: repostData.repostedAt?.toDate() || null,
        };
      }
      return null;
    });

    const reposts = (await Promise.all(repostPromises)).filter(Boolean);
    return reposts;
  } catch (error) {
    console.error("Get reposts error:", error);
    return [];
  }
}
