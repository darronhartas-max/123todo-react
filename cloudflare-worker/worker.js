/**
 * 123ToDo Set & Forget E2E Encrypted Cloud Sync Worker
 * Cloudflare Worker + D1 Database
 *
 * Ultra-Optimized for Cloudflare D1 Free Tier (Zero-Cost, Minimal Reads & Writes)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders }
  });
}

function generateId(length = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------------------------------------------------------------
// 1. One-Time In-Memory DB Initialization (Saves 3 DDL queries per request)
// ---------------------------------------------------------------------------
let isDbInitialized = false;

async function ensureDB(env) {
  if (isDbInitialized || !env.DB) return;
  try {
    await env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_sync (sync_id TEXT PRIMARY KEY, device_token TEXT NOT NULL, payload TEXT NOT NULL, updated_at INTEGER NOT NULL);`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS pair_codes (code TEXT PRIMARY KEY, sync_id TEXT NOT NULL, device_token TEXT NOT NULL, expires_at INTEGER NOT NULL);`)
    ]);
    isDbInitialized = true;
  } catch (err) {
    console.error('ensureDB error:', err);
  }
}

// ---------------------------------------------------------------------------
// 2. High-Performance In-Memory Sliding Window Rate Limiter
//    (Eliminates 100,000+ daily D1 writes & reads to rate_limits table)
// ---------------------------------------------------------------------------
const rateLimitCache = new Map();
const MAX_RATE_LIMIT_ENTRIES = 5000;

function checkRateLimit(key, limit = 120, windowMs = 10 * 60 * 1000) {
  if (!key) return { allowed: true };
  const now = Date.now();
  const record = rateLimitCache.get(key);

  if (!record || (now - record.windowStart) > windowMs) {
    if (rateLimitCache.size > MAX_RATE_LIMIT_ENTRIES) {
      // Periodic lazy eviction of expired entries
      for (const [k, v] of rateLimitCache.entries()) {
        if (now - v.windowStart > windowMs) {
          rateLimitCache.delete(k);
        }
      }
    }
    rateLimitCache.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (record.count >= limit) {
    const retryAfterSec = Math.ceil((record.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfterSec) };
  }

  record.count += 1;
  return { allowed: true };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    await ensureDB(env);
    const url = new URL(request.url);
    const path = url.pathname;
    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';

    try {
      // Endpoint: Initialize new Sync Account
      if (path === '/api/sync/init' && request.method === 'POST') {
        const rateCheck = checkRateLimit(`init_${clientIp}`, 15, 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse(
            { error: 'Too many account initializations. Please wait.' },
            429,
            { 'Retry-After': String(rateCheck.retryAfter) }
          );
        }

        const syncId = 'sync_' + generateId(20);
        const deviceToken = 'tok_' + generateId(32);
        const now = Date.now();

        await env.DB.prepare(
          'INSERT INTO user_sync (sync_id, device_token, payload, updated_at) VALUES (?, ?, ?, ?)'
        ).bind(syncId, deviceToken, '', now).run();

        return jsonResponse({ syncId, deviceToken });
      }

      // Endpoint: Push Local State
      if (path === '/api/sync/push' && request.method === 'POST') {
        const body = await request.json();
        const { syncId, deviceToken, payload, timestamp } = body;

        if (!syncId || !deviceToken || typeof payload !== 'string') {
          return jsonResponse({ error: 'Invalid parameters' }, 400);
        }

        const rateCheck = checkRateLimit(`sync_${syncId}`, 150, 10 * 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse(
            { error: 'Rate limit exceeded. Sync requests throttled.' },
            429,
            { 'Retry-After': String(rateCheck.retryAfter) }
          );
        }

        const now = timestamp || Date.now();

        // Atomic update with deviceToken verification (1 single D1 write, 0 D1 reads)
        const updateResult = await env.DB.prepare(
          'UPDATE user_sync SET payload = ?, updated_at = ? WHERE sync_id = ? AND device_token = ?'
        ).bind(payload, now, syncId, deviceToken).run();

        if (!updateResult.meta || updateResult.meta.changes === 0) {
          return jsonResponse({ error: 'Unauthorized or account not found' }, 401);
        }

        return jsonResponse({ success: true, timestamp: now });
      }

      // Endpoint: Pull Remote State
      if (path === '/api/sync/pull' && request.method === 'POST') {
        const body = await request.json();
        const { syncId, deviceToken, sinceTimestamp } = body;

        if (!syncId || !deviceToken) {
          return jsonResponse({ error: 'Invalid parameters' }, 400);
        }

        const rateCheck = checkRateLimit(`sync_${syncId}`, 180, 10 * 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse(
            { error: 'Rate limit exceeded. Sync requests throttled.' },
            429,
            { 'Retry-After': String(rateCheck.retryAfter) }
          );
        }

        // Single indexed primary-key read (1 row read, 0 writes)
        const row = await env.DB.prepare(
          'SELECT payload, updated_at, device_token FROM user_sync WHERE sync_id = ?'
        ).bind(syncId).first();

        if (!row || row.device_token !== deviceToken) {
          return jsonResponse({ error: 'Unauthorized or not found' }, 401);
        }

        // Conditional Pull: If data unchanged since client's timestamp, return 304-style notModified
        if (sinceTimestamp && Number(sinceTimestamp) >= Number(row.updated_at)) {
          return jsonResponse({ notModified: true, timestamp: row.updated_at });
        }

        return jsonResponse({ payload: row.payload, timestamp: row.updated_at });
      }

      // Endpoint: Generate 6-Digit Pairing Code for Linking Device
      if (path === '/api/sync/pair-code' && request.method === 'POST') {
        const body = await request.json();
        const { syncId, deviceToken } = body;

        const row = await env.DB.prepare(
          'SELECT device_token FROM user_sync WHERE sync_id = ?'
        ).bind(syncId).first();

        if (!row || row.device_token !== deviceToken) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const code = generate6DigitCode();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        await env.DB.prepare(
          'INSERT OR REPLACE INTO pair_codes (code, sync_id, device_token, expires_at) VALUES (?, ?, ?, ?)'
        ).bind(code, syncId, deviceToken, expiresAt).run();

        return jsonResponse({ pairCode: code, expiresAt });
      }

      // Endpoint: Connect with 6-Digit Pairing Code
      if (path === '/api/sync/pair-connect' && request.method === 'POST') {
        const body = await request.json();
        const { pairCode } = body;

        if (!pairCode) {
          return jsonResponse({ error: 'Missing pair code' }, 400);
        }

        const rateCheck = checkRateLimit(`pair_${clientIp}`, 20, 10 * 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse(
            { error: 'Too many pairing attempts. Please wait.' },
            429,
            { 'Retry-After': String(rateCheck.retryAfter) }
          );
        }

        const row = await env.DB.prepare(
          'SELECT sync_id, device_token, expires_at FROM pair_codes WHERE code = ?'
        ).bind(pairCode.trim()).first();

        if (!row || Date.now() > row.expires_at) {
          return jsonResponse({ error: 'Invalid or expired pair code' }, 404);
        }

        return jsonResponse({ syncId: row.sync_id, deviceToken: row.device_token });
      }

      return jsonResponse({ status: '123ToDo Sync Worker operational 🚀' });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
};
