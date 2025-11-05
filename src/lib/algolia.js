// lib/algolia.js
import { algoliasearch } from 'algoliasearch';

// Your keys (HARD-CODED for now - MOVE TO .env later)
const appId = 'ZRODUUTRLQ';
const searchKey = '1d7e73421b0e461eb3e2c4f4a424dda2';
const adminKey = 'ccd3eb406f23136c05804bbfdc284d75';  // ← For client-side indexing (TEMP)

const client = algoliasearch(appId, adminKey);

// Helper function to perform operations on indexes
export const circlesIndex = {
  saveObject: (obj) => client.saveObject({ indexName: 'circles', body: obj }),
  search: (query) => client.search({ requests: [{ indexName: 'circles', query }] })
};

export const postsIndex = {
  saveObject: (obj) => client.saveObject({ indexName: 'posts', body: obj }),
  search: (query) => client.search({ requests: [{ indexName: 'posts', query }] })
};

export const usersIndex = {
  saveObject: (obj) => client.saveObject({ indexName: 'users', body: obj }),
  search: (query) => client.search({ requests: [{ indexName: 'users', query }] })
};

export const tagsIndex = {
  saveObject: (obj) => client.saveObject({ indexName: 'tags', body: obj }),
  search: (query) => client.search({ requests: [{ indexName: 'tags', query }] })
};

// Multi-index search
export async function searchEverything(query) {
  const results = await client.search({
    requests: [
      { indexName: 'circles', query },
      { indexName: 'posts', query },
      { indexName: 'users', query },
      { indexName: 'tags', query }
    ]
  });
  return results;
}

// Client-side indexing (NO BACKEND)
export async function indexPost(post) {
  const record = {
    objectID: post.id,
    authorName: post.author.displayName,
    username: post.author.username,
    text: post.text,
    tags: post.tags || [],
    circle: post.circle?.name || '',
    circleTag: post.circle?.tag || '',
    createdAt: post.createdAt?.toISOString() || Date.now(),
    mediaCount: post.mediaUrls?.length || 0
  };
  await client.saveObject({ indexName: 'posts', body: record });
}

export async function indexCircle(circle) {
  const record = {
    objectID: circle.id,
    name: circle.name,
    tag: circle.tag,
    members: circle.members,
    live: circle.live,
    createdBy: circle.createdBy
  };
  await client.saveObject({ indexName: 'circles', body: record });
}

export async function indexUser(user) {
  const record = {
    objectID: user.uid,
    displayName: user.displayName,
    username: user.username,
    bio: user.bio,
    followers: user.followers || 0,
    following: user.following || 0
  };
  await client.saveObject({ indexName: 'users', body: record });
}

export async function indexTag(tagName, count = 1) {
  const record = {
    objectID: tagName,
    name: tagName,
    count
  };
  await client.saveObject({ indexName: 'tags', body: record });
}