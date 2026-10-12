function renderUnavailableHtml(title = "Brochure Unavailable", message = "No brochure is available for this profile."): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title} | Ambros Studio</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d1117;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      text-align: center;
    }
    .error-card {
      max-width: 440px;
      width: 100%;
      background: #161b22;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 44px 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn-home {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #21262d;
      color: #f8fafc;
      text-decoration: none;
      padding: 12px 22px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s ease;
    }
    .btn-home:hover {
      background: #30363d;
      color: #f3d0a2;
    }
  </style>
</head>
<body>
  <div class="error-card">
    <div class="icon-wrap">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/c/raftcon" class="btn-home">
      &larr; Back to Raftcon Profile
    </a>
  </div>
</body>
</html>`;
}

function renderRaftconBrochureHtml(cacheBuster: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Raftcon Construction — Official Company Brochure (18 Pages) | Ambros Studio</title>
  <meta name="description" content="View the complete 18-page Raftcon Construction corporate portfolio and engineering brochure directly in your browser without automatic download.">
  <meta name="theme-color" content="#121214">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/brochures/brochure-viewer.css?v=${cacheBuster}">
  <script src="/assets/vendor/pdfjs/pdf.min.js"></script>
</head>
<body>

  <!-- Top Sticky Navigation Bar (Strictly No Download Button) -->
  <header class="viewer-navbar" role="banner">
    <div class="nav-left">
      <a href="/c/raftcon" class="btn-back" title="Return to Raftcon Digital Business Card">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back to Profile</span>
      </a>

      <div class="brand-meta" aria-hidden="true">
        <div class="brand-logo-r">R</div>
        <div>
          <div class="brand-text">Raftcon Construction</div>
          <div class="brand-sub">Official Corporate Brochure</div>
        </div>
      </div>
    </div>

    <!-- Center Page Controls -->
    <div class="nav-center" role="navigation" aria-label="Page navigation">
      <button type="button" class="nav-btn-icon" id="btnPrevPage" aria-label="Previous Page" title="Previous Page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="page-counter">
        <span>Page</span>
        <input type="number" id="pageNumberInput" class="page-input" value="1" min="1" max="18" aria-label="Go to page number">
        <span>/ <strong id="totalPagesText">18</strong></span>
      </div>

      <button type="button" class="nav-btn-icon" id="btnNextPage" aria-label="Next Page" title="Next Page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Right Actions & Zoom Controls (Download Control Completely Omitted) -->
    <div class="nav-right">
      <div class="zoom-group">
        <button type="button" class="nav-btn-icon" id="btnZoomOut" aria-label="Zoom Out" title="Zoom Out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <span class="zoom-level-text" id="zoomLevelText">Fit</span>
        <button type="button" class="nav-btn-icon" id="btnZoomIn" aria-label="Zoom In" title="Zoom In">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button type="button" class="nav-btn-icon" id="btnZoomFit" aria-label="Fit to width" title="Fit to width">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>

      <button type="button" class="nav-btn-icon" id="btnFullscreen" aria-label="Toggle Fullscreen" title="Toggle Fullscreen">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
      </button>
    </div>
  </header>

  <!-- Initial Document Loading Overlay -->
  <div class="loading-overlay" id="loadingOverlay">
    <div class="spinner-ring" aria-hidden="true"></div>
    <div class="loading-text" id="loadingStatusText">Loading Raftcon Brochure...</div>
    <div class="loading-sub">Preparing 18 high-resolution pages for smooth browsing</div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" id="progressBarFill"></div>
    </div>
  </div>

  <!-- Main Continuous PDF Page Feed -->
  <main class="viewer-main" id="viewerMain">
    <div id="pagesContainer"></div>
  </main>

  <!-- Quick Floating Back to Top -->
  <button type="button" class="btn-scroll-top" id="btnScrollTop" aria-label="Scroll back to top">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  </button>

  <script src="/assets/brochures/brochure-viewer.js?v=${cacheBuster}"></script>
</body>
</html>`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sanitizedSlug = typeof slug === "string" ? slug.trim().toLowerCase().slice(0, 100) : "";

    // If requesting the Raftcon brochure
    if (sanitizedSlug === "raftcon" || sanitizedSlug === "raftcon-construction") {
      const now = Date.now();
      const html = renderRaftconBrochureHtml(now);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // Strictly prevent stale browser caching so users always receive fresh HTML/JS
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    // Fallback for non-existent brochures
    return new Response(
      renderUnavailableHtml("Brochure Not Found", `No public brochure is registered for profile slug "${sanitizedSlug}".`),
      {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /c/[slug]/brochure error:", err?.message);
    return new Response(
      renderUnavailableHtml("Server Error", "An error occurred while loading this brochure."),
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }
}
