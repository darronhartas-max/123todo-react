export const THEME = {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#fafafa',
    surface: '#ffffff',
    border: '#e5e7eb',
    text: '#333333',
    textLight: '#6b7280',
    success: '#10b981',
    danger: '#dc2626',
    warning: '#f59e0b',
    info: '#3b82f6',
    accent: '#9333ea'
};

export const COMMON_STYLES = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modalContent: {
        background: '#fff',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '90%',
        width: '320px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
    },
    btnReset: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        margin: 0,
        font: 'inherit'
    }
};
