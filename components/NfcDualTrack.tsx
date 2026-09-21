import React from 'react';

export default function NfcDualTrack({ className = '' }: { className?: string }) {
  return (
    <div className={`nfc-dual-grid ${className}`}>
      {/* Track 1: Physical Metal NFC Card */}
      <div className="nfc-track-card">
        <div className="nfc-track-header">
          <div className="nfc-track-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <h4 className="nfc-track-title">Physical Metal Card</h4>
          </div>
        </div>
        <div className="nfc-flow-steps">
          <div className="nfc-flow-step">
            <span>Physical Metal Card</span>
          </div>
          <div className="nfc-flow-step">
            <span className="arrow">&rarr;</span>
            <span>Tap on an NFC-compatible phone</span>
          </div>
          <div className="nfc-flow-step">
            <span className="arrow">&rarr;</span>
            <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Contact profile opens</span>
          </div>
        </div>
      </div>

      {/* Track 2: Digital Profile Link */}
      <div className="nfc-track-card">
        <div className="nfc-track-header">
          <div className="nfc-track-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <h4 className="nfc-track-title">Digital Profile Link</h4>
          </div>
        </div>
        <div className="nfc-flow-steps">
          <div className="nfc-flow-step">
            <span>Digital Card Link or QR</span>
          </div>
          <div className="nfc-flow-step">
            <span className="arrow">&rarr;</span>
            <span>Open profile on any browser</span>
          </div>
          <div className="nfc-flow-step">
            <span className="arrow">&rarr;</span>
            <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Save or share contact</span>
          </div>
        </div>
      </div>
    </div>
  );
}
