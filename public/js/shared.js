/* ═══════════════════════════════════════════
   shared.js
   Config constants, helper utilities,
   tab switching, modal functions, syncShared.
   Load FIRST before dpcr.js / spcr.js / ipcr.js
═══════════════════════════════════════════ */

/* ── CONFIG (injected by Blade in index.blade.php) ── */
const CSRF  = window.CSRF_TOKEN || '';
const SECTS = window.SECTIONS  || [
    'ALL SECTIONS', 'EFMS', 'IMISS', 'PMG / EFMS / PROCUREMENT',
    'CAO', 'EFMS AND HEMS', 'HRMS/HRMPSB',
    'NURSING', 'MEDICAL', 'ADMINISTRATIVE', 'FINANCE', 'PHARMACY'
];

/* Performance/Success Indicator options (DPCR dropdown) */
const PERF_INDICATORS = [
    { id: 'PI-001', label: '100%' },
    { id: 'PI-002', label: '90%'  },
    { id: 'PI-003', label: '73%'  },
    { id: 'PI-004', label: '50%'  },
    { id: 'PI-005', label: 'At least 1' },
];

/* In-memory registries */
const DPCR_INDICATORS = new Map();
const SPCR_INDICATORS = [];
let   DB_matrices     = window.DB_MATRICES || [];

