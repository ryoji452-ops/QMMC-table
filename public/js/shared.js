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

/* ── TAB SWITCHING ── */
function switchTab(tab, clickedBtn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    const btn = clickedBtn
              || (typeof event !== 'undefined' && event?.currentTarget)
              || [...document.querySelectorAll('.tab-btn')].find(b => b.getAttribute('onclick')?.includes(`'${tab}'`));
    if (btn) btn.classList.add('active');
}

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
   Uses mousedown on the handle to arm draggable=true on the <tr>,
   then standard HTML5 dragstart/dragover/drop to reorder.
   ALL rows (data rows AND section headers) are movable. */
function makeDragHandle() {
    const td = document.createElement('td');
    td.className = 'drag-handle no-print';
    td.innerHTML = '<div class="drag-handle-icon"><span></span><span></span><span></span></div>';
    return td;
}

function initDragSort(tbody) {
    if (!tbody || tbody._dragSortInit) return;
    tbody._dragSortInit = true;

    let dragSrc = null;

    /* Step 1: mousedown on handle arms the row for dragging */
    tbody.addEventListener('mousedown', function(e) {
        const handle = e.target.closest('.drag-handle');
        if (!handle) return;
        const tr = handle.closest('tr');
        if (!tr) return;
        tr.setAttribute('draggable', 'true');
        var disarm = function() { tr.setAttribute('draggable', 'false'); };
        tr.addEventListener('mouseup', disarm, { once: true });
        document.addEventListener('mouseup', disarm, { once: true });
    });

    /* Step 2: dragstart fires because draggable=true was set above */
    tbody.addEventListener('dragstart', function(e) {
        var tr = e.target;
        while (tr && tr.tagName !== 'TR') tr = tr.parentElement;
        if (!tr) return;
        dragSrc = tr;
        dragSrc.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    });

    /* Step 3: dragover highlights the target row — ALL rows are valid targets */
    tbody.addEventListener('dragover', function(e) {
        if (!dragSrc) return;
        var tr = e.target;
        while (tr && tr.tagName !== 'TR') tr = tr.parentElement;
        if (!tr || tr === dragSrc) return;
        /* skip avg-summary rows only */
        if (tr.classList.contains('spcr-avg-row')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        tbody.querySelectorAll('tr.drag-over').forEach(function(r) { r.classList.remove('drag-over'); });
        tr.classList.add('drag-over');
    });

    tbody.addEventListener('dragleave', function(e) {
        var tr = e.target;
        while (tr && tr.tagName !== 'TR') tr = tr.parentElement;
        if (tr) tr.classList.remove('drag-over');
    });

    /* Step 4: drop reorders the rows */
    tbody.addEventListener('drop', function(e) {
        if (!dragSrc) return;
        var tr = e.target;
        while (tr && tr.tagName !== 'TR') tr = tr.parentElement;
        if (!tr || tr === dragSrc) return;
        if (tr.classList.contains('spcr-avg-row')) return;
        e.preventDefault();
        tbody.querySelectorAll('tr.drag-over').forEach(function(r) { r.classList.remove('drag-over'); });
        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        var srcIdx = rows.indexOf(dragSrc);
        var tgtIdx = rows.indexOf(tr);
        if (srcIdx < tgtIdx) tr.parentNode.insertBefore(dragSrc, tr.nextSibling);
        else                  tr.parentNode.insertBefore(dragSrc, tr);
    });

    /* Step 5: dragend cleans up */
    tbody.addEventListener('dragend', function() {
        if (dragSrc) {
            dragSrc.classList.remove('dragging');
            dragSrc.setAttribute('draggable', 'false');
        }
        tbody.querySelectorAll('tr.drag-over').forEach(function(r) { r.classList.remove('drag-over'); });
        dragSrc = null;
    });
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