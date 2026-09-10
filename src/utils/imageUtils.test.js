import {
  isValidImageFile,
  calculateAspectRatioFit,
  formatFileSize,
  MAX_PHOTOS_PER_NOTE,
  compressImage,
  isMachineGeneratedName,
  formatPhotoDisplayName,
  getPhotoExportFileName
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

  test('isMachineGeneratedName detects timestamps and device camera patterns', () => {
    expect(isMachineGeneratedName('1741624385920.jpg')).toBe(true);
    expect(isMachineGeneratedName('IMG_20260910_173122.jpg')).toBe(true);
    expect(isMachineGeneratedName('PXL_20260910_173122123.jpg')).toBe(true);
    expect(isMachineGeneratedName('123todo-photo-1741624385920.webp')).toBe(true);
    expect(isMachineGeneratedName('image.png')).toBe(true);
    expect(isMachineGeneratedName('FullSizeRender.jpg')).toBe(true);

    // Custom user names should NOT be treated as machine generated
    expect(isMachineGeneratedName('kitchen-plan.jpg')).toBe(false);
    expect(isMachineGeneratedName('receipt-march.pdf.png')).toBe(false);
  });

  test('formatPhotoDisplayName produces concise, relevant titles', () => {
    const fixedTime = new Date(2026, 8, 10, 11, 30, 0).getTime(); // 10 Sep 2026 11:30

    // Machine-generated names should be converted to clean format
    expect(formatPhotoDisplayName('1741624385920.jpg', fixedTime)).toBe('Photo • 10 Sep, 11:30');
    expect(formatPhotoDisplayName('IMG_20260910_113000.jpg', fixedTime)).toBe('Photo • 10 Sep, 11:30');
    expect(formatPhotoDisplayName('123todo-photo-1741624385920.webp', fixedTime)).toBe('Photo • 10 Sep, 11:30');

    // Custom human filenames should be preserved
    expect(formatPhotoDisplayName('kitchen-renovation.jpg', fixedTime)).toBe('kitchen-renovation.jpg');

    // Overly long custom filenames should be truncated
    const longName = 'my-super-long-custom-photo-attachment-description-2026.png';
    expect(formatPhotoDisplayName(longName, fixedTime)).toBe('my-super-long-cust...png');
  });

  test('getPhotoExportFileName produces clean, readable filenames for export', () => {
    const fixedTime = new Date(2026, 8, 10, 11, 30, 0).getTime();
    const photo = {
      name: '1741624385920.jpg',
      timestamp: fixedTime
    };

    expect(getPhotoExportFileName(photo, 'jpg')).toBe('Photo-10Sep-1130.jpg');

    // Custom file name preserved
    const customPhoto = { name: 'invoice.pdf.png', timestamp: fixedTime };
    expect(getPhotoExportFileName(customPhoto, 'png')).toBe('invoice.pdf.png');
  });
});

