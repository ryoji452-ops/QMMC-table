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

        if (_ds.over && _ds.over !== _ds.src && !_ds.over.classList.contains('spcr-avg-row')) {
            var rect = _ds.over.getBoundingClientRect();
            if (e.clientY > rect.top + rect.height / 2) {
                _ds.over.parentNode.insertBefore(_ds.src, _ds.over.nextSibling);
            } else {
                _ds.over.parentNode.insertBefore(_ds.src, _ds.over);
            }
        }

        _dsClearOver();
        _ds.src   = null;
        _ds.tbody = null;
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