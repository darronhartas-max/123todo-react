/**
 * IndexedDB Storage for Note Photo Attachments
 * Keeps heavy base64 image data outside of localStorage (preventing 5MB quota errors).
 */

const DB_NAME = '123TodoPhotoDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

// In-memory LRU cache (capped at 25 photos to eliminate RAM ballooning & memory leaks)
const MAX_MEMORY_CACHE_ITEMS = 25;
const memoryCache = new Map();

function setMemoryCache(id, photo) {
  if (!id || !photo) return;
  if (memoryCache.has(id)) {
    memoryCache.delete(id); // refresh entry position for LRU
  } else if (memoryCache.size >= MAX_MEMORY_CACHE_ITEMS) {
    // Evict oldest (least-recently accessed) entry
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(id, photo);
}

function getMemoryCache(id) {
  if (!id || !memoryCache.has(id)) return null;
  const item = memoryCache.get(id);
  // Re-insert to mark as recently used
  memoryCache.delete(id);
  memoryCache.set(id, item);
  return item;
}

// Persistent database connection promise to eliminate connection churn
let dbPromise = null;

/**
 * Opens or reuses the IndexedDB database connection.
 */
const openDB = () => {
  if (dbPromise) return dbPromise;
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        db.onclose = () => { dbPromise = null; };
        db.onversionchange = () => { db.close(); dbPromise = null; };
        resolve(db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB open error, falling back to in-memory:', event.target.error);
        dbPromise = null;
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB access blocked, falling back to in-memory:', err);
      dbPromise = null;
      resolve(null);
    }
  });

  return dbPromise;
};

/**
 * Saves a photo object to IndexedDB.
 */
export const savePhoto = async (photo) => {
  if (!photo || !photo.id) return photo;

  setMemoryCache(photo.id, photo);

  const db = await openDB();
  if (!db) return photo;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo);

      req.onsuccess = () => resolve(photo);
      req.onerror = () => {
        console.warn('Error saving photo to IndexedDB, stored in memory cache');
        resolve(photo);
      };
    } catch (e) {
      console.warn('Transaction error in savePhoto:', e);
      resolve(photo);
    }
  });
};

/**
 * Saves multiple photo objects to IndexedDB.
 */
export const savePhotos = async (photos) => {
  if (!Array.isArray(photos) || photos.length === 0) return;
  await Promise.all(photos.map(p => savePhoto(p)));
};

/**
 * Retrieves a photo object by ID.
 */
export const getPhoto = async (id) => {
  if (!id) return null;

  const cached = getMemoryCache(id);
  if (cached) {
    return cached;
  }

  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const result = req.result || null;
        if (result) setMemoryCache(id, result);
        resolve(result);
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

/**
 * Retrieves multiple photos by their IDs.
 */
export const getPhotos = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const results = await Promise.all(ids.map(id => getPhoto(id)));
  return results.filter(Boolean);
};

/**
 * Deletes a photo from IndexedDB by ID.
 */
export const deletePhoto = async (id) => {
  if (!id) return;

  memoryCache.delete(id);

  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
};

/**
 * Deletes multiple photos by ID.
 */
export const deletePhotos = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return;
  await Promise.all(ids.map(id => deletePhoto(id)));
};
