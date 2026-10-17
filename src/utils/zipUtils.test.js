import { calculateCrc32, dateToDosDateTime, dataUrlToBytes, createZipBlob, downloadBlob } from './zipUtils';

describe('zipUtils', () => {
  describe('calculateCrc32', () => {
    it('returns 0 for empty or invalid input', () => {
      expect(calculateCrc32(null)).toBe(0);
      expect(calculateCrc32(new Uint8Array(0))).toBe(0);
    });

    it('correctly calculates standard CRC32 check value for "123456789"', () => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode('123456789');
      // Standard CRC-32 for "123456789" is 0xCBF43926 = 3422294758 (as signed: -873187034, as unsigned: 3421780262)
      expect(calculateCrc32(bytes)).toBe(0xcbf43926 >>> 0);
    });
  });

  describe('dateToDosDateTime', () => {
    it('generates valid MS-DOS time and date bitfields', () => {
      const d = new Date(2026, 8, 10, 14, 30, 22); // Month is 0-indexed (8 = Sept)
      const { time, date } = dateToDosDateTime(d);
      expect(typeof time).toBe('number');
      expect(typeof date).toBe('number');
      expect(time).toBeGreaterThan(0);
      expect(date).toBeGreaterThan(0);
    });

    it('defaults gracefully when called with no arguments or undefined', () => {
      const res = dateToDosDateTime();
      expect(res.time).toBeGreaterThanOrEqual(0);
      expect(res.date).toBeGreaterThanOrEqual(0);
    });
  });

  describe('dataUrlToBytes', () => {
    it('decodes base64 data URL to bytes correctly', () => {
      // "hello world" in base64 is "aGVsbG8gd29ybGQ="
      const dataUrl = 'data:text/plain;base64,aGVsbG8gd29ybGQ=';
      const bytes = dataUrlToBytes(dataUrl);
      const decoder = new TextDecoder();
      expect(decoder.decode(bytes)).toBe('hello world');
    });

    it('handles raw base64 string without data: prefix', () => {
      const rawBase64 = 'aGVsbG8='; // "hello"
      const bytes = dataUrlToBytes(rawBase64);
      const decoder = new TextDecoder();
      expect(decoder.decode(bytes)).toBe('hello');
    });

    it('returns empty Uint8Array on invalid or null input', () => {
      expect(dataUrlToBytes(null)).toEqual(new Uint8Array(0));
      expect(dataUrlToBytes('')).toEqual(new Uint8Array(0));
    });
  });

  describe('createZipBlob', () => {
    it('creates a valid application/zip Blob', () => {
      const encoder = new TextEncoder();
      const files = [
        {
          name: 'test.txt',
          data: encoder.encode('Test content in zip'),
          date: new Date()
        },
        {
          name: 'photo.jpg',
          data: new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
          date: new Date()
        }
      ];

      const blob = createZipBlob(files);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/zip');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('handles empty files list gracefully', () => {
      const blob = createZipBlob([]);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/zip');
      // Even an empty ZIP has a 22-byte End of Central Directory record
      expect(blob.size).toBe(22);
    });
  });

  describe('downloadBlob', () => {
    it('triggers link click without error', () => {
      const blob = new Blob(['sample'], { type: 'text/plain' });
      const origCreate = window.URL.createObjectURL;
      const origRevoke = window.URL.revokeObjectURL;

      window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      window.URL.revokeObjectURL = jest.fn();

      expect(() => downloadBlob(blob, 'sample.txt')).not.toThrow();

      window.URL.createObjectURL = origCreate;
      window.URL.revokeObjectURL = origRevoke;
    });
  });
});
