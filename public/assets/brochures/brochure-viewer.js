(function() {
  'use strict';

  const PDF_URL = '/assets/brochures/raftcon-construction-brochure.pdf';
  const TOTAL_EXPECTED_PAGES = 18;

  // DOM Elements
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingStatusText = document.getElementById('loadingStatusText');
  const progressBarFill = document.getElementById('progressBarFill');
  const pagesContainer = document.getElementById('pagesContainer');
  const btnPrevPage = document.getElementById('btnPrevPage');
  const btnNextPage = document.getElementById('btnNextPage');
  const pageNumberInput = document.getElementById('pageNumberInput');
  const totalPagesText = document.getElementById('totalPagesText');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomFit = document.getElementById('btnZoomFit');
  const zoomLevelText = document.getElementById('zoomLevelText');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnScrollTop = document.getElementById('btnScrollTop');

  // Viewer State
  let pdfDoc = null;
  let totalPages = TOTAL_EXPECTED_PAGES;
  let currentVisiblePage = 1;
  let scrollDirection = 'down'; // 'down' or 'up'
  let lastScrollY = 0;
  let currentScaleMultiplier = 1.0; // 1.0 = Fit Width
  let isFitWidth = true;
  let baseAspectRatio = 842 / 595; // Default A4 ratio ~1.415126

  // Controlled Serial Render Pipeline
  let activeRenderingPage = null; // page number currently rendering
  let activeRenderTask = null; // in-flight PDF.js render task
  let activeRenderPromise = null; // Promise for in-flight render task
  let isQueueRunning = false;
  let queueScheduled = false;

  // Memory budget: maximum concurrently active rendered canvases
  const MAX_ACTIVE_CANVASES = 6;

  // Intersection Observer & page visibility tracking
  const pageIntersections = {}; // pageNum -> intersectionRatio
  let pageObserver = null;

  // Strict Defensive Cleanup: purge any download link, button, or anchor anywhere in DOM
  function purgeAnyDownloadControls() {
    const strayLinks = document.querySelectorAll('a[download], .btn-download-pdf, a[href$=".pdf"]');
    strayLinks.forEach((el) => {
      try { el.remove(); } catch (_) {}
    });
  }

  // Configure Local Worker
  if (typeof window.pdfjsLib !== 'undefined') {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdfjs/pdf.worker.min.js';
  } else {
    console.error('PDF.js library failed to load.');
  }

  function getContainerTargetWidth() {
    const padding = window.innerWidth <= 768 ? 16 : 48;
    const available = Math.min(window.innerWidth - padding, 1000);
    return Math.max(available, 280);
  }

  function calculateTargetScale(pageWidth) {
    const targetWidth = getContainerTargetWidth();
    const baseScale = targetWidth / pageWidth;
    return isFitWidth ? baseScale : (baseScale * currentScaleMultiplier);
  }

  function getOptimalDpr() {
    const rawDpr = window.devicePixelRatio || 1;
    // On desktop, cap at 1.5 DPR to prevent 12M+ pixel canvas texture bloat.
    // On mobile (narrow screen width <= 768), container is small so 2.0 DPR yields crisp vector text with small texture memory.
    const maxDpr = window.innerWidth <= 768 ? 2.0 : 1.5;
    return Math.min(rawDpr, maxDpr);
  }

  // Initialize PDF Document
  async function initPdf() {
    purgeAnyDownloadControls();

    if (!window.pdfjsLib) {
      if (loadingStatusText) loadingStatusText.textContent = 'Unable to initialize PDF engine.';
      return;
    }

    try {
      const loadingTask = window.pdfjsLib.getDocument({
        url: PDF_URL,
        rangeChunkSize: 65536,
        disableAutoFetch: false,
        disableStream: false
      });

      loadingTask.onProgress = function(progress) {
        if (progress.total > 0 && progressBarFill && loadingStatusText) {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          progressBarFill.style.width = pct + '%';
          loadingStatusText.textContent = 'Loading Raftcon Brochure (' + pct + '%)...';
        }
      };

      pdfDoc = await loadingTask.promise;
      totalPages = pdfDoc.numPages || TOTAL_EXPECTED_PAGES;
      if (totalPagesText) totalPagesText.textContent = totalPages;
      if (pageNumberInput) pageNumberInput.max = totalPages;

      // Inspect Page 1 viewport dimensions
      const firstPage = await pdfDoc.getPage(1);
      const firstViewport = firstPage.getViewport({ scale: 1.0 });
      baseAspectRatio = firstViewport.height / firstViewport.width;

      // Create lightweight, pre-dimensioned DOM placeholders for all 18 pages
      createPagePlaceholders(baseAspectRatio);

      // Setup Intersection Observer for smooth, non-blocking visibility tracking
      setupIntersectionObserver();

      // Dismiss initial loading overlay smoothly
      setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
      }, 100);

      // Immediately render Page 1 (highest priority) and prime adjacent pages
      currentVisiblePage = 1;
      updateNavButtons();
      scheduleRenderQueue();

    } catch (err) {
      console.error('PDF Load Error:', err);
      if (loadingStatusText) {
        loadingStatusText.textContent = 'Failed to load brochure. Please refresh the page.';
      }
    }
  }

  function createPagePlaceholders(defaultRatio) {
    if (!pagesContainer) return;
    pagesContainer.innerHTML = '';
    const targetWidth = getContainerTargetWidth() * (isFitWidth ? 1.0 : currentScaleMultiplier);

    for (let i = 1; i <= totalPages; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'pdf-page-wrapper';
      wrapper.id = 'pageWrapper-' + i;
      wrapper.setAttribute('data-page', String(i));

      const height = Math.round(targetWidth * defaultRatio);
      wrapper.style.width = Math.round(targetWidth) + 'px';
      wrapper.style.height = height + 'px';

      wrapper.innerHTML = `
        <div class="page-placeholder" id="placeholder-${i}">
          <div class="spinner-ring" style="width: 24px; height: 24px; border-width: 2px;"></div>
          <span style="font-size: 11px; opacity: 0.6; letter-spacing: 0.04em;">Page ${i}</span>
        </div>
      `;

      pagesContainer.appendChild(wrapper);
    }
  }

  // IntersectionObserver tracks page visibility without main-thread scroll lag or layout thrashing
  function setupIntersectionObserver() {
    if (pageObserver) {
      pageObserver.disconnect();
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px 0px 0px',
      threshold: [0, 0.15, 0.35, 0.55, 0.75, 0.95]
    };

    pageObserver = new IntersectionObserver((entries) => {
      let maxRatio = -1;
      let mostVisible = currentVisiblePage;

      entries.forEach((entry) => {
        const pageNum = parseInt(entry.target.getAttribute('data-page'), 10);
        pageIntersections[pageNum] = entry.intersectionRatio;
      });

      // Find page with greatest visible ratio
      for (let p = 1; p <= totalPages; p++) {
        const ratio = pageIntersections[p] || 0;
        if (ratio > maxRatio) {
          maxRatio = ratio;
          mostVisible = p;
        }
      }

      if (mostVisible !== currentVisiblePage && maxRatio > 0.05) {
        currentVisiblePage = mostVisible;
        if (pageNumberInput) pageNumberInput.value = currentVisiblePage;
        updateNavButtons();
        scheduleRenderQueue();
      }
    }, observerOptions);

    for (let p = 1; p <= totalPages; p++) {
      const el = document.getElementById('pageWrapper-' + p);
      if (el) pageObserver.observe(el);
    }
  }

  // Schedules render queue execution via requestAnimationFrame
  function scheduleRenderQueue() {
    if (queueScheduled) return;
    queueScheduled = true;
    requestAnimationFrame(() => {
      queueScheduled = false;
      processRenderQueue();
    });
  }

  // Direction-Aware, Proximity-Prioritized Serial Render Pipeline
  async function processRenderQueue() {
    if (!pdfDoc || isQueueRunning) return;
    isQueueRunning = true;

    try {
      // 1. Check if an active render task is ongoing
      if (activeRenderingPage !== null) {
        const distance = Math.abs(activeRenderingPage - currentVisiblePage);

        // If the user scrolled far away and current task is no longer adjacent, cancel it immediately!
        if (distance > 1 && activeRenderTask) {
          try {
            activeRenderTask.cancel();
          } catch (_) {}

          // Wait for cancellation promise to reject cleanly before launching new task
          if (activeRenderPromise) {
            try { await activeRenderPromise; } catch (_) {}
          }

          activeRenderTask = null;
          activeRenderPromise = null;
          activeRenderingPage = null;
        } else {
          // In-flight task is still high priority, let it continue
          return;
        }
      }

      // 2. Build priority list based on current visible page and scroll direction
      // Priority 1: Current visible page
      // Priority 2: Next page in scroll direction
      // Priority 3: Page immediately behind in scroll direction
      const priorityList = [currentVisiblePage];

      if (scrollDirection === 'down') {
        if (currentVisiblePage + 1 <= totalPages) priorityList.push(currentVisiblePage + 1);
        if (currentVisiblePage - 1 >= 1) priorityList.push(currentVisiblePage - 1);
      } else {
        if (currentVisiblePage - 1 >= 1) priorityList.push(currentVisiblePage - 1);
        if (currentVisiblePage + 1 <= totalPages) priorityList.push(currentVisiblePage + 1);
      }

      // 3. Find first priority page that requires rendering
      let nextToRender = null;
      for (const p of priorityList) {
        if (!isPageRenderedAtCurrentScale(p)) {
          nextToRender = p;
          break;
        }
      }

      // If all near pages are already rendered at current scale, prune distant canvases and exit
      if (nextToRender === null) {
        pruneDistantCanvases();
        return;
      }

      // 4. Render the single priority page
      await renderSinglePage(nextToRender);

      // 5. Schedule next iteration to keep 1 adjacent page primed
      scheduleRenderQueue();

    } finally {
      isQueueRunning = false;
    }
  }

  function isPageRenderedAtCurrentScale(pageNum) {
    const wrapper = document.getElementById('pageWrapper-' + pageNum);
    if (!wrapper) return true;
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return false;

    const renderedScale = parseFloat(wrapper.getAttribute('data-rendered-scale') || '0');
    const renderedDpr = parseFloat(wrapper.getAttribute('data-rendered-dpr') || '0');
    const currentDpr = getOptimalDpr();
    const targetScale = calculateTargetScale(595); // Standard A4 base width

    return Math.abs(renderedScale - targetScale) < 0.02 && Math.abs(renderedDpr - currentDpr) < 0.02;
  }

  // Renders a single page onto its canvas at native crisp resolution
  async function renderSinglePage(pageNum) {
    if (!pdfDoc) return;
    const wrapper = document.getElementById('pageWrapper-' + pageNum);
    if (!wrapper) return;

    activeRenderingPage = pageNum;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const defaultViewport = page.getViewport({ scale: 1.0 });
      const scale = calculateTargetScale(defaultViewport.width);
      const dpr = getOptimalDpr();
      const viewport = page.getViewport({ scale: scale });

      // Synchronize container dimensions
      const targetW = Math.floor(viewport.width);
      const targetH = Math.floor(viewport.height);
      wrapper.style.width = targetW + 'px';
      wrapper.style.height = targetH + 'px';

      // Create or reuse canvas
      let canvas = wrapper.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        wrapper.appendChild(canvas);
      }

      const canvasWidth = Math.floor(viewport.width * dpr);
      const canvasHeight = Math.floor(viewport.height * dpr);

      // Re-allocate canvas pixel buffer only if dimensions changed
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }
      canvas.style.width = targetW + 'px';
      canvas.style.height = targetH + 'px';

      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
      };

      const task = page.render(renderContext);
      activeRenderTask = task;
      activeRenderPromise = task.promise;

      await activeRenderPromise;

      // Mark wrapper with rendered metadata
      wrapper.setAttribute('data-rendered-scale', String(scale));
      wrapper.setAttribute('data-rendered-dpr', String(dpr));

      // Hide placeholder smoothly
      const placeholder = document.getElementById('placeholder-' + pageNum);
      if (placeholder) placeholder.style.display = 'none';

    } catch (err) {
      if (err && err.name === 'RenderingCancelledException') {
        // Clean cancellation on fast scroll
      } else {
        console.warn('Render warning for page ' + pageNum + ':', err);
      }
    } finally {
      if (activeRenderingPage === pageNum) {
        activeRenderingPage = null;
        activeRenderTask = null;
        activeRenderPromise = null;
      }
    }
  }

  // Memory Management: unmounts canvases for pages far outside viewport to cap GPU memory
  function pruneDistantCanvases() {
    const renderedWrappers = document.querySelectorAll('.pdf-page-wrapper[data-rendered-scale]');
    if (renderedWrappers.length <= MAX_ACTIVE_CANVASES) return;

    renderedWrappers.forEach((wrapper) => {
      const p = parseInt(wrapper.getAttribute('data-page'), 10);
      const distance = Math.abs(p - currentVisiblePage);
      if (distance > 2) {
        const canvas = wrapper.querySelector('canvas');
        if (canvas) canvas.remove();
        wrapper.removeAttribute('data-rendered-scale');
        wrapper.removeAttribute('data-rendered-dpr');
        const placeholder = document.getElementById('placeholder-' + p);
        if (placeholder) placeholder.style.display = 'flex';
      }
    });
  }

  // Lightweight, decoupled scroll listener
  let scrollTicking = false;
  function handleScroll() {
    const currentScrollY = window.scrollY;
    scrollDirection = currentScrollY >= lastScrollY ? 'down' : 'up';
    lastScrollY = currentScrollY;

    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(() => {
      scrollTicking = false;

      // Toggle back to top button
      if (btnScrollTop) {
        if (currentScrollY > 400) {
          btnScrollTop.classList.add('visible');
        } else {
          btnScrollTop.classList.remove('visible');
        }
      }
    });
  }

  function updateNavButtons() {
    if (btnPrevPage) btnPrevPage.disabled = currentVisiblePage <= 1;
    if (btnNextPage) btnNextPage.disabled = currentVisiblePage >= totalPages;
  }

  function scrollToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    const target = document.getElementById('pageWrapper-' + pageNum);
    if (target) {
      const navOffset = 64;
      const targetOffset = target.offsetTop;
      const scrollTarget = Math.max(0, targetOffset - navOffset);

      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
      });
    }
  }

  // Smooth Zoom Handler: resizes container dimensions via CSS without blank-screen flash
  function handleZoomChange() {
    // Invalidate rendered scale attribute so pipeline knows pages need crisp re-render at new zoom
    document.querySelectorAll('.pdf-page-wrapper').forEach((w) => {
      w.removeAttribute('data-rendered-scale');
    });

    // Cancel in-flight render task if active
    if (activeRenderTask) {
      try { activeRenderTask.cancel(); } catch(_) {}
      activeRenderTask = null;
      activeRenderPromise = null;
      activeRenderingPage = null;
    }

    const targetWidth = getContainerTargetWidth() * (isFitWidth ? 1.0 : currentScaleMultiplier);

    // Resize page wrappers cleanly: existing canvas elements scale visually via CSS
    document.querySelectorAll('.pdf-page-wrapper').forEach((wrapper) => {
      const height = Math.round(targetWidth * baseAspectRatio);
      wrapper.style.width = Math.round(targetWidth) + 'px';
      wrapper.style.height = height + 'px';
    });

    // Trigger high-priority render of visible page at new scale
    scheduleRenderQueue();
  }

  // Event Listeners
  if (btnPrevPage) {
    btnPrevPage.addEventListener('click', () => {
      if (currentVisiblePage > 1) scrollToPage(currentVisiblePage - 1);
    });
  }

  if (btnNextPage) {
    btnNextPage.addEventListener('click', () => {
      if (currentVisiblePage < totalPages) scrollToPage(currentVisiblePage + 1);
    });
  }

  if (pageNumberInput) {
    pageNumberInput.addEventListener('change', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > totalPages) val = totalPages;
      scrollToPage(val);
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      isFitWidth = false;
      currentScaleMultiplier = Math.min(currentScaleMultiplier + 0.2, 2.2);
      if (zoomLevelText) zoomLevelText.textContent = Math.round(currentScaleMultiplier * 100) + '%';
      handleZoomChange();
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      isFitWidth = false;
      currentScaleMultiplier = Math.max(currentScaleMultiplier - 0.2, 0.6);
      if (zoomLevelText) zoomLevelText.textContent = Math.round(currentScaleMultiplier * 100) + '%';
      handleZoomChange();
    });
  }

  if (btnZoomFit) {
    btnZoomFit.addEventListener('click', () => {
      isFitWidth = true;
      currentScaleMultiplier = 1.0;
      if (zoomLevelText) zoomLevelText.textContent = 'Fit';
      handleZoomChange();
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  let resizeDebounce = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      if (isFitWidth) {
        handleZoomChange();
      }
    }, 120);
  });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentVisiblePage < totalPages) scrollToPage(currentVisiblePage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentVisiblePage > 1) scrollToPage(currentVisiblePage - 1);
    } else if (e.key === 'Home') {
      scrollToPage(1);
    } else if (e.key === 'End') {
      scrollToPage(totalPages);
    }
  });

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPdf);
  } else {
    initPdf();
  }
})();
