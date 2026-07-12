import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear }) => {
    const styles = {
        container: {
            padding: '0 12px',
            margin: '12px 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
        },
        input: {
            width: '100%',
            padding: '8px 12px 8px 36px',
            fontSize: '1.1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            fontFamily: 'Inter, sans-serif'
        },
        searchIcon: {
            position: 'absolute',
            left: '24px',
            color: 'var(--muted-text)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
        },
        clearBtn: {
            position: 'absolute',
            right: '24px',
            color: 'var(--muted-text)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.searchIcon}>
                <Search size={16} />
            </div>
            <input
                id="searchInput"
                type="text"
                placeholder="Search tasks..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={styles.input}
            />
            {value && (
                <button onClick={onClear} style={styles.clearBtn}>
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