/* ── HELPERS ── */
function esc(s) {
    return String(s ?? '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function autoExpand(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

function showAlert(elId, type, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = type === 'ok' ? 'alert-ok' : type === 'info' ? 'alert-info' : 'alert-err';
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4500);
}

/* Central fetch wrapper — handles CSRF + JSON */
async function apiFetch(url, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': CSRF,
            'Accept': 'application/json',
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

/* ── TAB SWITCHING ──────────────────────────────────────────────────
   The Rating Matrix panel (#rm-panel) is a single DOM node.
   Tabs DPCR / SPCR / IPCR each contain a .rm-embed-slot.
   On every tab switch we physically move #rm-panel into the new
   slot so all IDs and event listeners stay intact.
   Records tab has no slot — the panel is detached (stays in memory).
─────────────────────────────────────────────────────────────────── */

/* Tabs that embed the Rating Matrix */
const RM_EMBED_TABS = new Set(['dpcr', 'spcr', 'ipcr']);

/* Per-tab collapse state — true = collapsed.
   Preserved across tab switches so the user's preference sticks. */
const _rmCollapseState = { dpcr: false, spcr: false, ipcr: false };

/* Active tab — read by Rating Matrix to show only the matching push button */
window._rmActiveTab = 'dpcr';

function switchTab(tab, clickedBtn) {
    window._rmActiveTab = tab;
    /* 1. Deactivate all pages and tab buttons */
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    /* 2. Activate the target page */
    const page = document.getElementById('page-' + tab);
    if (page) page.classList.add('active');

    /* 3. Activate the clicked button (or find it by convention) */
    const btn = clickedBtn
              || (typeof event !== 'undefined' && event?.currentTarget)
              || [...document.querySelectorAll('.tab-btn')]
                   .find(b => b.getAttribute('onclick')?.includes(`'${tab}'`));
    if (btn) btn.classList.add('active');

    /* 4. Relocate #rm-panel ────────────────────────────────────── */
    const panel = document.getElementById('rm-panel');
    if (!panel) return;

    if (RM_EMBED_TABS.has(tab)) {
        /* Target body div inside this tab's slot */
        const bodyEl = document.getElementById('rm-body-' + tab);
        if (bodyEl && !bodyEl.contains(panel)) {
            bodyEl.appendChild(panel);
        }

        /* Restore collapse state for this tab */
        _rmApplyCollapseState(tab);

        /* Show only the push button for this tab */
        if (typeof rmRefreshPushButtons === 'function') rmRefreshPushButtons(tab);
    } else {
        /* Records tab (or any future tab without a slot):
           detach the panel so it's invisible but stays in memory. */
        if (panel.parentNode) {
            panel.parentNode.removeChild(panel);
        }
    }
}

/* ── Rating Matrix collapse / expand ── */
function rmToggleCollapse(tabKey) {
    _rmCollapseState[tabKey] = !_rmCollapseState[tabKey];
    _rmApplyCollapseState(tabKey);
}

function _rmApplyCollapseState(tabKey) {
    const collapsed = _rmCollapseState[tabKey];
    const bodyEl   = document.getElementById('rm-body-'   + tabKey);
    const toggleEl = document.getElementById('rm-toggle-' + tabKey);

    if (bodyEl) {
        bodyEl.style.display = collapsed ? 'none' : '';
    }
    if (toggleEl) {
        toggleEl.textContent = collapsed ? '▼ Expand' : '▲ Collapse';
    }
}

/* ── Initial placement on page load ────────────────────────────────
   DPCR is the default active tab, so place #rm-panel there.
   DOMContentLoaded fires before any JS that reads window.DB_*,
   so the timing is correct. rating_matrix.js (which fires its own
   init IIFE) runs after this file, so the panel exists when it
   binds event listeners by ID. */
document.addEventListener('DOMContentLoaded', function _rmInitialPlace() {
    const panel  = document.getElementById('rm-panel');
    const bodyEl = document.getElementById('rm-body-dpcr');
    if (panel && bodyEl) bodyEl.appendChild(panel);
    if (typeof rmRefreshPushButtons === 'function') rmRefreshPushButtons('dpcr');
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeScaleModal(); closeViewModal(); closeLinkModal(); }
});

/* ── MODALS ── */
function openScaleModal()  { document.getElementById('scaleModal').classList.add('open'); }
function closeScaleModal() { document.getElementById('scaleModal').classList.remove('open'); }
function closeViewModal()  {
    document.getElementById('viewModal').classList.remove('open');
    document.getElementById('linkModal').classList.remove('open');
}

function openLinkModal(title, rows, onSelect) {
    const modal = document.getElementById('linkModal');
    document.getElementById('linkModalTitle').textContent = title;
    const list = document.getElementById('linkModalList');
    list.innerHTML = '';
    if (!rows.length) {
        list.innerHTML = '<p style="color:#888;font-style:italic;padding:10px 0;">No rows available. Add rows first.</p>';
    } else {
        rows.forEach((row, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'link-row-btn';
            btn.innerHTML = `<span class="link-row-num">#${idx + 1}</span> ${esc(row.label || row.text || '(empty)')}`;
            btn.onclick = () => { onSelect(row); modal.classList.remove('open'); };
            list.appendChild(btn);
        });
    }
    modal.classList.add('open');
}
function closeLinkModal() { document.getElementById('linkModal').classList.remove('open'); }

/* ── DRAG-SORT ROWS ──
   Pointer-events implementation.
   On mousedown of the drag handle:
     1. A floating clone div is created and follows the cursor exactly,
        accounting for page scroll — so the ghost never drifts.
     2. As the cursor moves over sibling rows a drop-target highlight
        tracks the insertion point in real time.
     3. On mouseup the source row is moved to the insertion point.
   ALL rows (data rows AND section headers) are movable.
   Average / summary rows are skip targets only.
   Works correctly whether the page is scrolled or not. */

/* ══════════════════════════════════════════════════════════════
   RATING CELL FACTORY — shared by DPCR / SPCR / IPCR
   Q / E / T → checkbox + conditional number input (1–5)
   A(4)      → read-only, auto-computed average of checked values
══════════════════════════════════════════════════════════════ */
function _buildQETACells(savedData, onAChange) {
    savedData = savedData || {};
    var cells      = [];
    var inputs     = {};
    /* alwaysOpen = true  → cells start as plain editable inputs (SPCR behaviour).
       alwaysOpen = false → cells start locked; RM push is required to enable them (DPCR/IPCR). */
    var alwaysOpen = !!savedData.alwaysOpen;

    ['q','e','t'].forEach(function(key) {
        var td = document.createElement('td');
        td.className = 'rating-cell';
        td.style.cssText = 'text-align:center;vertical-align:middle;padding:3px 2px;';

        /* ── Locked placeholder — only shown in locked mode (DPCR / IPCR) ── */
        var lockBadge = document.createElement('span');
        lockBadge.className = 'qet-lock-badge no-print';
        lockBadge.title     = key.toUpperCase() + ' rating — fill in the Rating Matrix criterion to link this field';
        lockBadge.textContent = 'N/A';
        lockBadge.style.cssText =
            'display:inline-block;font-size:8px;font-weight:700;letter-spacing:.4px;'
            + 'color:#999;background:#f4f4f4;border:1px solid #ddd;'
            + 'border-radius:2px;padding:1px 4px;'
            + 'cursor:not-allowed;pointer-events:none;user-select:none;';
        /* In always-open mode the badge is never shown */
        if (alwaysOpen) lockBadge.style.display = 'none';

        /* ── Checkbox (internal state — never visible on screen) ── */
        var chk = document.createElement('input');
        chk.type      = 'checkbox';
        chk.className = 'rating-chk';
        chk.title     = 'Controlled by Rating Matrix';
        chk.checked   = alwaysOpen ? true : false;
        chk.disabled  = true;
        chk.style.display = 'none';

        /* ── Number input (1–5) ── */
        var inp = document.createElement('input');
        inp.type        = 'number';
        inp.min         = '1'; inp.max = '5'; inp.step = '0.01';
        inp.placeholder = '—';
        var _savedVal = (savedData['rating_' + key] != null && savedData['rating_' + key] !== '')
                        ? String(savedData['rating_' + key]) : '';
        inp.dataset.savedVal = _savedVal;
        inp.className   = 'rating-num';
        inp.style.cssText = 'width:96%;text-align:center;border:none;outline:none;'
            + 'background:transparent;font-size:10px;font-family:Arial,sans-serif;';

        if (alwaysOpen) {
            /* Always-open mode: input is immediately visible and editable.
               Placeholder shows N/A when no DPCR value was provided. */
            inp.value        = _savedVal;
            inp.placeholder  = 'N/A';
            inp.style.display = 'block';
            inp.disabled     = false;
        } else {
            /* Locked mode: hidden until RM criterion is defined */
            inp.value        = '';
            inp.style.display = 'none';
            inp.disabled     = true;
        }

        inp.addEventListener('input', _computeA);

        inputs[key] = { chk: chk, inp: inp, lockBadge: lockBadge };
        td.appendChild(lockBadge);
        td.appendChild(chk);
        td.appendChild(inp);
        cells.push(td);
    });

    /* A(4) — read-only computed average */
    var tdA = document.createElement('td');
    tdA.className = 'rating-cell';
    tdA.style.cssText = 'text-align:center;vertical-align:middle;padding:3px 2px;';

    var aDisplay = document.createElement('div');
    aDisplay.className = 'rating-a-display';
    aDisplay.style.cssText = 'font-weight:700;font-size:10px;color:var(--navy,#1a3b6e);';
    aDisplay.textContent = (savedData['rating_a'] != null && savedData['rating_a'] !== '')
        ? parseFloat(savedData['rating_a']).toFixed(2) : '—';

    var aHidden = document.createElement('input');
    aHidden.type      = 'hidden';
    aHidden.className = 'rating-a-hidden';
    aHidden.value     = (savedData['rating_a'] != null) ? savedData['rating_a'] : '';

    /* Print-visible span for A value */
    var aPrintSpan = document.createElement('span');
    aPrintSpan.className = 'rating-a-print print-only';
    aPrintSpan.style.cssText = 'font-weight:700;font-size:10px;';
    aPrintSpan.textContent = aDisplay.textContent;

    tdA.appendChild(aDisplay);
    tdA.appendChild(aHidden);
    tdA.appendChild(aPrintSpan);
    cells.push(tdA);

    function _computeA() {
        var vals = [];
        ['q','e','t'].forEach(function(k) {
            var d = inputs[k];
            if (d.chk.checked && d.inp.value !== '') {
                var v = parseFloat(d.inp.value);
                if (!isNaN(v)) vals.push(v);
            }
        });
        if (vals.length) {
            var avg = (vals.reduce(function(a, b) { return a + b; }, 0) / vals.length).toFixed(2);
            aDisplay.textContent  = avg;
            aPrintSpan.textContent = avg;
            aHidden.value         = avg;
        } else {
            aDisplay.textContent  = '—';
            aPrintSpan.textContent = '—';
            aHidden.value         = '';
        }
        if (typeof onAChange === 'function') onAChange();
    }

    return {
        cells:      cells,
        alwaysOpen: alwaysOpen,   /* exposed so _rmApplyQET can skip lock/unlock */
        computeA:   _computeA,
        getQ:       function() { var d = inputs.q; return (alwaysOpen || d.chk.checked) && d.inp.value !== '' ? parseFloat(d.inp.value) : null; },
        getE:       function() { var d = inputs.e; return (alwaysOpen || d.chk.checked) && d.inp.value !== '' ? parseFloat(d.inp.value) : null; },
        getT:       function() { var d = inputs.t; return (alwaysOpen || d.chk.checked) && d.inp.value !== '' ? parseFloat(d.inp.value) : null; },
        getA:       function() { return aHidden.value !== '' ? parseFloat(aHidden.value) : null; },
        getCheckQ:  function() { return alwaysOpen ? true : inputs.q.chk.checked; },
        getCheckE:  function() { return alwaysOpen ? true : inputs.e.chk.checked; },
        getCheckT:  function() { return alwaysOpen ? true : inputs.t.chk.checked; },
    };
}

/* Computation guide HTML — shown in popup modal */
function _ratingComputeGuideHtml() {
    return '<div style="padding:12px 16px;font-size:11px;line-height:1.85;font-family:Arial,sans-serif;max-width:480px;">'
        + '<p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1a3b6e;">How the Rating (Q / E / T / A) is Computed</p>'
        + '<ol style="margin:0 0 10px;padding-left:18px;">'
        + '<li>The <b>Q / E / T checkboxes</b> are controlled by the <b>Rating Matrix</b> below the table.<br>'
        + '&nbsp;&nbsp;Fill in the <em>Quality</em>, <em>Efficiency</em>, or <em>Timeliness</em> criteria in the Rating Matrix row<br>'
        + '&nbsp;&nbsp;to automatically <b>enable</b> that checkbox here. Leave it blank to disable it.</li>'
        + '<li>Once a criterion is enabled, enter a numeric score <b>1–5</b> for it.</li>'
        + '<li><b>A (Average)</b> is automatically computed as the mean of all <em>enabled</em> values.<br>'
        + '&nbsp;&nbsp;<em>Example — Q=4, E=5, T=3 → A = (4+5+3) ÷ 3 = <b>4.00</b></em><br>'
        + '&nbsp;&nbsp;<em>Only Q & T enabled — Q=4, T=3 → A = (4+3) ÷ 2 = <b>3.50</b></em></li>'
        + '<li>The <b>per-function average</b> = mean of all A(4) values within that function group.</li>'
        + '<li><b>Final Rating per Function</b> = Average Rating × Percentage Distribution.</li>'
        + '<li><b>Final Average Rating</b> = sum of all Final Ratings per Function.</li>'
        + '</ol>'
        + '<table style="width:100%;border-collapse:collapse;font-size:10px;">'
        + '<tr style="background:#f0f4ff;"><th style="padding:3px 6px;text-align:left;">Score</th><th style="padding:3px 6px;text-align:left;">Adjectival Rating</th></tr>'
        + '<tr><td style="padding:2px 6px;">5</td><td>Outstanding</td></tr>'
        + '<tr><td style="padding:2px 6px;">4 – 4.99</td><td>Very Satisfactory</td></tr>'
        + '<tr><td style="padding:2px 6px;">3 – 3.99</td><td>Satisfactory</td></tr>'
        + '<tr><td style="padding:2px 6px;">2 – 2.99</td><td>Unsatisfactory</td></tr>'
        + '<tr><td style="padding:2px 6px;">1</td><td>Poor</td></tr>'
        + '</table>'
        + '<div style="margin-top:8px;font-size:9.5px;color:#555;background:#fffbe6;padding:6px 8px;border-radius:3px;border-left:3px solid #f5a623;">'
        + '<b>Tip:</b> To enable Q, E, or T for a row — scroll to the Rating Matrix below, find the matching row, '
        + 'and fill in its Quality / Efficiency / Timeliness field. The checkbox here will activate automatically.'
        + '</div>'
        + '</div>';
}

function makeDragHandle() {
    var td = document.createElement('td');
    td.className = 'drag-handle no-print';
    td.innerHTML = '<div class="drag-handle-icon"><span></span><span></span><span></span></div>';
    return td;
}

/* ── Shared drag-sort state — one active drag at a time across all tables ── */
var _ds = {
    src:    null,   /* <tr> being dragged       */
    ghost:  null,   /* floating label <div>     */
    over:   null,   /* current drop-target <tr> */
    tbody:  null,   /* tbody that owns the drag */
    offsetY: 0,     /* cursor offset inside src */
};

/* Shared document-level handlers — attached once */
(function _attachSharedDragHandlers() {
    document.addEventListener('mousemove', function(e) {
        if (!_ds.src || !_ds.ghost) return;

        /* Move ghost with cursor (fixed-position follows clientY/clientX) */
        _ds.ghost.style.top  = (e.clientY - _ds.offsetY) + 'px';

        /* Find the <tr> under the pointer — ghost has pointer-events:none so no hiding needed */
        var el = document.elementFromPoint(e.clientX, e.clientY);
        while (el && el.tagName !== 'TR') el = el.parentElement;
        var target = (el && el.closest('tbody') === _ds.tbody) ? el : null;

        if (!target || target === _ds.src || target.classList.contains('spcr-avg-row')) {
            _dsClearOver(); return;
        }
        if (target !== _ds.over) {
            _dsClearOver();
            _ds.over = target;
            _ds.over.classList.add('drag-over');
        }
    });

    document.addEventListener('mouseup', function(e) {
        if (!_ds.src) return;

        _ds.src.classList.remove('dragging');
        _dsRemoveGhost();

        var dropped = false;
        if (_ds.over && _ds.over !== _ds.src && !_ds.over.classList.contains('spcr-avg-row')) {
            var rect = _ds.over.getBoundingClientRect();
            if (e.clientY > rect.top + rect.height / 2) {
                _ds.over.parentNode.insertBefore(_ds.src, _ds.over.nextSibling);
            } else {
                _ds.over.parentNode.insertBefore(_ds.src, _ds.over);
            }
            dropped = true;
        }

        var tbody = _ds.tbody;
        _dsClearOver();
        _ds.src   = null;
        _ds.tbody = null;

        /* Fire registered post-drop callbacks so summaries recompute */
        if (dropped && tbody) {
            (_ds.callbacks || []).forEach(function(cb) {
                try { cb(tbody); } catch(e2) {}
            });
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && _ds.src) {
            _ds.src.classList.remove('dragging');
            _dsRemoveGhost();
            _dsClearOver();
            _ds.src   = null;
            _ds.tbody = null;
        }
    });
})();

function _dsClearOver() {
    if (_ds.over) { _ds.over.classList.remove('drag-over'); _ds.over = null; }
}
function _dsRemoveGhost() {
    if (_ds.ghost && _ds.ghost.parentNode) _ds.ghost.parentNode.removeChild(_ds.ghost);
    _ds.ghost = null;
}

/* Register a callback to run after any successful drag-drop.
   cb(tbody) — tbody is the table body where the drop occurred. */
function registerDragCallback(cb) {
    if (!_ds.callbacks) _ds.callbacks = [];
    _ds.callbacks.push(cb);
}
function _dsRowLabel(tr) {
    var text = '';
    tr.querySelectorAll('textarea, input[type="text"]').forEach(function(el) {
        var v = (el.value || '').trim();
        if (v && text.length < 80) text += (text ? ' · ' : '') + v;
    });
    return text || '(row)';
}

function initDragSort(tbody) {
    if (!tbody || tbody._dragSortInit) return;
    tbody._dragSortInit = true;

    tbody.addEventListener('mousedown', function(e) {
        /* Only respond to mousedown on the drag handle icon */
        var handle = e.target.closest('.drag-handle');
        if (!handle) return;
        var tr = handle.closest('tr');
        if (!tr || tr.closest('tbody') !== tbody) return;

        e.preventDefault(); /* prevent text selection */

        _ds.src   = tr;
        _ds.tbody = tbody;
        _ds.src.classList.add('dragging');

        var rect    = tr.getBoundingClientRect();
        _ds.offsetY = e.clientY - rect.top;

        /* Build ghost label div */
        _ds.ghost = document.createElement('div');
        _ds.ghost.className   = 'drag-ghost';
        _ds.ghost.textContent = _dsRowLabel(tr);
        _ds.ghost.style.cssText =
            'position:fixed;z-index:99999;pointer-events:none;'
            + 'width:' + rect.width  + 'px;'
            + 'left:'  + rect.left   + 'px;'
            + 'top:'   + (e.clientY - _ds.offsetY) + 'px;'
            + 'box-sizing:border-box;';
        document.body.appendChild(_ds.ghost);
    }, true); /* capture phase so it fires before any child handlers */
}

/* ── SYNC: SPCR employee info → DPCR header ── */
function syncShared() {
    const name      = document.getElementById('s_emp_name')?.value     || '';
    const title     = document.getElementById('s_emp_position')?.value || '';
    const approved  = document.getElementById('s_approved_by')?.value  || '';
    const nameEl    = document.getElementById('d_emp_name');
    const titleEl   = document.getElementById('d_emp_title');
    const approvedEl= document.getElementById('d_approved_by');
    const dispEl    = document.getElementById('d_disp_name');
    if (nameEl)     nameEl.value     = name;
    if (titleEl)    titleEl.value    = title;
    if (approvedEl) approvedEl.value = approved;
    if (dispEl)     dispEl.textContent = name || '\u00a0';
}
/* ══════════════════════════════════════════════════════════════
   FORM PERSISTENCE — localStorage auto-save + restore
   ──────────────────────────────────────────────────────────────
   Every change to DPCR / SPCR / IPCR form fields is debounced
   and saved to localStorage under the keys:
     qmmc_dpcr_draft, qmmc_spcr_draft, qmmc_ipcr_draft

   On page load (in ipcr.js init, AFTER DB hydration), if a
   localStorage draft exists it is restored — keeping in-session
   work even after a browser refresh. DB records are the permanent
   store; localStorage is the session-level autosave.

   "Default = clear" is achieved because a fresh session has no
   localStorage draft and no DB_LATEST_* → tables stay empty.
══════════════════════════════════════════════════════════════ */
var _persistTimers = {};

/**
 * Debounced save of one form's JSON state to localStorage.
 * key   = storage key, e.g. 'qmmc_dpcr_draft'
 * readFn = function that returns the current form data object
 */
function _persistSave(key, readFn) {
    clearTimeout(_persistTimers[key]);
    _persistTimers[key] = setTimeout(function() {
        try {
            var data = readFn();
            localStorage.setItem(key, JSON.stringify(data));
        } catch(e) { /* quota exceeded or private mode — silent */ }
    }, 800);
}

/**
 * Load a draft from localStorage.
 * Returns the parsed object, or null if none/corrupt.
 */
function _persistLoad(key) {
    try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
}

/** Clear one draft (e.g. after a successful DB save or Clear button). */
function _persistClear(key) {
    try { localStorage.removeItem(key); } catch(e) {}
}

/* Wire auto-save listeners on a tbody — saves on any input/change */
function _persistWireBody(bodyId, storageKey, readFn) {
    var body = document.getElementById(bodyId);
    if (!body) return;
    body.addEventListener('input',  function() { _persistSave(storageKey, readFn); });
    body.addEventListener('change', function() { _persistSave(storageKey, readFn); });
}

/* Public constants for storage keys */
var PERSIST_KEY_DPCR = 'qmmc_dpcr_draft';
var PERSIST_KEY_SPCR = 'qmmc_spcr_draft';
var PERSIST_KEY_IPCR = 'qmmc_ipcr_draft';