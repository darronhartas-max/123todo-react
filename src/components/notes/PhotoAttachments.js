import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, ZoomIn, Download, AlertCircle, Share2, Clock, Check, Copy } from 'lucide-react';
import { 
  compressImage, 
  isValidImageFile, 
  formatFileSize, 
  MAX_PHOTOS_PER_NOTE,
  formatPhotoDisplayName,
  getPhotoExportFileName
} from '../../utils/imageUtils';
import { savePhoto, getPhoto, getPhotos, deletePhoto } from '../../utils/photoStorage';
import { formatEvidentiaryTimestamp } from '../../utils/dateUtils';
import { dataUrlToBytes, downloadBlob } from '../../utils/zipUtils';

const PhotoAttachments = ({
  photos = [],
  onChange,
  readOnly = false,
  maxPhotos = MAX_PHOTOS_PER_NOTE,
  containerStyle = {},
  showCounter = true,
  rightAction = null
}) => {
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);
  const [hydratedThumbnails, setHydratedThumbnails] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedPhotoTimestamp, setCopiedPhotoTimestamp] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');

  // Hydrate thumbnails from IndexedDB for photos stored lightweight in localStorage
  useEffect(() => {
    let isMounted = true;
    const missingPhotos = (photos || []).filter(
      p => p && p.id && !p.thumbnail && !p.dataUrl && !hydratedThumbnails[p.id]
    );

    if (missingPhotos.length > 0) {
      getPhotos(missingPhotos.map(p => p.id)).then(loadedList => {
        if (!isMounted) return;
        const newMap = {};
        loadedList.forEach(p => {
          if (p && p.id && (p.thumbnail || p.dataUrl)) {
            newMap[p.id] = p.thumbnail || p.dataUrl;
          }
        });
        if (Object.keys(newMap).length > 0) {
          setHydratedThumbnails(prev => ({ ...prev, ...newMap }));
        }
      }).catch(err => console.warn('Could not hydrate note thumbnails from IndexedDB:', err));
    }

    return () => {
      isMounted = false;
    };
  }, [photos, hydratedThumbnails]);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const clearError = () => setErrorMessage('');

  const handleDownloadPhoto = async (photo) => {
    try {
      let dataUrl = photo?.dataUrl;
      let photoToUse = photo;
      if (!dataUrl && photo?.id) {
        const full = await getPhoto(photo.id);
        if (full) {
          dataUrl = full.dataUrl || full.thumbnail;
          photoToUse = { ...photo, ...full };
        }
      }
      if (!dataUrl) {
        dataUrl = photo?.thumbnail;
      }
      if (!dataUrl) {
        alert('Could not find photo data to download.');
        return;
      }

      // Synchronously decode base64 without fetch(dataUrl), preventing WebKit/iOS Safari fetch network errors
      const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : (dataUrl.includes('image/webp') ? 'image/webp' : dataUrl.includes('image/png') ? 'image/png' : 'image/jpeg');
      const bytes = dataUrlToBytes(dataUrl);
      if (!bytes || bytes.length === 0) {
        alert('Could not decode photo for download.');
        return;
      }

      const blob = new Blob([bytes], { type: mimeType });
      const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      const fileName = getPhotoExportFileName(photoToUse, ext);

      // Mobile devices (iOS Safari & Android PWA): WebKit ignores <a download> for blobs.
      // navigator.share allows direct "Save Image" to Photos, "Save to Files", or Mail attachment.
      const isMobileDevice = typeof navigator !== 'undefined' && (
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent))
      );

      if (isMobileDevice && navigator.canShare && typeof File !== 'undefined') {
        try {
          const file = new File([blob], fileName, { type: mimeType });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: formatPhotoDisplayName(photoToUse.name, photoToUse.timestamp)
            });
            setDownloadStatus('Saved');
            setTimeout(() => setDownloadStatus(''), 2500);
            return;
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
          console.warn('Native mobile share failed, falling back to download:', shareErr);
        }
      }

      // Desktop and standard browser download
      downloadBlob(blob, fileName);
      setDownloadStatus('Downloaded');
      setTimeout(() => setDownloadStatus(''), 2500);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download photo. Please try again.');
    }
  };

  const handleShareOrSavePhoto = async (photo) => {
    try {
      let dataUrl = photo?.dataUrl;
      let photoToUse = photo;
      if (!dataUrl && photo?.id) {
        const full = await getPhoto(photo.id);
        if (full) {
          dataUrl = full.dataUrl || full.thumbnail;
          photoToUse = { ...photo, ...full };
        }
      }
      if (!dataUrl) {
        dataUrl = photo?.thumbnail;
      }
      if (!dataUrl) return;

      const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : (dataUrl.includes('image/webp') ? 'image/webp' : dataUrl.includes('image/png') ? 'image/png' : 'image/jpeg');
      const bytes = dataUrlToBytes(dataUrl);
      const blob = new Blob([bytes], { type: mimeType });
      const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      const fileName = getPhotoExportFileName(photoToUse, ext);
      const file = new File([blob], fileName, { type: mimeType });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: formatPhotoDisplayName(photoToUse.name, photoToUse.timestamp)
        });
        setShareStatus('Shared');
        setTimeout(() => setShareStatus(''), 2500);
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('Web Share unavailable, falling back to download:', err);
    }

    // Fallback: direct browser download
    handleDownloadPhoto(photo);
  };

  const handleCopyPhotoTimestamp = (ts) => {
    if (!ts) return;
    const str = `123 ToDo Photo | Captured: ${formatEvidentiaryTimestamp(ts)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(str).then(() => {
        setCopiedPhotoTimestamp(true);
        setTimeout(() => setCopiedPhotoTimestamp(false), 2500);
      }).catch(() => {});
    }
  };

  // Handle new incoming files (from Camera, File picker, Drag & Drop, or Clipboard Paste)
  const processFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    clearError();

    const currentPhotos = photos || [];
    const availableSlots = maxPhotos - currentPhotos.length;

    if (availableSlots <= 0) {
      setErrorMessage(`Maximum of ${maxPhotos} photos reached.`);
      setTimeout(clearError, 4000);
      return;
    }

    const filesToProcess = Array.from(files).filter(isValidImageFile).slice(0, availableSlots);

    if (filesToProcess.length === 0) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP, GIF, HEIC).');
      setTimeout(clearError, 4000);
      return;
    }

    setIsProcessing(true);

    try {
      const processedList = [];
      for (const file of filesToProcess) {
        const compressed = await compressImage(file);
        // Persist to IndexedDB in background
        savePhoto(compressed).catch(err => console.warn('IndexedDB photo save error:', err));
        processedList.push(compressed);
      }

      if (onChange) {
        onChange([...currentPhotos, ...processedList]);
      }
    } catch (err) {
      console.error('Error processing photo attachment:', err);
      setErrorMessage('Could not process photo attachment. Please try another image.');
      setTimeout(clearError, 4000);
    } finally {
      setIsProcessing(false);
    }
  }, [photos, maxPhotos, onChange]);

  // Handle native file input change
  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    e.target.value = ''; // Reset input to allow re-selection of the same file
  };

  // Handle photo deletion
  const handleDelete = (e, photoId) => {
    e.stopPropagation();
    if (readOnly) return;
    if (window.confirm && !window.confirm('Delete this photo attachment?')) {
      return;
    }
    deletePhoto(photoId).catch(() => {});
    if (onChange) {
      onChange(photos.filter(p => p.id !== photoId));
    }
    if (activeLightboxPhoto?.id === photoId) {
      setActiveLightboxPhoto(null);
    }
  };

  // Handle opening lightbox with full-resolution photo (hydrating from IndexedDB if needed)
  const handleOpenLightbox = async (photo) => {
    if (!photo) return;
    const initialPhoto = hydratedThumbnails[photo.id]
      ? { ...photo, thumbnail: photo.thumbnail || hydratedThumbnails[photo.id] }
      : photo;
    setActiveLightboxPhoto(initialPhoto);
    if (!initialPhoto.dataUrl && initialPhoto.id) {
      try {
        const full = await getPhoto(initialPhoto.id);
        if (full && (full.dataUrl || full.thumbnail)) {
          setActiveLightboxPhoto(prev => (prev && prev.id === photo.id ? { ...prev, ...full } : prev));
        }
      } catch (e) {
        console.warn('Could not load full photo from IndexedDB:', e);
      }
    }
  };

  // Clipboard Paste Support (Cmd+V / Ctrl+V for Desktop Screen Grabs)
  useEffect(() => {
    if (readOnly) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('paste', handlePaste);
    }
    return () => {
      if (containerEl) {
        containerEl.removeEventListener('paste', handlePaste);
      }
    };
  }, [readOnly, processFiles]);

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Close Lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeLightboxPhoto) {
        setActiveLightboxPhoto(null);
      }
    };
    if (activeLightboxPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxPhoto]);

  const currentCount = (photos || []).length;
  const isFull = currentCount >= maxPhotos;

  return (
    <div 
      ref={containerRef} 
      style={{
        marginTop: '8px',
        marginBottom: '8px',
        ...containerStyle
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file inputs: One for Camera, One for Library/Picker */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleInputChange}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        aria-label="Capture photo with camera"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        multiple={maxPhotos - currentCount > 1}
        style={{ display: 'none' }}
        aria-label="Select photo from library"
      />

      {/* Action Toolbar & Counter (When not read-only) */}
      {!readOnly && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '6px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Mobile Camera Shutter Button */}
            <button
              type="button"
              disabled={isFull || isProcessing}
              onClick={() => cameraInputRef.current?.click()}
              title={isFull ? `Maximum ${maxPhotos} photos reached` : "Take a photo with camera"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: isFull ? 'var(--item-bg)' : 'var(--bg-color)',
                color: isFull ? 'var(--muted-text)' : 'var(--text-color)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: isFull ? 'not-allowed' : 'pointer',
                opacity: isFull ? 0.6 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              <Camera size={14} style={{ color: 'var(--accent-color)' }} />
              <span>Camera</span>
            </button>

            {/* Upload / Photo Library Button */}
            <button
              type="button"
              disabled={isFull || isProcessing}
              onClick={() => fileInputRef.current?.click()}
              title={isFull ? `Maximum ${maxPhotos} photos reached` : "Attach photo or paste screen grab"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: isFull ? 'var(--item-bg)' : 'var(--bg-color)',
                color: isFull ? 'var(--muted-text)' : 'var(--text-color)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: isFull ? 'not-allowed' : 'pointer',
                opacity: isFull ? 0.6 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              <ImageIcon size={14} style={{ color: '#10b981' }} />
              <span>Attach</span>
            </button>
          </div>

          {rightAction ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isProcessing && <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: '600' }}>• Compressing...</span>}
              {rightAction}
            </div>
          ) : showCounter ? (
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: isFull ? '#f59e0b' : 'var(--muted-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Photos: {currentCount}/{maxPhotos}</span>
              {isProcessing && <span style={{ color: 'var(--accent-color)' }}>• Compressing...</span>}
            </div>
          ) : null}
        </div>
      )}

      {/* Error / Alert banner */}
      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '6px',
          padding: '5px 8px',
          fontSize: '0.78rem',
          color: '#ef4444',
          marginBottom: '8px'
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Visual Indication */}
      {isDragOver && !readOnly && (
        <div style={{
          border: '2px dashed var(--accent-color)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          background: 'var(--accent-bg)',
          color: 'var(--accent-color)',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Drop photo to attach to note
        </div>
      )}

      {/* Thumbnail Gallery Row */}
      {photos && photos.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginTop: readOnly ? '4px' : '0'
        }}>
          {photos.map((photo, idx) => {
            const displaySrc = photo.thumbnail || photo.dataUrl || hydratedThumbnails[photo.id];
            return (
              <div
                key={photo.id || idx}
                onClick={() => handleOpenLightbox(photo)}
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-color)',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  flexShrink: 0
                }}
                title={photo.timestamp 
                  ? `${formatPhotoDisplayName(photo.name, photo.timestamp)} (${formatFileSize(photo.size)}) • Captured: ${formatEvidentiaryTimestamp(photo.timestamp)} - Click to view full size`
                  : `${formatPhotoDisplayName(photo.name, photo.timestamp)} (${formatFileSize(photo.size)}) - Click to view full size`}
              >
                {displaySrc ? (
                  <img
                    src={displaySrc}
                    alt={formatPhotoDisplayName(photo.name, photo.timestamp)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--item-bg)',
                    color: 'var(--muted-text)'
                  }}>
                    <ImageIcon size={22} style={{ opacity: 0.6 }} />
                  </div>
                )}

                {/* Delete button (only in edit mode) */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, photo.id)}
                    title="Remove photo"
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <X size={12} />
                  </button>
                )}

                {/* Zoom indicator icon on hover */}
                <div style={{
                  position: 'absolute',
                  bottom: '3px',
                  right: '3px',
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '3px',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#ffffff'
                }}>
                  <ZoomIn size={10} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal (Full Screen High-Resolution Preview) */}
      {activeLightboxPhoto && (
        <div 
          onClick={() => setActiveLightboxPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.90)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 20px',
            boxSizing: 'border-box'
          }}
        >
          {/* Lightbox Header Controls */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 'min(96vw, 1400px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              color: '#ffffff',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Bar: Clean Title & Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              width: '100%',
              minWidth: 0
            }}>
              {/* Left: Concise, relevant photo title with ellipsis */}
              <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
                <span 
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    color: '#ffffff',
                    letterSpacing: '-0.01em'
                  }}
                  title={activeLightboxPhoto.name || 'Photo Attachment'}
                >
                  {formatPhotoDisplayName(activeLightboxPhoto.name, activeLightboxPhoto.timestamp)}
                </span>
              </div>

              {/* Right: Actions (Spaced out, larger touch targets, crystal-clear labels) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                {/* Share button */}
                <button
                  type="button"
                  onClick={() => handleShareOrSavePhoto(activeLightboxPhoto)}
                  aria-label="Share"
                  title="Share image (AirDrop, Messages, Drive, etc.)"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    height: '38px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
                    transition: 'transform 0.15s ease, opacity 0.15s ease'
                  }}
                >
                  <Share2 size={16} />
                  <span>{shareStatus ? `✓ ${shareStatus}` : 'Share'}</span>
                </button>

                {/* Download button */}
                <button
                  type="button"
                  onClick={() => handleDownloadPhoto(activeLightboxPhoto)}
                  aria-label="Download"
                  title="Download image"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    height: '38px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <Download size={16} />
                  <span>{downloadStatus ? `✓ ${downloadStatus}` : 'Download'}</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveLightboxPhoto(null)}
                  title="Close (Esc)"
                  aria-label="Close"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.18)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background 0.15s ease'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Bottom Row: Metadata & Timestamp Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '0.78rem',
              opacity: 0.9,
              color: 'rgba(255, 255, 255, 0.85)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{formatFileSize(activeLightboxPhoto.size)}</span>
                {activeLightboxPhoto.width && activeLightboxPhoto.height ? (
                  <span>• {activeLightboxPhoto.width}×{activeLightboxPhoto.height}</span>
                ) : null}
              </div>

              {activeLightboxPhoto.timestamp ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.15)', padding: '3px 9px', borderRadius: '4px' }}>
                  <Clock size={12} />
                  <span>Captured: {formatEvidentiaryTimestamp(activeLightboxPhoto.timestamp)}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyPhotoTimestamp(activeLightboxPhoto.timestamp)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedPhotoTimestamp ? '#34d399' : '#93c5fa',
                      cursor: 'pointer',
                      padding: '1px 3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: '700',
                      fontSize: '0.75rem'
                    }}
                    title="Copy photo evidentiary timestamp"
                  >
                    {copiedPhotoTimestamp ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                    <span>{copiedPhotoTimestamp ? 'Copied' : 'Copy'}</span>
                  </button>
                </span>
              ) : null}
            </div>
          </div>

          {/* Lightbox Image Viewport */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'min(96vw, 1400px)',
              height: 'calc(88vh - 80px)',
              maxHeight: 'calc(88vh - 80px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={activeLightboxPhoto.dataUrl || activeLightboxPhoto.thumbnail}
              alt={activeLightboxPhoto.name || 'Full view'}
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(88vh - 80px)',
                width: 'auto',
                height: 'auto',
                minWidth: 'min(360px, 90vw)',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoAttachments;
