/**
 * Lightweight, zero-dependency client-side ZIP archive generator.
 * Implements standard PKZip format with STORE (uncompressed) method,
 * optimal for WebP, JPEG, and PNG images that are already compressed.
 */

// Standard IEEE 802.3 CRC32 lookup table
const makeCrcTable = () => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
};

const crcTable = makeCrcTable();

/**
 * Calculates CRC32 checksum for a byte array.
 * @param {Uint8Array} bytes 
 * @returns {number}
 */
export const calculateCrc32 = (bytes) => {
  if (!bytes || (!ArrayBuffer.isView(bytes) && !(bytes instanceof Uint8Array))) return 0;
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
};

/**
 * Converts a JS Date into MS-DOS format date and time.
 * @param {Date|number} [inputDate]
 * @returns {{ time: number, date: number }}
 */
export const dateToDosDateTime = (inputDate = new Date()) => {
  const d = inputDate instanceof Date ? inputDate : new Date(inputDate || Date.now());
  const year = Math.max(1980, d.getFullYear());
  const time = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((d.getSeconds() >> 1) & 0x1f);
  const date = (((year - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0x0f) << 5) | (d.getDate() & 0x1f);
  return { time, date };
};

/**
 * Decodes a base64 Data URL into a Uint8Array.
 * @param {string} dataUrl 
 * @returns {Uint8Array}
 */
export const dataUrlToBytes = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return new Uint8Array(0);
  const commaIdx = dataUrl.indexOf(',');
  const base64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  try {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.warn('Could not decode Data URL to binary:', e);
    return new Uint8Array(0);
  }
};

/**
 * Packages multiple files into a standard PKZip Blob.
 * 
 * @param {Array<{ name: string, data: Uint8Array, date?: Date|number }>} files
 * @returns {Blob} ZIP archive Blob
 */
export const createZipBlob = (files = []) => {
  const encoder = new TextEncoder();
  const fileEntries = [];
  let currentOffset = 0;

  // 1. Process files and build local file chunks
  const localChunks = [];

  for (const file of files) {
    if (!file || !file.name) continue;
    const rawData = (file.data && (ArrayBuffer.isView(file.data) || file.data instanceof Uint8Array))
      ? (file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data.buffer, file.data.byteOffset, file.data.byteLength))
      : new Uint8Array(0);
    const nameBytes = encoder.encode(file.name);
    const crc = calculateCrc32(rawData);
    const { time, date } = dateToDosDateTime(file.date);
    const size = rawData.length;

    // Local Header (30 bytes) + Name + Data
    const localHeader = new Uint8Array(30);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed to extract (2.0)
    view.setUint16(6, 0x0800, true);     // General purpose bit flag (UTF-8 filename bit 11)
    view.setUint16(8, 0, true);          // Compression method: 0 (STORE)
    view.setUint16(10, time, true);      // Last mod file time
    view.setUint16(12, date, true);      // Last mod file date
    view.setUint32(14, crc, true);       // CRC-32
    view.setUint32(18, size, true);      // Compressed size
    view.setUint32(22, size, true);      // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // Filename length
    view.setUint16(28, 0, true);         // Extra field length

    fileEntries.push({
      nameBytes,
      crc,
      time,
      date,
      size,
      offset: currentOffset
    });

    localChunks.push(localHeader, nameBytes, rawData);
    currentOffset += localHeader.length + nameBytes.length + rawData.length;
  }

  // 2. Build Central Directory chunks
  const centralDirOffset = currentOffset;
  const centralChunks = [];
  let centralDirSize = 0;

  for (const entry of fileEntries) {
    const centralHeader = new Uint8Array(46);
    const view = new DataView(centralHeader.buffer);
    view.setUint32(0, 0x02014b50, true); // Central file header signature
    view.setUint16(4, 20, true);         // Version made by (2.0)
    view.setUint16(6, 20, true);         // Version needed (2.0)
    view.setUint16(8, 0x0800, true);     // Flags (UTF-8 filename)
    view.setUint16(10, 0, true);         // Compression method: 0
    view.setUint16(12, entry.time, true);// Time
    view.setUint16(14, entry.date, true);// Date
    view.setUint32(16, entry.crc, true); // CRC-32
    view.setUint32(20, entry.size, true);// Compressed size
    view.setUint32(24, entry.size, true);// Uncompressed size
    view.setUint16(28, entry.nameBytes.length, true); // Filename length
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // Comment length
    view.setUint16(34, 0, true);         // Disk number start
    view.setUint16(36, 0, true);         // Internal attrs
    view.setUint32(38, 0, true);         // External attrs
    view.setUint32(42, entry.offset, true); // Offset of local header

    centralChunks.push(centralHeader, entry.nameBytes);
    centralDirSize += centralHeader.length + entry.nameBytes.length;
  }

  // 3. Build End of Central Directory Record (22 bytes)
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true); // End of central dir signature
  endView.setUint16(4, 0, true);          // Disk number
  endView.setUint16(6, 0, true);          // Start disk
  endView.setUint16(8, fileEntries.length, true);  // Entries on disk
  endView.setUint16(10, fileEntries.length, true); // Total entries
  endView.setUint32(12, centralDirSize, true);     // Central directory size
  endView.setUint32(16, centralDirOffset, true);   // Central directory offset
  endView.setUint16(20, 0, true);         // Comment length

  // Combine all pieces into an application/zip Blob
  return new Blob([...localChunks, ...centralChunks, endRecord], { type: 'application/zip' });
};

/**
 * Initiates browser download of a Blob.
 * 
 * @param {Blob} blob 
 * @param {string} fileName 
 */
export const downloadBlob = (blob, fileName) => {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 20000);
};
