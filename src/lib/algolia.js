// lib/algolia.js
import { algoliasearch } from 'algoliasearch';

// ⚠️ IMPORTANT: Use Search-Only API Key for client-side
// Admin key should NEVER be in client code
const appId = 'ZRODUUTRLQ';
const searchKey = '1d7e73421b0e461eb3e2c4f4a424dda2'; // ✅ This is safe for client

// Create search-only client
const searchClient = algoliasearch(appId, searchKey);

// Multi-index search
export async function searchEverything(query) {
  try {
    const { results } = await searchClient.search({
      requests: [
        { indexName: 'circles', query, hitsPerPage: 5 },
        { indexName: 'posts', query, hitsPerPage: 10 },
        { indexName: 'users', query, hitsPerPage: 5 },
        { indexName: 'tags', query, hitsPerPage: 5 }
      ]
    });
    return { results };
  } catch (error) {
    console.error('Algolia search error:', error);
    throw error;
  }
}

// Single index searches
export async function searchPosts(query, limit = 10) {
  const { results } = await searchClient.search({
    requests: [{ indexName: 'posts', query, hitsPerPage: limit }]
  });
  return results[0].hits;
}

export async function searchUsers(query, limit = 10) {
  const { results } = await searchClient.search({
    requests: [{ indexName: 'users', query, hitsPerPage: limit }]
  });
  return results[0].hits;
}

export async function searchCircles(query, limit = 10) {
  const { results } = await searchClient.search({
    requests: [{ indexName: 'circles', query, hitsPerPage: limit }]
  });
  return results[0].hits;
}

export async function searchTags(query, limit = 10) {
  const { results } = await searchClient.search({
    requests: [{ indexName: 'tags', query, hitsPerPage: limit }]
  });
  return results[0].hits;
}

// ========== INDEXING FUNCTIONS ==========
// ⚠️ These require Admin API Key and should run SERVER-SIDE ONLY
// For now, we'll create a separate admin client

let adminClient = null;

function getAdminClient() {
  if (!adminClient) {
    // ⚠️ This should be in a server-side API route, not client code
    const adminKey = 'ccd3eb406f23136c05804bbfdc284d75';
    adminClient = algoliasearch(appId, adminKey);
  }
  return adminClient;
}

export async function indexPost(post) {
  try {
    const client = getAdminClient();
    const record = {
      objectID: post.id,
      authorName: post.author?.displayName || '',
      username: post.author?.username || '',
      text: post.text || '',
      tags: post.tags || [],
      circle: post.circle?.name || '',
      circleTag: post.circle?.tag || '',
      createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
      mediaCount: post.mediaUrls?.length || 0
    };
    await client.saveObject({ indexName: 'posts', body: record });
    console.log('✅ Post indexed:', post.id);
  } catch (error) {
    console.error('Failed to index post:', error);
  }
}

export async function indexCircle(circle) {
  try {
    const client = getAdminClient();
    const record = {
      objectID: circle.id,
      name: circle.name || '',
      tag: circle.tag || '',
      members: circle.members || 0,
      live: circle.live || false,
      createdBy: circle.createdBy || ''
    };
    await client.saveObject({ indexName: 'circles', body: record });
    console.log('✅ Circle indexed:', circle.id);
  } catch (error) {
    console.error('Failed to index circle:', error);
  }
}

export async function indexUser(user) {
  try {
    const client = getAdminClient();
    const record = {
      objectID: user.uid,
      displayName: user.displayName || '',
      username: user.username || '',
      bio: user.bio || '',
      followers: user.followers || 0,
      following: user.following || 0
    };
    await client.saveObject({ indexName: 'users', body: record });
    console.log('✅ User indexed:', user.uid);
  } catch (error) {
    console.error('Failed to index user:', error);
  }
}

export async function indexTag(tagName, count = 1) {
  try {
    const client = getAdminClient();
    const record = {
      objectID: tagName,
      name: tagName,
      count
    };
    await client.saveObject({ indexName: 'tags', body: record });
    console.log('✅ Tag indexed:', tagName);
  } catch (error) {
    console.error('Failed to index tag:', error);
  }
}