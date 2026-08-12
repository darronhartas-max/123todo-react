import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, CheckSquare, X, ArrowRight } from 'lucide-react';

const SkinDiscoveryModal = ({ isOpen, onClose, currentMode, onSwitchMode }) => {
  if (!isOpen) return null;

  const handleSelectMode = (mode) => {
    onSwitchMode(mode);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '28px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            color: 'var(--text-color, #1f2937)',
            position: 'relative',
            border: '1px solid var(--border-color, rgba(0,0,0,0.1))'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #6b7280)',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
              color: '#fff', 
              padding: '6px 12px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} /> NEW FEATURE
            </span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 10px 0', lineHeight: 1.3 }}>
            Two Ways to Use 123 ToDo!
          </h2>

          <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary, #4b5563)', marginBottom: '20px' }}>
            Whether you need structured task prioritization or rapid hands-free voice notes on-site, 123 ToDo supports both modes seamlessly with unified data.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div 
              onClick={() => handleSelectMode('notes')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '14px',
                border: currentMode === 'notes' ? '2px solid #2563eb' : '1px solid var(--border-color, #e5e7eb)',
                backgroundColor: currentMode === 'notes' ? 'rgba(37, 99, 235, 0.08)' : 'var(--item-bg, #f9fafb)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                background: '#2563eb',
                color: '#fff',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex'
              }}>
                <Mic size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-color, #111827)' }}>
                  🎙️ Voice Notes Mode
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)', marginTop: '2px', lineHeight: '1.4' }}>
                  Big text, quick voice dictation for builders & field notes. Assign tasks & projects later!
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleSelectMode('tasks')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '14px',
                border: currentMode === 'tasks' ? '2px solid #2563eb' : '1px solid var(--border-color, #e5e7eb)',
                backgroundColor: currentMode === 'tasks' ? 'rgba(37, 99, 235, 0.08)' : 'var(--item-bg, #f9fafb)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                background: '#10b981',
                color: '#fff',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex'
              }}>
                <CheckSquare size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-color, #111827)' }}>
                  📋 Task Manager Mode
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)', marginTop: '2px', lineHeight: '1.4' }}>
                  Full P1-P4 priority matrix, drag & drop, due dates, subtasks & attached notes.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Explore Mode Switcher</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SkinDiscoveryModal;
