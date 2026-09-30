import React from 'react';

export default function MetaAdsVisual() {
  return (
    <div className="meta-ads-visual-container">
      <div className="ads-dashboard-card">
        {/* Dashboard Header Bar */}
        <div className="ads-card-header">
          <div className="ads-platform-tag">
            <span className="live-indicator-dot" />
            <span className="ads-platform-name">Meta Ads Manager &bull; Active Campaign</span>
          </div>
          <div className="ads-timeframe-pill">
            <span>Last 30 Days</span>
            <span className="ads-badge-accent">Surat &bull; Local Scale</span>
          </div>
        </div>

        {/* 4 Core Performance KPI Cards */}
        <div className="ads-kpis-grid">
          <div className="kpi-mini-card">
            <span className="kpi-label">Return on Ad Spend</span>
            <div className="kpi-value-row">
              <span className="kpi-number">4.82x</span>
              <span className="kpi-pill kpi-positive">+34% vs avg</span>
            </div>
            <span className="kpi-sub">Targeted local high-intent audience</span>
          </div>

          <div className="kpi-mini-card highlight-card">
            <span className="kpi-label">WhatsApp Inquiries</span>
            <div className="kpi-value-row">
              <span className="kpi-number">248</span>
              <span className="kpi-pill kpi-positive">Direct Chats</span>
            </div>
            <span className="kpi-sub">Verified inquiries straight to phone</span>
          </div>

          <div className="kpi-mini-card">
            <span className="kpi-label">Cost per Lead</span>
            <div className="kpi-value-row">
              <span className="kpi-number">₹118</span>
              <span className="kpi-pill kpi-positive">-42% cost</span>
            </div>
            <span className="kpi-sub">Laser-targeted demographic spend</span>
          </div>

          <div className="kpi-mini-card">
            <span className="kpi-label">Conversion Rate</span>
            <div className="kpi-value-row">
              <span className="kpi-number">8.6%</span>
              <span className="kpi-pill kpi-positive">Top 5%</span>
            </div>
            <span className="kpi-sub">Click-to-chat funnel architecture</span>
          </div>
        </div>

        {/* Rising Performance Graph (SVG Area / Line Chart) */}
        <div className="ads-chart-section">
          <div className="chart-header-row">
            <div>
              <h5 className="chart-title">Inquiry Growth &amp; Campaign Velocity</h5>
              <p className="chart-subtitle">Continuous A/B optimization driving weekly lead volume</p>
            </div>
            <div className="chart-legend">
              <span className="legend-dot dot-leads" />
              <span>Inquiries / Day</span>
            </div>
          </div>

          <div className="chart-canvas-wrapper">
            <svg
              className="ads-growth-svg"
              viewBox="0 0 540 180"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="chartEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C49F" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#00C49F" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#D7AA4A" />
                  <stop offset="50%" stopColor="#00C49F" />
                  <stop offset="100%" stopColor="#00E6BC" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="35" x2="540" y2="35" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="540" y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="125" x2="540" y2="125" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />

              {/* Gradient Area under curve */}
              <path
                d="M 10 148 Q 90 142 160 115 T 320 72 T 450 36 L 530 22 L 530 160 L 10 160 Z"
                fill="url(#chartEmeraldGrad)"
              />

              {/* Rising Trend Line */}
              <path
                d="M 10 148 Q 90 142 160 115 T 320 72 T 450 36 L 530 22"
                stroke="url(#chartStrokeGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points along curve */}
              <circle cx="10" cy="148" r="4" fill="#073D2E" stroke="#D7AA4A" strokeWidth="2" />
              <circle cx="160" cy="115" r="4" fill="#073D2E" stroke="#00C49F" strokeWidth="2" />
              <circle cx="320" cy="72" r="4" fill="#073D2E" stroke="#00C49F" strokeWidth="2" />
              <circle cx="450" cy="36" r="4" fill="#073D2E" stroke="#00C49F" strokeWidth="2" />
              <circle cx="530" cy="22" r="5" fill="#00C49F" stroke="#FFFFFF" strokeWidth="2" />

              {/* Tooltip at peak */}
              <g transform="translate(380, 4)">
                <rect x="0" y="0" width="145" height="26" rx="6" fill="#06281E" stroke="rgba(0, 196, 159, 0.5)" strokeWidth="1" />
                <text x="8" y="17" fill="#FFFFFF" fontSize="10.5" fontFamily="var(--font-heading)" fontWeight="600">
                  Peak: 18 inquiries / day
                </text>
              </g>
            </svg>

            {/* X-Axis labels */}
            <div className="chart-x-labels">
              <span>Week 1 (Launch)</span>
              <span>Week 2 (A/B Test)</span>
              <span>Week 3 (Optimize)</span>
              <span className="accent-label">Week 4 (Scale &bull; +280%)</span>
            </div>
          </div>
        </div>

        {/* Campaign Placement Footnote */}
        <div className="ads-footer-metrics">
          <div className="ads-channel-tag">
            <span className="channel-bullet" />
            <span>Instagram Stories &amp; Reels (68%)</span>
          </div>
          <div className="ads-channel-tag">
            <span className="channel-bullet fb-bullet" />
            <span>Facebook Feed &amp; Direct WhatsApp (32%)</span>
          </div>
          <div className="ads-channel-tag location-tag">
            <span>Targeting: Surat &amp; South Gujarat Affluent Sectors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
