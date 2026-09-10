import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, ZoomIn, Download, AlertCircle, Share2, Clock, Check, Copy } from 'lucide-react';
import { compressImage, isValidImageFile, formatFileSize, MAX_PHOTOS_PER_NOTE } from '../../utils/imageUtils';
import { savePhoto, getPhoto, deletePhoto } from '../../utils/photoStorage';
import { formatEvidentiaryTimestamp } from '../../utils/dateUtils';

const PhotoAttachments = ({
  photos = [],
  onChange,
  readOnly = false,
  maxPhotos = MAX_PHOTOS_PER_NOTE,
  containerStyle = {}
}) => {
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedPhotoTimestamp, setCopiedPhotoTimestamp] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const clearError = () => setErrorMessage('');

  const handleShareOrSavePhoto = async (photo) => {
    try {
      const dataUrl = photo.dataUrl || (await getPhoto(photo.id))?.dataUrl;
      if (!dataUrl) return;

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
      const fileName = photo.name || `123todo-photo-${Date.now()}.${ext}`;
      const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: photo.name || 'Photo from 123 ToDo'
        });
        setShareStatus('Saved/Shared!');
        setTimeout(() => setShareStatus(''), 2500);
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('Web Share unavailable, falling back to download:', err);
    }

    // Fallback: direct browser download
    try {
      const link = document.createElement('a');
      link.href = photo.dataUrl;
      link.download = photo.name || '123todo-photo.webp';
      link.click();
      setShareStatus('Downloaded!');
      setTimeout(() => setShareStatus(''), 2500);
    } catch (e) {
      console.error('Download error:', e);
    }
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
      setErrorMessage(`Maximum of ${maxPhotos} photos per note reached.`);
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
    if (photo.dataUrl) {
      setActiveLightboxPhoto(photo);
      return;
    }
    try {
      const full = await getPhoto(photo.id);
      if (full && full.dataUrl) {
        setActiveLightboxPhoto({ ...photo, ...full });
        return;
      }
    } catch (e) {
      console.warn('Could not load full photo from IndexedDB:', e);
    }
    setActiveLightboxPhoto(photo);
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
            const displaySrc = photo.thumbnail || photo.dataUrl;
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
                  ? `${photo.name || 'Photo'} (${formatFileSize(photo.size)}) • Captured: ${formatEvidentiaryTimestamp(photo.timestamp)} - Click to view full size`
                  : `${photo.name || 'Photo'} (${formatFileSize(photo.size)}) - Click to view full size`}
              >
                <img
                  src={displaySrc}
                  alt={photo.name || 'Note attachment'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

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
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          {/* Lightbox Header Controls */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '900px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>
                {activeLightboxPhoto.name || 'Photo Attachment'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.75rem', opacity: 0.85 }}>
                <span>{formatFileSize(activeLightboxPhoto.size)}</span>
                {activeLightboxPhoto.width && activeLightboxPhoto.height ? (
                  <span>• {activeLightboxPhoto.width}×{activeLightboxPhoto.height}</span>
                ) : null}
                {activeLightboxPhoto.timestamp ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                    <Clock size={11} />
                    <span>Captured: {formatEvidentiaryTimestamp(activeLightboxPhoto.timestamp)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPhotoTimestamp(activeLightboxPhoto.timestamp)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedPhotoTimestamp ? '#10b981' : '#60a5fa',
                        cursor: 'pointer',
                        padding: '1px 3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: '700'
                      }}
                      title="Copy photo evidentiary timestamp"
                    >
                      {copiedPhotoTimestamp ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                      <span>{copiedPhotoTimestamp ? 'Copied' : 'Copy'}</span>
                    </button>
                  </span>
                ) : null}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Share / Save to Photos button (Native Web Share on iOS & Android, or fallback) */}
              <button
                type="button"
                onClick={() => handleShareOrSavePhoto(activeLightboxPhoto)}
                title="Save to Photos / Share (AirDrop, WhatsApp, Files, etc.)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(37, 99, 235, 0.9)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                <Share2 size={15} />
                <span>{shareStatus ? `✓ ${shareStatus}` : 'Save to Photos / Share'}</span>
              </button>

              {/* Download button */}
              <a
                href={activeLightboxPhoto.dataUrl}
                download={activeLightboxPhoto.name || '123todo-photo.webp'}
                title="Download original photo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  textDecoration: 'none'
                }}
              >
                <Download size={18} />
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveLightboxPhoto(null)}
                title="Close (Esc)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lightbox Image Viewport */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '900px',
              maxHeight: 'calc(90vh - 60px)',
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
                maxHeight: 'calc(90vh - 60px)',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoAttachments;
