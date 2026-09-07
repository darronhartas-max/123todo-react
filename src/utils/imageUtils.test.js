import {
  isValidImageFile,
  calculateAspectRatioFit,
  formatFileSize,
  MAX_PHOTOS_PER_NOTE,
  compressImage
} from './imageUtils';

describe('imageUtils', () => {
  test('constants are correctly configured', () => {
    expect(MAX_PHOTOS_PER_NOTE).toBe(3);
  });

  test('isValidImageFile correctly identifies supported formats', () => {
    expect(isValidImageFile({ type: 'image/jpeg', name: 'photo.jpg' })).toBe(true);
    expect(isValidImageFile({ type: 'image/png', name: 'screenshot.png' })).toBe(true);
    expect(isValidImageFile({ type: 'image/webp', name: 'diagram.webp' })).toBe(true);
    expect(isValidImageFile({ type: 'image/gif', name: 'anim.gif' })).toBe(true);
    expect(isValidImageFile({ type: '', name: 'receipt.heic' })).toBe(true);

    expect(isValidImageFile(null)).toBe(false);
    expect(isValidImageFile({ type: 'application/pdf', name: 'doc.pdf' })).toBe(false);
    expect(isValidImageFile({ type: 'text/plain', name: 'notes.txt' })).toBe(false);
  });

  test('calculateAspectRatioFit scales down while preserving aspect ratio', () => {
    // Landscape photo 4000x3000 to max 2048px
    const landscape = calculateAspectRatioFit(4000, 3000, 2048, 2048);
    expect(landscape.width).toBe(2048);
    expect(landscape.height).toBe(1536);

    // Portrait photo 3000x4000 to max 2048px
    const portrait = calculateAspectRatioFit(3000, 4000, 2048, 2048);
    expect(portrait.width).toBe(1536);
    expect(portrait.height).toBe(2048);

    // Image smaller than max dimensions should not be scaled up
    const small = calculateAspectRatioFit(800, 600, 2048, 2048);
    expect(small.width).toBe(800);
    expect(small.height).toBe(600);
  });

  test('formatFileSize formats byte numbers to clean human-readable strings', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(150 * 1024)).toBe('150 KB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  test('compressImage handles mock/dataUrl input cleanly in test environment', async () => {
    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await compressImage(mockDataUrl, { fileName: 'test-screengrab.png' });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('dataUrl');
    expect(result).toHaveProperty('thumbnail');
    expect(result.id).toMatch(/^img_/);
    expect(result.name).toBe('test-screengrab.png');
  });
});
