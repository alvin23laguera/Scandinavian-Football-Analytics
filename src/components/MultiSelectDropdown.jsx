import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ label, options, selectedValues, onChange, selectAllLabel, quickActions, maxSelection }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {label && <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{label}:</label>}
            
            <div 
                style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    minWidth: '200px', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ fontSize: '0.9rem' }}>
                    {selectedValues.length === 0 
                        ? 'None selected' 
                        : selectedValues.length === options.length 
                            ? 'All selected'
                            : `${selectedValues.length} selected`}
                </span>
                <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>{isOpen ? '▲' : '▼'}</span>
            </div>
            
            {isOpen && (
                <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: label ? '60px' : '0', 
                    marginTop: '0.5rem',
                    background: 'var(--color-bg-card)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    zIndex: 1000, 
                    minWidth: '280px', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.8)' 
                }}>
                    
                    {/* Standard Select All/Clear */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {!maxSelection && (
                            <button 
                                onClick={() => onChange(options.map(o => o.value))}
                                style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--color-accent-blue)', color: 'var(--color-text-primary)', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                {selectAllLabel || 'Select All'}
                            </button>
                        )}
                        <button 
                            onClick={() => onChange([])}
                            style={{ background: 'transparent', border: '1px solid var(--color-accent-pink)', color: 'var(--color-accent-pink)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Clear
                        </button>
                    </div>

                    {/* Custom Quick Actions (e.g. Last 3 Games) */}
                    {quickActions && quickActions.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
                            {quickActions.map((act, i) => (
                                <button 
                                    key={i}
                                    onClick={act.onClick}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                    {act.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Options list */}
                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {options.length === 0 ? (
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>No options available</span>
                        ) : (
                            options.map(opt => (
                                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem 0' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedValues.includes(opt.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                if (maxSelection && selectedValues.length >= maxSelection) return;
                                                onChange([...selectedValues, opt.value]);
                                            } else {
                                                onChange(selectedValues.filter(v => v !== opt.value));
                                            }
                                        }}
                                        style={{ accentColor: 'var(--color-accent-blue)', transform: 'scale(1.1)' }}
                                    />
                                    {opt.label}
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
