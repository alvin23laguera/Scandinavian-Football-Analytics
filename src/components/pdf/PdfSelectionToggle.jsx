import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const PdfSelectionToggle = ({ 
    title, 
    phase
}) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const captureElement = async (button) => {
        let panel = button.closest('.glass-panel');
        if (!panel) return null;

        const target = panel.querySelector('.pdf-export-target') || panel;
        
        // Add a temporary margin for the screenshot
        const originalPosition = target.style.position;
        const originalPadding = target.style.padding;
        const originalBackground = target.style.background;
        const originalBorderRadius = target.style.borderRadius;

        target.style.position = 'relative';
        target.style.padding = '20px'; 
        target.style.background = '#1e293b';
        target.style.borderRadius = '12px';

        try {
            const canvas = await html2canvas(target, {
                scale: 2.5, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#1e293b',
                ignoreElements: (element) => {
                    if (element.tagName === 'BUTTON') return true;
                    if (element.tagName === 'SELECT') return true;
                    if (element.classList && element.classList.contains('section-title')) return true;
                    if (element.hasAttribute && element.hasAttribute('data-html2canvas-ignore')) return true;
                    return false;
                }
            });
            
            // Cleanup
            target.style.position = originalPosition;
            target.style.padding = originalPadding;
            target.style.background = originalBackground;
            target.style.borderRadius = originalBorderRadius;

            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error("Capture failed", error);
            target.style.position = originalPosition;
            target.style.padding = originalPadding;
            target.style.background = originalBackground;
            target.style.borderRadius = originalBorderRadius;
            return null;
        }
    };

    const handleDownload = async (e) => {
        if (isDownloading) return;
        setIsDownloading(true);
        const button = e.currentTarget;

        setTimeout(async () => {
            const imageData = await captureElement(button);
            if (imageData) {
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '_')}_${phase}.png`;
                link.href = imageData;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            setIsDownloading(false);
        }, 50);
    };

    return (
        <div data-html2canvas-ignore="true" style={{ width: '100%' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 50, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                    onClick={handleDownload}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: isDownloading ? 'wait' : 'pointer',
                        color: isDownloading ? 'var(--color-primary, #3b82f6)' : 'rgba(255,255,255,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem',
                        transition: 'color 0.2s'
                    }}
                    title="Download Image"
                >
                    {isDownloading ? (
                        <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'currentColor' }}></div>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PdfSelectionToggle;
