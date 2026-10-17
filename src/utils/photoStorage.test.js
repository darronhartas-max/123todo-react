import {
  savePhoto,
  savePhotos,
  getPhoto,
  getPhotos,
  deletePhoto,
  deletePhotos,
  getAllPhotos,
  requestPersistentStorage
} from './photoStorage';

describe('photoStorage', () => {
  beforeEach(async () => {
    // Clear out any previous items
    const all = await getAllPhotos();
    await deletePhotos(all.map(p => p.id));
  });

  test('requestPersistentStorage returns a boolean and does not throw', async () => {
    const res = await requestPersistentStorage();
    expect(typeof res).toBe('boolean');
  });

  test('savePhoto returns null/undefined if photo is invalid', async () => {
    const res = await savePhoto(null);
    expect(res).toBeNull();

    const empty = await savePhoto({});
    expect(empty).toEqual({});
  });

  test('saves and retrieves a single photo attachment', async () => {
    const samplePhoto = {
      id: 'photo-1',
      name: 'invoice.jpg',
      dataUrl: 'data:image/jpeg;base64,12345',
      thumbnail: 'data:image/jpeg;base64,thumb'
    };

    const saved = await savePhoto(samplePhoto);
    expect(saved.id).toBe('photo-1');

    const retrieved = await getPhoto('photo-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved.name).toBe('invoice.jpg');
    expect(retrieved.dataUrl).toBe('data:image/jpeg;base64,12345');
  });

  test('merges partial metadata without losing full image dataUrl', async () => {
    await savePhoto({
      id: 'photo-merge',
      name: 'receipt.png',
      dataUrl: 'data:image/png;base64,fullimagebytes',
      thumbnail: 'data:image/png;base64,thumb'
    });

    // Update only the name, without passing dataUrl
    await savePhoto({
      id: 'photo-merge',
      name: 'renamed-receipt.png'
    });

    const updated = await getPhoto('photo-merge');
    expect(updated.name).toBe('renamed-receipt.png');
    expect(updated.dataUrl).toBe('data:image/png;base64,fullimagebytes');
  });

  test('saves multiple photos via savePhotos and retrieves via getPhotos', async () => {
    const list = [
      { id: 'p1', name: 'p1.jpg', dataUrl: 'data:p1' },
      { id: 'p2', name: 'p2.jpg', dataUrl: 'data:p2' },
      { id: 'p3', name: 'p3.jpg', dataUrl: 'data:p3' }
    ];

    await savePhotos(list);

    const retrieved = await getPhotos(['p1', 'p2', 'p3']);
    expect(retrieved).toHaveLength(3);
    expect(retrieved.map(p => p.id)).toEqual(['p1', 'p2', 'p3']);
  });

  test('deletes a photo by ID', async () => {
    await savePhoto({ id: 'photo-delete', name: 'to-delete.jpg' });
    expect(await getPhoto('photo-delete')).not.toBeNull();

    await deletePhoto('photo-delete');
    expect(await getPhoto('photo-delete')).toBeNull();
  });

  test('getAllPhotos returns all stored photos', async () => {
    await savePhoto({ id: 'all-1', name: '1.jpg', dataUrl: 'data:1' });
    await savePhoto({ id: 'all-2', name: '2.jpg', dataUrl: 'data:2' });

    const all = await getAllPhotos();
    const ids = all.map(p => p.id);
    expect(ids).toContain('all-1');
    expect(ids).toContain('all-2');
  });
});
