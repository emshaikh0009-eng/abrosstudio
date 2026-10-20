/**
 * Ambros Studio — Universal Design-Specific Dynamic Editor & Live Preview Engine
 * 
 * Provides:
 * 1. Universal Drag-and-Drop Uploader for Images & Documents (PDF, JPG, PNG, WEBP)
 * 2. Dynamic Section & Field Renderer tailored to every selected card design
 * 3. Real-Time Interactive Live Card Preview (Desktop & Mobile viewports)
 * 4. Two-Way Data Binding for Customer Persistence
 */

(function(global) {
  'use strict';

  // HTML & Attribute Escaping Helpers
  var escapeHtml = (global && typeof global.escapeHtml === 'function')
    ? global.escapeHtml
    : (global && global.CARD_RENDERER && typeof global.CARD_RENDERER.escapeHtml === 'function')
      ? global.CARD_RENDERER.escapeHtml
      : function(str) {
          if (str === null || str === undefined) return '';
          return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };

  var escapeAttr = (global && typeof global.escapeAttr === 'function')
    ? global.escapeAttr
    : function(str) {
        if (str === null || str === undefined) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      };

  if (global && typeof global.escapeHtml !== 'function') {
    global.escapeHtml = escapeHtml;
  }
  if (global && typeof global.escapeAttr !== 'function') {
    global.escapeAttr = escapeAttr;
  }

  // State
  var currentActiveDesignId = null;
  var currentFormCustomerData = null;
  var activeIndustryData = {};
  var previewDebounceTimer = null;
  var isMobilePreview = true;

  // =========================================================================
  // 1. UNIVERSAL DRAG-AND-DROP UPLOADER
  // =========================================================================

  /**
   * Upload a file to /api/admin/media with real-time progress
   */
  function uploadMediaFile(file, kind, options) {
    options = options || {};
    var onProgress = options.onProgress || function() {};
    var onSuccess = options.onSuccess || function() {};
    var onError = options.onError || function() {};

    var isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    var maxBytes = isPdf ? (25 * 1024 * 1024) : (10 * 1024 * 1024);

    if (file.size > maxBytes) {
      var limitMb = Math.round(maxBytes / (1024 * 1024));
      onError(new Error('File exceeds the maximum ' + limitMb + 'MB limit.'));
      return;
    }

    var formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind || (isPdf ? 'document' : 'image'));

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/media', true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var res = JSON.parse(xhr.responseText);
          if (res && res.url) {
            onSuccess(res.url, file.name);
          } else {
            onError(new Error(res.error || 'Upload succeeded but no URL was returned.'));
          }
        } catch (err) {
          onError(new Error('Invalid server response during upload.'));
        }
      } else {
        try {
          var errJson = JSON.parse(xhr.responseText);
          onError(new Error(errJson.error || 'Server returned status ' + xhr.status));
        } catch (_) {
          onError(new Error('Upload failed with server status ' + xhr.status));
        }
      }
    };

    xhr.onerror = function() {
      onError(new Error('Network error occurred while uploading.'));
    };

    xhr.send(formData);
  }

  /**
   * Render a Drag & Drop zone element
   */
  function createDropzone(fieldConfig, initialValue, onValueChange) {
    var container = document.createElement('div');
    container.className = 'dropzone-wrapper';
    container.setAttribute('data-field-key', fieldConfig.key);

    var fileKind = fieldConfig.fileKind || 'image';
    var isDoc = fileKind === 'document' || fileKind === 'menu' || fileKind === 'brochure';
    var accept = fieldConfig.accept || (isDoc ? '.pdf,image/*' : 'image/*');
    var currentValue = initialValue || '';

    container.innerHTML = `
      <div class="dropzone-box ${currentValue ? 'has-file' : ''}" id="dz_${fieldConfig.key}">
        <input type="file" class="dropzone-file-input" accept="${accept}" style="display: none;">
        <input type="hidden" class="dropzone-hidden-value" name="${fieldConfig.key}" value="${escapeAttr(currentValue)}">
        
        <!-- Empty State -->
        <div class="dropzone-empty" style="${currentValue ? 'display: none;' : ''}">
          <div class="dropzone-icon" aria-hidden="true">
            ${isDoc ? `
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            ` : `
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            `}
          </div>
          <div class="dropzone-text">
            <span class="dropzone-prompt">Drag &amp; drop file here, or <button type="button" class="dropzone-browse-btn">Browse</button></span>
            <span class="dropzone-hint">${escapeHtml(fieldConfig.help || (isDoc ? 'Supports PDF, PNG, JPG (Max 25MB)' : 'Supports PNG, JPG, WEBP (Max 10MB)'))}</span>
          </div>
        </div>

        <!-- Upload Progress State -->
        <div class="dropzone-progress-wrap" style="display: none;">
          <div class="dropzone-spinner"></div>
          <div class="dropzone-progress-label">Uploading file (0%)...</div>
          <div class="dropzone-progress-bar">
            <div class="dropzone-progress-fill" style="width: 0%;"></div>
          </div>
        </div>

        <!-- Uploaded File Preview State -->
        <div class="dropzone-preview" style="${currentValue ? '' : 'display: none;'}">
          <div class="dropzone-preview-main">
            <div class="dropzone-thumb-box" id="thumb_${fieldConfig.key}">
              <!-- Thumbnail or PDF Icon -->
            </div>
            <div class="dropzone-meta">
              <span class="dropzone-filename" title="${escapeAttr(currentValue)}">${formatFileDisplayName(currentValue)}</span>
              <span class="dropzone-file-status">✓ File Ready &amp; Connected</span>
            </div>
          </div>
          <div class="dropzone-actions">
            ${isDoc && currentValue ? `
              <a href="${escapeAttr(currentValue)}" target="_blank" rel="noopener noreferrer" class="btn btn-white btn-xs" title="Open file in new tab">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline></svg>
                <span>View</span>
              </a>
            ` : ''}
            <button type="button" class="btn btn-white btn-xs dropzone-btn-replace" title="Replace with another file">
              <span>Replace</span>
            </button>
            <button type="button" class="btn btn-white btn-xs dropzone-btn-remove" title="Remove this file" style="color: #ef4444;">
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Elements
    var dzBox = container.querySelector('.dropzone-box');
    var fileInput = container.querySelector('.dropzone-file-input');
    var hiddenVal = container.querySelector('.dropzone-hidden-value');
    var emptyWrap = container.querySelector('.dropzone-empty');
    var progressWrap = container.querySelector('.dropzone-progress-wrap');
    var progressLabel = container.querySelector('.dropzone-progress-label');
    var progressFill = container.querySelector('.dropzone-progress-fill');
    var previewWrap = container.querySelector('.dropzone-preview');
    var thumbBox = container.querySelector('.dropzone-thumb-box');
    var filenameEl = container.querySelector('.dropzone-filename');
    var browseBtn = container.querySelector('.dropzone-browse-btn');
    var replaceBtn = container.querySelector('.dropzone-btn-replace');
    var removeBtn = container.querySelector('.dropzone-btn-remove');

    function updatePreviewDisplay(url) {
      if (!url) {
        emptyWrap.style.display = 'flex';
        progressWrap.style.display = 'none';
        previewWrap.style.display = 'none';
        dzBox.classList.remove('has-file');
        thumbBox.innerHTML = '';
        return;
      }

      emptyWrap.style.display = 'none';
      progressWrap.style.display = 'none';
      previewWrap.style.display = 'flex';
      dzBox.classList.add('has-file');
      filenameEl.textContent = formatFileDisplayName(url);
      filenameEl.title = url;

      var isPdfFile = url.toLowerCase().includes('.pdf');
      if (isPdfFile) {
        thumbBox.innerHTML = `
          <div class="pdf-badge-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span style="font-size: 8.5px; font-weight: 800; color: #ef4444; margin-top: 2px;">PDF</span>
          </div>
        `;
      } else {
        thumbBox.innerHTML = `<img src="${escapeAttr(url)}" alt="Thumbnail" class="dropzone-thumb-img" onerror="this.style.display='none';">`;
      }
    }

    if (currentValue) {
      updatePreviewDisplay(currentValue);
    }

    // Trigger file dialog
    function openFileDialog(e) {
      if (e) e.stopPropagation();
      fileInput.click();
    }

    if (browseBtn) browseBtn.addEventListener('click', openFileDialog);
    if (replaceBtn) replaceBtn.addEventListener('click', openFileDialog);
    emptyWrap.addEventListener('click', openFileDialog);

    // Remove file
    if (removeBtn) {
      removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hiddenVal.value = '';
        updatePreviewDisplay('');
        if (typeof onValueChange === 'function') onValueChange('');
        if (typeof global.showAdminToast === 'function') global.showAdminToast('File removed.');
      });
    }

    // Handle File Pick / Drop
    function handleSelectedFile(file) {
      if (!file) return;

      emptyWrap.style.display = 'none';
      previewWrap.style.display = 'none';
      progressWrap.style.display = 'flex';
      progressFill.style.width = '0%';
      progressLabel.textContent = 'Uploading ' + file.name + ' (0%)...';

      uploadMediaFile(file, fileKind, {
        onProgress: function(pct) {
          progressFill.style.width = pct + '%';
          progressLabel.textContent = 'Uploading ' + file.name + ' (' + pct + '%)...';
        },
        onSuccess: function(uploadedUrl) {
          hiddenVal.value = uploadedUrl;
          updatePreviewDisplay(uploadedUrl);
          if (typeof onValueChange === 'function') onValueChange(uploadedUrl);
          if (typeof global.showAdminToast === 'function') global.showAdminToast('File uploaded successfully!');
        },
        onError: function(err) {
          updatePreviewDisplay(hiddenVal.value);
          if (typeof global.showAdminToast === 'function') {
            global.showAdminToast('Upload failed: ' + (err.message || 'Error'));
          } else {
            alert('Upload failed: ' + (err.message || 'Error'));
          }
        }
      });
    }

    fileInput.addEventListener('change', function() {
      if (fileInput.files && fileInput.files[0]) {
        handleSelectedFile(fileInput.files[0]);
      }
    });

    // Drag and Drop Listeners
    dzBox.addEventListener('dragenter', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dzBox.classList.add('drag-over');
    });

    dzBox.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dzBox.classList.add('drag-over');
    });

    dzBox.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dzBox.classList.remove('drag-over');
    });

    dzBox.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dzBox.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });

    return container;
  }

  function formatFileDisplayName(url) {
    if (!url) return '';
    var parts = url.split('/');
    var filename = parts.pop() || url;
    if (filename.length > 32) {
      return filename.slice(0, 18) + '...' + filename.slice(-10);
    }
    return filename;
  }

  // =========================================================================
  // 2. DYNAMIC FIELD RENDERERS (Stats, Chips, Repeatables)
  // =========================================================================

  function createStatsGrid(fieldConfig, initialValue, onValueChange) {
    var container = document.createElement('div');
    container.className = 'stats-grid-input-wrapper';

    var stats = Array.isArray(initialValue) && initialValue.length > 0 ? initialValue : (fieldConfig.default || [
      { num: '33+', label: 'Projects' },
      { num: '07', label: 'Cities' },
      { num: '96%', label: 'Retention' }
    ]);

    var grid = document.createElement('div');
    grid.className = 'stats-grid-columns';
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(' + stats.length + ', 1fr); gap: 8px; margin-top: 4px;';

    stats.forEach(function(s, idx) {
      var col = document.createElement('div');
      col.className = 'stat-col-box';
      col.style.cssText = 'background: #f8fafc; border: 1px solid var(--border-light); padding: 8px; border-radius: 6px;';
      col.innerHTML = `
        <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Stat ${idx + 1} Number</label>
        <input type="text" class="form-input stat-num-input" value="${escapeAttr(s.num || s.value || '')}" placeholder="e.g. 150+" style="font-size: 12px; padding: 4px 8px; margin-bottom: 6px; font-weight: 700;">
        <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Stat ${idx + 1} Label</label>
        <input type="text" class="form-input stat-lbl-input" value="${escapeAttr(s.label || '')}" placeholder="e.g. Satisfied Clients" style="font-size: 11.5px; padding: 4px 8px;">
      `;

      var numInp = col.querySelector('.stat-num-input');
      var lblInp = col.querySelector('.stat-lbl-input');

      function notifyChange() {
        var currentStats = [];
        var allCols = grid.querySelectorAll('.stat-col-box');
        allCols.forEach(function(c) {
          var n = c.querySelector('.stat-num-input').value.trim();
          var l = c.querySelector('.stat-lbl-input').value.trim();
          currentStats.push({ num: n, value: n, label: l });
        });
        if (typeof onValueChange === 'function') onValueChange(currentStats);
      }

      numInp.addEventListener('input', notifyChange);
      lblInp.addEventListener('input', notifyChange);
      grid.appendChild(col);
    });

    container.appendChild(grid);
    return container;
  }

  function createChipsInput(fieldConfig, initialValue, onValueChange) {
    var container = document.createElement('div');
    container.className = 'chips-input-wrapper';

    var chips = Array.isArray(initialValue) ? initialValue.slice() : [];

    container.innerHTML = `
      <div style="display: flex; gap: 6px; margin-bottom: 8px;">
        <input type="text" class="form-input chip-new-input" placeholder="${escapeAttr(fieldConfig.placeholder || 'Type and press Add...')}" style="font-size: 12px; padding: 6px 10px; flex: 1;">
        <button type="button" class="btn btn-white btn-sm chip-add-btn">
          <span>+ Add</span>
        </button>
      </div>
      <div class="chips-cloud" style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 38px; padding: 8px; background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-sm);"></div>
    `;

    var inp = container.querySelector('.chip-new-input');
    var addBtn = container.querySelector('.chip-add-btn');
    var cloud = container.querySelector('.chips-cloud');

    function renderChips() {
      cloud.innerHTML = '';
      if (chips.length === 0) {
        cloud.innerHTML = '<span style="font-size: 11.5px; color: var(--text-muted); line-height: 22px;">No items added yet. Type above and click "+ Add".</span>';
        return;
      }

      chips.forEach(function(chipText, idx) {
        var chip = document.createElement('span');
        chip.className = 'interactive-tag-chip';
        chip.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; background: #ffffff; border: 1px solid var(--border-light); padding: 3px 8px; border-radius: 999px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);';
        chip.innerHTML = `
          <span>${escapeHtml(chipText)}</span>
          <button type="button" class="chip-del-btn" data-idx="${idx}" style="background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 13px; line-height: 1; padding: 0 2px;">&times;</button>
        `;

        chip.querySelector('.chip-del-btn').addEventListener('click', function(e) {
          e.stopPropagation();
          chips.splice(idx, 1);
          renderChips();
          if (typeof onValueChange === 'function') onValueChange(chips);
        });

        cloud.appendChild(chip);
      });
    }

    function addChip() {
      var val = inp.value.trim();
      if (!val) return;
      chips.push(val);
      inp.value = '';
      renderChips();
      if (typeof onValueChange === 'function') onValueChange(chips);
    }

    addBtn.addEventListener('click', addChip);
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addChip();
      }
    });

    renderChips();
    return container;
  }

  function createRepeatableList(fieldConfig, initialValue, onValueChange) {
    var container = document.createElement('div');
    container.className = 'repeatable-list-wrapper';

    var items = Array.isArray(initialValue) && initialValue.length > 0 ? initialValue.slice() : (fieldConfig.default ? fieldConfig.default.slice() : []);

    container.innerHTML = `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
        <button type="button" class="btn btn-white btn-sm btn-add-repeatable">
          <span>+ Add ${escapeHtml(fieldConfig.itemTitleKey || 'Item')}</span>
        </button>
      </div>
      <div class="repeatable-items-container" style="display: flex; flex-direction: column; gap: 8px;"></div>
    `;

    var listEl = container.querySelector('.repeatable-items-container');
    var addBtn = container.querySelector('.btn-add-repeatable');

    function notifyChange() {
      if (typeof onValueChange === 'function') onValueChange(items);
    }

    function renderItems() {
      listEl.innerHTML = '';
      if (items.length === 0) {
        listEl.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 10px; background: #f8fafc; border: 1px dashed var(--border-light); border-radius: 6px; text-align: center;">No items added yet. Click "+ Add" above.</div>';
        return;
      }

      items.forEach(function(item, idx) {
        var card = document.createElement('div');
        card.className = 'repeatable-card-item';
        card.style.cssText = 'background: #f8fafc; border: 1px solid var(--border-light); border-radius: 8px; padding: 12px; position: relative;';

        var headerRow = document.createElement('div');
        headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(0,0,0,0.06);';
        headerRow.innerHTML = `
          <span style="font-size: 11.5px; font-weight: 700; color: var(--text-headline);">#${idx + 1} ${escapeHtml(item[fieldConfig.itemTitleKey] || 'Item')}</span>
          <button type="button" class="btn btn-white btn-xs btn-remove-item" style="color: #ef4444;" title="Remove this item">
            <span>Delete</span>
          </button>
        `;

        headerRow.querySelector('.btn-remove-item').addEventListener('click', function() {
          items.splice(idx, 1);
          renderItems();
          notifyChange();
        });
        card.appendChild(headerRow);

        var fieldsGrid = document.createElement('div');
        fieldsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr; gap: 8px;';

        fieldConfig.subfields.forEach(function(sub) {
          var fieldWrap = document.createElement('div');
          fieldWrap.className = 'subfield-group';

          var val = item[sub.key] !== undefined ? item[sub.key] : (sub.default || '');

          if (sub.type === 'file_upload') {
            fieldWrap.innerHTML = `<label class="form-label" style="font-size: 11px; margin-bottom: 4px;">${escapeHtml(sub.label)}</label>`;
            var dz = createDropzone(sub, val, function(newUrl) {
              item[sub.key] = newUrl;
              notifyChange();
            });
            fieldWrap.appendChild(dz);
          } else if (sub.type === 'chips') {
            fieldWrap.innerHTML = `<label class="form-label" style="font-size: 11px; margin-bottom: 4px;">${escapeHtml(sub.label)}</label>`;
            var chipsInput = createChipsInput(sub, val, function(newChips) {
              item[sub.key] = newChips;
              notifyChange();
            });
            fieldWrap.appendChild(chipsInput);
          } else if (sub.type === 'textarea') {
            fieldWrap.innerHTML = `
              <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">${escapeHtml(sub.label)}</label>
              <textarea class="form-textarea subfield-input" placeholder="${escapeAttr(sub.placeholder || '')}" style="font-size: 11.5px; min-height: 48px; padding: 6px 8px;">${escapeHtml(val)}</textarea>
            `;
            fieldWrap.querySelector('.subfield-input').addEventListener('input', function(e) {
              item[sub.key] = e.target.value;
              notifyChange();
            });
          } else if (sub.type === 'select') {
            var optionsHtml = (sub.options || []).map(function(opt) {
              var sel = String(val) === String(opt.value) ? 'selected' : '';
              return `<option value="${escapeAttr(opt.value)}" ${sel}>${escapeHtml(opt.label)}</option>`;
            }).join('');
            fieldWrap.innerHTML = `
              <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">${escapeHtml(sub.label)}</label>
              <select class="form-input subfield-input" style="font-size: 11.5px; padding: 6px 8px;">${optionsHtml}</select>
            `;
            fieldWrap.querySelector('.subfield-input').addEventListener('change', function(e) {
              item[sub.key] = e.target.value;
              notifyChange();
            });
          } else {
            fieldWrap.innerHTML = `
              <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">${escapeHtml(sub.label)}</label>
              <input type="text" class="form-input subfield-input" value="${escapeAttr(val)}" placeholder="${escapeAttr(sub.placeholder || '')}" style="font-size: 11.5px; padding: 6px 8px;">
            `;
            fieldWrap.querySelector('.subfield-input').addEventListener('input', function(e) {
              item[sub.key] = e.target.value;
              headerRow.querySelector('span').textContent = '#' + (idx + 1) + ' ' + (item[fieldConfig.itemTitleKey] || 'Item');
              notifyChange();
            });
          }

          fieldsGrid.appendChild(fieldWrap);
        });

        card.appendChild(fieldsGrid);
        listEl.appendChild(card);
      });
    }

    addBtn.addEventListener('click', function() {
      var newItem = {};
      fieldConfig.subfields.forEach(function(sub) {
        newItem[sub.key] = sub.default || '';
      });
      items.push(newItem);
      renderItems();
      notifyChange();
    });

    renderItems();
    return container;
  }

  function createKeyValueList(fieldConfig, initialValue, onValueChange) {
    var container = document.createElement('div');
    container.className = 'keyvalue-list-wrapper';

    var list = Array.isArray(initialValue) && initialValue.length > 0 ? initialValue.slice() : (fieldConfig.default ? fieldConfig.default.slice() : [
      { days: 'Monday – Friday', time: '9:00 AM – 7:00 PM' }
    ]);

    container.innerHTML = `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 6px;">
        <button type="button" class="btn btn-white btn-xs btn-add-kv">
          <span>+ Add Row</span>
        </button>
      </div>
      <div class="kv-rows-container" style="display: flex; flex-direction: column; gap: 6px;"></div>
    `;

    var rowsWrap = container.querySelector('.kv-rows-container');
    var addBtn = container.querySelector('.btn-add-kv');

    function notifyChange() {
      if (typeof onValueChange === 'function') onValueChange(list);
    }

    function renderRows() {
      rowsWrap.innerHTML = '';
      list.forEach(function(item, idx) {
        var row = document.createElement('div');
        row.style.cssText = 'display: flex; gap: 6px; align-items: center;';
        row.innerHTML = `
          <input type="text" class="form-input kv-key-input" value="${escapeAttr(item.days || item.label || '')}" placeholder="${escapeAttr(fieldConfig.keyLabel || 'Key')}" style="font-size: 11.5px; padding: 4px 8px; flex: 1.2;">
          <input type="text" class="form-input kv-val-input" value="${escapeAttr(item.time || item.value || '')}" placeholder="${escapeAttr(fieldConfig.valueLabel || 'Value')}" style="font-size: 11.5px; padding: 4px 8px; flex: 1.5;">
          <button type="button" class="btn btn-white btn-xs kv-del-btn" style="color: #ef4444; padding: 4px 6px;">&times;</button>
        `;

        row.querySelector('.kv-key-input').addEventListener('input', function(e) {
          item.days = e.target.value;
          item.label = e.target.value;
          notifyChange();
        });

        row.querySelector('.kv-val-input').addEventListener('input', function(e) {
          item.time = e.target.value;
          item.value = e.target.value;
          notifyChange();
        });

        row.querySelector('.kv-del-btn').addEventListener('click', function() {
          list.splice(idx, 1);
          renderRows();
          notifyChange();
        });

        rowsWrap.appendChild(row);
      });
    }

    addBtn.addEventListener('click', function() {
      list.push({ days: '', time: '' });
      renderRows();
      notifyChange();
    });

    renderRows();
    return container;
  }

  // =========================================================================
  // 3. MAIN DYNAMIC DESIGN-SPECIFIC EDITOR RENDERER
  // =========================================================================

  /**
   * Render the custom tailored editor for the given design and customer
   */
  function renderDesignSpecificEditor(designId, customer) {
    currentActiveDesignId = designId;
    currentFormCustomerData = customer || {};

    var registry = global.DESIGN_EDITOR_REGISTRY;
    if (!registry) return;

    var config = registry.getDesignEditorConfig(designId);
    if (!config) return;

    // 1. Adapt Core Personal / Identity Fields & Labels
    adaptCoreFields(config, customer);

    // 2. Hide all old static cards
    var oldCards = ['raftconProjectCard', 'atgStudyAbroadCard', 'spiceRouteCard'];
    oldCards.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // 3. Populate or create the Dynamic Design-Specific Container
    var dynamicContainer = document.getElementById('dynamicDesignSpecificContainer');
    if (!dynamicContainer) {
      dynamicContainer = document.createElement('div');
      dynamicContainer.id = 'dynamicDesignSpecificContainer';
      var formLeftCol = document.querySelector('.form-left-col');
      if (formLeftCol) {
        // Insert right after the Core Information Cards
        var cardCustom = document.getElementById('cardCustomizationCard');
        if (cardCustom && cardCustom.parentNode) {
          cardCustom.parentNode.insertBefore(dynamicContainer, cardCustom.nextSibling);
        } else {
          formLeftCol.appendChild(dynamicContainer);
        }
      }
    }

    dynamicContainer.innerHTML = '';

    // Extract current industry data
    var custom = (customer && customer.customSettings) || (customer && customer.custom_settings) || {};
    var rawIndData = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object') ? custom.industry.data : {};
    activeIndustryData = Object.assign({}, rawIndData);
    var indData = activeIndustryData;

    // 4. Render each tailored section
    (config.sections || []).forEach(function(sec) {
      var secCard = document.createElement('div');
      secCard.className = 'form-card dynamic-design-card';
      secCard.id = 'sec_' + sec.id;

      secCard.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
          <h2 class="form-section-title" style="margin: 0;">${escapeHtml(sec.title)}</h2>
          <span class="badge-design" style="background: #f1f5f9; color: var(--text-headline); font-size: 10.5px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border-light);">${escapeHtml(config.name)}</span>
        </div>
        <p class="form-section-sub">${escapeHtml(sec.description || '')}</p>
        <div class="dynamic-fields-stack" style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;"></div>
      `;

      var stack = secCard.querySelector('.dynamic-fields-stack');

      (sec.fields || []).forEach(function(field) {
        var fieldWrap = document.createElement('div');
        fieldWrap.className = 'form-group dynamic-field-wrap';
        fieldWrap.setAttribute('data-key', field.key);

        var currentVal = indData[field.key] !== undefined ? indData[field.key] : (field.default !== undefined ? field.default : '');

        function handleValUpdate(newVal) {
          activeIndustryData[field.key] = newVal;
          indData[field.key] = newVal;
          triggerLivePreviewUpdate();
        }

        if (field.type === 'file_upload') {
          fieldWrap.innerHTML = `<label class="form-label">${escapeHtml(field.label)}</label>`;
          var dz = createDropzone(field, currentVal, function(newUrl) {
            handleValUpdate(newUrl);
          });
          fieldWrap.appendChild(dz);
        } else if (field.type === 'stats_grid') {
          fieldWrap.innerHTML = `<label class="form-label">${escapeHtml(field.label)}</label>`;
          var sg = createStatsGrid(field, currentVal, function(newStats) {
            handleValUpdate(newStats);
          });
          fieldWrap.appendChild(sg);
        } else if (field.type === 'chips') {
          fieldWrap.innerHTML = `<label class="form-label">${escapeHtml(field.label)}</label>`;
          var ch = createChipsInput(field, currentVal, function(newChips) {
            handleValUpdate(newChips);
          });
          fieldWrap.appendChild(ch);
        } else if (field.type === 'repeatable_list') {
          fieldWrap.innerHTML = `<label class="form-label">${escapeHtml(field.label)}</label>`;
          var rep = createRepeatableList(field, currentVal, function(newList) {
            handleValUpdate(newList);
          });
          fieldWrap.appendChild(rep);
        } else if (field.type === 'key_value_list') {
          fieldWrap.innerHTML = `<label class="form-label">${escapeHtml(field.label)}</label>`;
          var kv = createKeyValueList(field, currentVal, function(newKv) {
            handleValUpdate(newKv);
          });
          fieldWrap.appendChild(kv);
        } else if (field.type === 'textarea') {
          fieldWrap.innerHTML = `
            <label class="form-label">${escapeHtml(field.label)}</label>
            <textarea class="form-textarea dynamic-input-field" placeholder="${escapeAttr(field.placeholder || '')}" style="min-height: 60px;">${escapeHtml(currentVal)}</textarea>
          `;
          fieldWrap.querySelector('.dynamic-input-field').addEventListener('input', function(e) {
            handleValUpdate(e.target.value);
          });
        } else if (field.type === 'color') {
          fieldWrap.innerHTML = `
            <label class="form-label">${escapeHtml(field.label)}</label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="color" class="color-picker-input" value="${escapeAttr(currentVal || field.default || '#000000')}" style="width: 36px; height: 36px; padding: 2px; border: 1px solid var(--border-light); border-radius: 6px; cursor: pointer;">
              <input type="text" class="form-input dynamic-input-field" value="${escapeAttr(currentVal || field.default || '')}" placeholder="#ffffff" style="font-family: monospace; font-size: 12px; width: 110px;">
            </div>
          `;
          var colorPick = fieldWrap.querySelector('.color-picker-input');
          var textInput = fieldWrap.querySelector('.dynamic-input-field');
          colorPick.addEventListener('input', function(e) {
            textInput.value = e.target.value;
            handleValUpdate(e.target.value);
          });
          textInput.addEventListener('input', function(e) {
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              colorPick.value = e.target.value;
            }
            handleValUpdate(e.target.value);
          });
        } else {
          // Standard text input
          fieldWrap.innerHTML = `
            <label class="form-label">${escapeHtml(field.label)}</label>
            <input type="text" class="form-input dynamic-input-field" value="${escapeAttr(currentVal)}" placeholder="${escapeAttr(field.placeholder || '')}">
          `;
          fieldWrap.querySelector('.dynamic-input-field').addEventListener('input', function(e) {
            handleValUpdate(e.target.value);
          });
        }

        stack.appendChild(fieldWrap);
      });

      dynamicContainer.appendChild(secCard);
    });

    // 5. Update Live Preview
    triggerLivePreviewUpdate();
  }

  /**
   * Tailor labels, placeholders, and visibility of core customer fields
   */
  function adaptCoreFields(config, customer) {
    var isBusiness = config.category === 'business' || config.category === 'industry';
    var isRestaurant = config.id === 'spice-route' || config.id === 'roast-and-co';
    var isRealEstate = config.id === 'skyline';
    var isDoctor = config.id === 'care-plus';
    var isAtelier = config.id === 'atelier';

    // Title & Subtitle of the Personal Information Card
    var formMainTitle = document.getElementById('formMainTitle');
    var formMainSub = document.getElementById('formMainSub');
    if (formMainTitle) {
      if (isRestaurant) formMainTitle.textContent = 'Restaurant Identity & Host';
      else if (isRealEstate) formMainTitle.textContent = 'Broker & Agency Identity';
      else if (isDoctor) formMainTitle.textContent = 'Physician & Practice Details';
      else if (isAtelier) formMainTitle.textContent = 'Atelier & Couturier Identity';
      else if (isBusiness) formMainTitle.textContent = 'Business & Executive Identity';
      else formMainTitle.textContent = 'Personal Information';
    }
    if (formMainSub) {
      if (isRestaurant) formMainSub.textContent = 'Brand, logo, and dining story displayed on the card.';
      else if (isRealEstate) formMainSub.textContent = 'Brokerage credentials, portrait, and market expertise.';
      else if (isDoctor) formMainSub.textContent = 'Doctor portrait, clinical credentials, and specialty.';
      else if (isBusiness) formMainSub.textContent = 'Company overview, logo, and leadership information.';
      else formMainSub.textContent = 'Who this digital card belongs to.';
    }

    // Adapt Avatar / Logo Area
    var avatarTitle = document.querySelector('.avatar-upload-title');
    var avatarSub = document.querySelector('.avatar-upload-sub');
    if (avatarTitle) {
      if (isRestaurant) avatarTitle.textContent = 'Restaurant Logo / Emblem';
      else if (isRealEstate) avatarTitle.textContent = 'Agent Portrait or Agency Logo';
      else if (isDoctor) avatarTitle.textContent = 'Physician Portrait';
      else if (isBusiness) avatarTitle.textContent = 'Company Brand Logo';
      else avatarTitle.textContent = 'Profile Photo';
    }
    if (avatarSub) {
      avatarSub.textContent = 'Upload a high-resolution square image (minimum 400x400px). Supports drag & drop.';
    }

    // Adapt Field Labels
    setFieldLabelAndPlaceholder('custFullName', 
      isDoctor ? 'Physician / Doctor Name' : (isRestaurant ? 'Executive Chef / Host Name' : (isRealEstate ? 'Lead Broker / Agent Name' : (isBusiness ? 'Contact / Executive Name' : 'Full Name'))),
      isDoctor ? 'e.g. Dr. Rohan Mehta' : (isRestaurant ? 'e.g. Chef Qureshi' : (isRealEstate ? 'e.g. Neha Kapoor' : 'e.g. Rahul Mehta'))
    );

    setFieldLabelAndPlaceholder('custDesignation',
      isDoctor ? 'Medical Qualifications' : (isRestaurant ? 'Dining Specialty' : (isAtelier ? 'Design Discipline' : (isRealEstate ? 'Agent Designation' : 'Designation / Role'))),
      isDoctor ? 'e.g. MBBS, MD (Cardiology)' : (isRestaurant ? 'e.g. Authentic North Indian & Gujarati' : 'e.g. Managing Director')
    );

    setFieldLabelAndPlaceholder('custCompany',
      isRestaurant ? 'Restaurant Name' : (isDoctor ? 'Hospital / Clinical Practice' : (isRealEstate ? 'Real Estate Agency / Developer' : (isBusiness ? 'Company / Business Name' : 'Company Name'))),
      isRestaurant ? 'e.g. Spice Route' : (isDoctor ? 'e.g. City Heart & Vascular Clinic' : (isRealEstate ? 'e.g. Skyline Luxury Realty' : 'e.g. Mehta Enterprises'))
    );

    setFieldLabelAndPlaceholder('custDescription',
      isRestaurant ? 'Culinary Story & Heritage' : (isDoctor ? 'Clinical Background & Experience' : (isRealEstate ? 'Broker Biography & Market Focus' : 'Introduction / Biography')),
      'Shown prominently on the digital card'
    );
  }

  function setFieldLabelAndPlaceholder(fieldId, labelText, placeholderText) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    if (placeholderText) field.placeholder = placeholderText;
    var label = document.querySelector('label[for="' + fieldId + '"]');
    if (label && labelText) label.textContent = labelText;
  }

  // =========================================================================
  // 4. LIVE CARD PREVIEW ENGINE
  // =========================================================================

  function initLivePreview() {
    var frameWrap = document.getElementById('adminPreviewFrameWrap');
    if (!frameWrap) return;

    var btnMobile = document.getElementById('btnPreviewMobile');
    var btnDesktop = document.getElementById('btnPreviewDesktop');

    if (btnMobile) {
      btnMobile.addEventListener('click', function() {
        isMobilePreview = true;
        btnMobile.classList.add('active');
        btnMobile.style.background = '#ffffff';
        if (btnDesktop) {
          btnDesktop.classList.remove('active');
          btnDesktop.style.background = 'transparent';
        }
        if (frameWrap) {
          frameWrap.classList.remove('desktop-mode');
          frameWrap.classList.add('mobile-mode');
        }
      });
    }

    if (btnDesktop) {
      btnDesktop.addEventListener('click', function() {
        isMobilePreview = false;
        btnDesktop.classList.add('active');
        btnDesktop.style.background = '#ffffff';
        if (btnMobile) {
          btnMobile.classList.remove('active');
          btnMobile.style.background = 'transparent';
        }
        if (frameWrap) {
          frameWrap.classList.remove('mobile-mode');
          frameWrap.classList.add('desktop-mode');
        }
      });
    }
  }

  function triggerLivePreviewUpdate() {
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(renderLivePreviewNow, 80);
  }

  function renderLivePreviewNow() {
    var iframe = document.getElementById('adminPreviewIframe');
    if (!iframe) return;

    var renderer = global.CARD_RENDERER;
    if (!renderer || typeof renderer.renderCardHtml !== 'function') return;

    // Collect current state from form
    var payload = collectCurrentFormCardPayload();
    try {
      var html = renderer.renderCardHtml(payload, { isPreview: true });
      iframe.srcdoc = html;
    } catch (err) {
      console.warn('Error generating live preview HTML:', err);
    }
  }

  /**
   * Compile the current form values into a ResolvedCustomerCard payload for rendering
   */
  function collectCurrentFormCardPayload() {
    var nameVal = (document.getElementById('custFullName')?.value || '').trim() || 'Your Name';
    var desigVal = (document.getElementById('custDesignation')?.value || '').trim();
    var compVal = (document.getElementById('custCompany')?.value || '').trim();
    var descVal = (document.getElementById('custDescription')?.value || '').trim();
    var phoneVal = (document.getElementById('custPhone')?.value || '').trim();
    var waVal = (document.getElementById('custWhatsApp')?.value || document.getElementById('custWhatsapp')?.value || '').trim();
    var emailVal = (document.getElementById('custEmail')?.value || '').trim();
    var webVal = (document.getElementById('custWebsite')?.value || '').trim();
    var addrVal = (document.getElementById('custAddress')?.value || '').trim();
    var instaVal = (document.getElementById('custInstagram')?.value || '').trim();
    var linkedInVal = (document.getElementById('custLinkedIn')?.value || '').trim();
    var designName = document.getElementById('selectedDesignInput')?.value || currentActiveDesignId || 'Mint Haven';
    var avatarUrl = global.currentUploadedAvatar || (currentFormCustomerData && currentFormCustomerData.avatarUrl) || '';

    // Collect dynamic industry data
    var industryData = collectDesignSpecificData();

    // Collect custom links
    var links = (global.currentCustomLinks && Array.isArray(global.currentCustomLinks)) 
      ? global.currentCustomLinks.slice() 
      : ((currentFormCustomerData && currentFormCustomerData.customSettings && currentFormCustomerData.customSettings.links) || []);

    return {
      fullName: nameVal,
      designation: desigVal,
      company: compVal,
      description: descVal,
      phone: phoneVal,
      whatsapp: waVal,
      email: emailVal,
      website: webVal,
      address: addrVal,
      socialInstagram: instaVal,
      socialLinkedIn: linkedInVal,
      cardDesign: designName,
      profileSlug: (currentFormCustomerData && currentFormCustomerData.profileSlug) || 'preview',
      avatarUrl: avatarUrl,
      is_active: true,
      customSettings: {
        appearance: {
          primaryColor: document.getElementById('custPrimaryColor')?.value.trim() || '',
          backgroundColor: document.getElementById('custBgColor')?.value.trim() || '',
          textColor: document.getElementById('custTextColor')?.value.trim() || '',
          fontFamily: document.getElementById('custFontFamily')?.value || 'Inter'
        },
        links: links,
        cardImages: {
          frontUrl: global.currentFrontImageUrl || '',
          backUrl: global.currentBackImageUrl || ''
        },
        industry: {
          type: resolveIndustryType(currentActiveDesignId),
          data: industryData
        }
      }
    };
  }

  function resolveIndustryType(designId) {
    if (designId === 'skyline') return 'real-estate';
    if (designId === 'atelier') return 'fashion';
    if (designId === 'care-plus') return 'healthcare';
    if (designId === 'roast-and-co') return 'cafe';
    if (designId === 'raftcon-luxury') return 'construction';
    if (designId === 'atg-study-abroad') return 'education';
    if (designId === 'spice-route') return 'restaurant';
    return 'business';
  }

  /**
   * Read all dynamic fields in the active design editor
   */
  function collectDesignSpecificData() {
    var registry = global.DESIGN_EDITOR_REGISTRY;
    if (!registry || !currentActiveDesignId) return activeIndustryData || {};

    var config = registry.getDesignEditorConfig(currentActiveDesignId);
    if (!config || !config.sections) return activeIndustryData || {};

    var container = document.getElementById('dynamicDesignSpecificContainer');
    if (!container) return activeIndustryData || {};

    var result = Object.assign({}, activeIndustryData);

    config.sections.forEach(function(sec) {
      (sec.fields || []).forEach(function(field) {
        var wrap = container.querySelector('[data-key="' + field.key + '"]');
        if (!wrap) return;

        if (field.type === 'file_upload') {
          var hiddenInp = wrap.querySelector('.dropzone-hidden-value');
          if (hiddenInp) result[field.key] = hiddenInp.value.trim();
        } else if (field.type === 'text' || field.type === 'textarea') {
          var inp = wrap.querySelector('.dynamic-input-field');
          if (inp) result[field.key] = inp.value.trim();
        } else if (field.type === 'color') {
          var colInp = wrap.querySelector('.dynamic-input-field');
          if (colInp) result[field.key] = colInp.value.trim();
        }
      });
    });

    activeIndustryData = result;
    return result;
  }

  // =========================================================================
  // 5. PUBLIC API EXPOSURE
  // =========================================================================

  var API = {
    renderDesignSpecificEditor: renderDesignSpecificEditor,
    initLivePreview: initLivePreview,
    triggerLivePreviewUpdate: triggerLivePreviewUpdate,
    collectDesignSpecificData: collectDesignSpecificData,
    collectCurrentFormCardPayload: collectCurrentFormCardPayload,
    uploadMediaFile: uploadMediaFile,
    createDropzone: createDropzone,
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr
  };

  global.DYNAMIC_CARD_EDITOR = API;

})(typeof window !== 'undefined' ? window : this);
