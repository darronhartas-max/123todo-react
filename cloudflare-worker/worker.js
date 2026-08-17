/**
 * 123ToDo Set & Forget E2E Encrypted Cloud Sync Worker
 * Cloudflare Worker + D1 Database
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

async function initDB(env) {
  try {
    await env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_sync (sync_id TEXT PRIMARY KEY, device_token TEXT NOT NULL, payload TEXT NOT NULL, updated_at INTEGER NOT NULL);`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS pair_codes (code TEXT PRIMARY KEY, sync_id TEXT NOT NULL, device_token TEXT NOT NULL, expires_at INTEGER NOT NULL);`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL);`)
    ]);
  } catch (err) {
    console.error('initDB error:', err);
  }
}

// Sliding window rate limiter (e.g. 100 requests per 10 minutes per syncId/IP)
async function checkRateLimit(env, key, limit = 100, windowMs = 10 * 60 * 1000) {
  if (!env.DB || !key) return { allowed: true };
  const now = Date.now();
  try {
    const row = await env.DB.prepare(
      'SELECT count, window_start FROM rate_limits WHERE key = ?'
    ).bind(key).first();

    if (!row || (now - row.window_start) > windowMs) {
      await env.DB.prepare(
        'INSERT OR REPLACE INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)'
      ).bind(key, now).run();
      return { allowed: true };
    }

    if (row.count >= limit) {
      const retryAfterSec = Math.ceil((row.window_start + windowMs - now) / 1000);
      return { allowed: false, retryAfter: Math.max(1, retryAfterSec) };
    }

    await env.DB.prepare(
      'UPDATE rate_limits SET count = count + 1 WHERE key = ?'
    ).bind(key).run();

    return { allowed: true };
  } catch (err) {
    console.error('Rate limit error:', err);
    return { allowed: true }; // Fail open if DB issue
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    await initDB(env);
    const url = new URL(request.url);
    const path = url.pathname;

    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';

    try {
      if (path === '/api/sync/init' && request.method === 'POST') {
        const rateCheck = await checkRateLimit(env, `init_${clientIp}`, 15, 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse({ error: 'Too many account initializations. Please wait.' }, 429, { 'Retry-After': String(rateCheck.retryAfter) });
        }

        const syncId = 'sync_' + generateId(20);
        const deviceToken = 'tok_' + generateId(32);
        const now = Date.now();

        await env.DB.prepare(
          'INSERT INTO user_sync (sync_id, device_token, payload, updated_at) VALUES (?, ?, ?, ?)'
        ).bind(syncId, deviceToken, '', now).run();

        return jsonResponse({ syncId, deviceToken });
      }

      if (path === '/api/sync/push' && request.method === 'POST') {
        const body = await request.json();
        const { syncId, deviceToken, payload, timestamp } = body;

        if (!syncId || !deviceToken || typeof payload !== 'string') {
          return jsonResponse({ error: 'Invalid parameters' }, 400);
        }

        const rateCheck = await checkRateLimit(env, `sync_${syncId}`, 120, 10 * 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse({ error: 'Rate limit exceeded. Sync requests throttled.' }, 429, { 'Retry-After': String(rateCheck.retryAfter) });
        }

        const existing = await env.DB.prepare(
          'SELECT device_token FROM user_sync WHERE sync_id = ?'
        ).bind(syncId).first();

        if (!existing || existing.device_token !== deviceToken) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const now = timestamp || Date.now();
        await env.DB.prepare(
          'UPDATE user_sync SET payload = ?, updated_at = ? WHERE sync_id = ?'
        ).bind(payload, now, syncId).run();

        return jsonResponse({ success: true, timestamp: now });
      }

      if (path === '/api/sync/pull' && request.method === 'POST') {
        const body = await request.json();
        const { syncId, deviceToken, sinceTimestamp } = body;

        if (!syncId || !deviceToken) {
          return jsonResponse({ error: 'Invalid parameters' }, 400);
        }

        const rateCheck = await checkRateLimit(env, `sync_${syncId}`, 150, 10 * 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse({ error: 'Rate limit exceeded. Sync requests throttled.' }, 429, { 'Retry-After': String(rateCheck.retryAfter) });
        }

        const row = await env.DB.prepare(
          'SELECT payload, updated_at, device_token FROM user_sync WHERE sync_id = ?'
        ).bind(syncId).first();

        if (!row || row.device_token !== deviceToken) {
          return jsonResponse({ error: 'Unauthorized or not found' }, 401);
        }

        // Conditional Pull: If remote data has not changed since client's timestamp, return notModified
        if (sinceTimestamp && Number(sinceTimestamp) >= Number(row.updated_at)) {
          return jsonResponse({ notModified: true, timestamp: row.updated_at });
        }

        return jsonResponse({ payload: row.payload, timestamp: row.updated_at });
      }

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

      if (path === '/api/sync/pair-connect' && request.method === 'POST') {
        const body = await request.json();
        const { pairCode } = body;

        if (!pairCode) {
          return jsonResponse({ error: 'Missing pair code' }, 400);
        }

        const rateCheck = await checkRateLimit(env, `pair_${clientIp}`, 20, 10 * 60 * 1000);
        if (!rateCheck.allowed) {
          return jsonResponse({ error: 'Too many pairing attempts. Please wait.' }, 429, { 'Retry-After': String(rateCheck.retryAfter) });
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
