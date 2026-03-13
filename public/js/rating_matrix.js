/* ═══════════════════════════════════════════════════════════════════
   rating_matrix.js
   ─────────────────────────────────────────────────────────────────
   Rating Matrix is the ROOT / SOURCE document.

   FLOW:
     1. User fills in the Rating Matrix:
           Performance Measure | Operational Definition |
           Quality (Q) | Efficiency (E) | Timeliness (T) |
           Source of Data / Monitoring Tool

     2. Each row has three PUSH buttons:
           [→ DPCR]  [→ SPCR]  [→ IPCR]

        Clicking a push button:
          • Creates a new row in the target table
          • Performance Measure  →  Performance/Success Indicator
          • Operational Def      →  Strategic Goal / Objective
          • Q / E / T cell in target table:
               - Has text in RM  →  shows green ✔ badge
               - Empty in RM     →  shows grey  N/A badge
          • The pushed row in RM gets a coloured "✔ sent" tag

     3. If Q/E/T cells in a rating-matrix row are later edited,
        every already-pushed row in DPCR/SPCR/IPCR is updated
        live (✔ ↔ N/A flips automatically).

   Load AFTER: shared.js, dpcr.js, spcr.js, ipcr.js
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────
   COLUMN MAP  (0-based <td> index for each form)
   DPCR:  goal=0 | indicator=1 | target=2 | budget=3 | section=4 | actual=5 | rate=6 | Q=7  E=8  T=9  A=10 | remarks=11
   SPCR:  goal=0 | indicator=1 | target=2 | budget=3 | person=4  | actual=5 | rate=6 | Q=7  E=8  T=9  A=10 | remarks=11
   IPCR:  goal=0 | indicator=1 | actual=2 | rate=3   | Q=4  E=5  T=6  A=7  | remarks=8
───────────────────────────────────────────────────────────────────  */
const RM_COL = {
    // DPCR: handle=0|goal=1|ind=2|target=3|budget=4|section=5|actual=6|rate=7|Q=8|E=9|T=10
    dpcr: { Q: 8, E: 9, T: 10 },
    // SPCR: handle=0|goal=1|ind=2|budget=3|person=4|actual=5|rate=6|Q=7|E=8|T=9
    spcr: { Q: 7, E: 8, T: 9 },
    // IPCR: handle=0|goal=1|ind=2|actual=3|rate=4|Q=5|E=6|T=7
    ipcr: { Q: 5, E: 6, T: 7 },
};

/* Track pushed rows:
   Map< rmRowEl → { dpcr: [formRowEl, …], spcr: […], ipcr: […] } > */
const RM_PUSHED = new WeakMap();

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
function _rmHasContent(val) {
    return typeof val === 'string' && val.trim().length > 0;
}

function _rmReadQET(rmRow) {
    return {
        q: rmRow.querySelector('textarea[data-key="quality"]')?.value.trim()    || '',
        e: rmRow.querySelector('textarea[data-key="efficiency"]')?.value.trim() || '',
        t: rmRow.querySelector('textarea[data-key="timeliness"]')?.value.trim() || '',
    };
}

/* Inject or refresh ✔ / N/A badge into a DPCR/SPCR/IPCR rating cell */
function _rmSetCell(cell, hasContent) {
    if (!cell) return;
    // Remove old badge
    cell.querySelectorAll('.rm-rating-check, .rm-rating-na').forEach(el => el.remove());
    // Hide numeric input (IPCR) if present
    const numInp = cell.querySelector('input[type="number"]');
    if (numInp) numInp.style.display = 'none';

    const badge = document.createElement('span');
    badge.className   = hasContent ? 'rm-rating-check' : 'rm-rating-na';
    badge.textContent = hasContent ? '✔' : 'N/A';
    badge.title       = hasContent
        ? 'Criterion defined in Rating Matrix'
        : 'No criterion defined in Rating Matrix';
    cell.style.textAlign    = 'center';
    cell.style.verticalAlign = 'middle';
    cell.appendChild(badge);
}

/* Apply Q/E/T badges to one already-pushed form row */
function _rmApplyQET(formRow, formKey, qet) {
    const col   = RM_COL[formKey];
    const cells = formRow.querySelectorAll('td');
    _rmSetCell(cells[col.Q], _rmHasContent(qet.q));
    _rmSetCell(cells[col.E], _rmHasContent(qet.e));
    _rmSetCell(cells[col.T], _rmHasContent(qet.t));
}

/* Re-apply Q/E/T to ALL pushed rows for a given rmRow */
function _rmRefreshPushed(rmRow) {
    const pushed = RM_PUSHED.get(rmRow);
    if (!pushed) return;
    const qet = _rmReadQET(rmRow);
    ['dpcr', 'spcr', 'ipcr'].forEach(fk => {
        (pushed[fk] || []).forEach(formRow => _rmApplyQET(formRow, fk, qet));
    });
}

/* ─────────────────────────────────────────────────────────────────
   PUSH ONE ROW  →  DPCR / SPCR / IPCR
───────────────────────────────────────────────────────────────── */
function _rmPushRow(rmRow, formKey) {
    const pmTA  = rmRow.querySelector('textarea[data-key="performance_measure"]');
    const odTA  = rmRow.querySelector('textarea[data-key="operational_definition"]');
    const pm    = pmTA?.value.trim() || '';
    const od    = odTA?.value.trim() || '';

    if (!pm && !od) {
        alert('Please fill in the Performance Measure before pushing.');
        return;
    }

    const qet = _rmReadQET(rmRow);
    let newRow;

    if (formKey === 'dpcr') {
        newRow = createDpcrRow({
            strategic_goal:        od,
            performance_indicator: pm,
        });
        document.getElementById('dpcrBody').appendChild(newRow);
        newRow.querySelectorAll('textarea').forEach(autoExpand);

    } else if (formKey === 'spcr') {
        newRow = createSpcrRow({
            strategic_goal:        od,
            performance_indicator: pm,
        });
        document.getElementById('spcrBody').appendChild(newRow);
        newRow.querySelectorAll('textarea').forEach(autoExpand);

    } else { // ipcr
        newRow = createIpcrRow({
            strategic_goal:        od,
            performance_indicator: pm,
        });
        document.getElementById('ipcrBody').appendChild(newRow);
        newRow.querySelectorAll('textarea').forEach(autoExpand);
    }

    // Apply Q/E/T badges immediately
    _rmApplyQET(newRow, formKey, qet);

    // Register pushed row so future Q/E/T edits refresh it
    if (!RM_PUSHED.has(rmRow)) RM_PUSHED.set(rmRow, { dpcr: [], spcr: [], ipcr: [] });
    RM_PUSHED.get(rmRow)[formKey].push(newRow);

    // Switch to target tab and highlight new row
    switchTab(formKey);
    setTimeout(() => {
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newRow.classList.add('row-highlight');
        setTimeout(() => newRow.classList.remove('row-highlight'), 2000);
    }, 120);

    return newRow;
}

/* ─────────────────────────────────────────────────────────────────
   SECTION ROW FACTORY
───────────────────────────────────────────────────────────────── */
function createRmSectionRow(label = '') {
    const tr = document.createElement('tr');
    tr.className = 'rm-section-row';

    const td = document.createElement('td');
    td.colSpan = 8;                         // 6 data cols + push + del

    const btnBar = document.createElement('div');
    btnBar.className = 'no-print';
    btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
    [
        { label: 'STRATEGIC FUNCTION', color: '#1a3b6e', bg: '#dce4f0' },
        { label: 'CORE FUNCTION',      color: '#1e6e3a', bg: '#d4edda' },
        { label: 'SUPPORT FUNCTION',   color: '#7a4f00', bg: '#fff3cd' },
    ].forEach(f => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = f.label;
        b.style.cssText = `font-size:8.5px;font-family:Arial,sans-serif;font-weight:700;
            padding:2px 7px;border:1.5px solid ${f.color};border-radius:3px;cursor:pointer;
            background:${f.bg};color:${f.color};`;
        b.onclick = () => { inp.value = f.label; _rmStyleSec(tr, f.color, f.bg); };
        btnBar.appendChild(b);
    });

    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = 'Section name…'; inp.value = label;
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:10px;outline:none;vertical-align:middle;min-width:160px;';
    inp.dataset.key = 'section_label';
    inp.addEventListener('input', () => {
        const up = inp.value.toUpperCase();
        if      (up.includes('CORE'))  _rmStyleSec(tr, '#1e6e3a', '#d4edda');
        else if (up.includes('SUPP'))  _rmStyleSec(tr, '#7a4f00', '#fff3cd');
        else                           _rmStyleSec(tr, '#1a3b6e', '#dce4f0');
    });

    const del = document.createElement('button');
    del.type = 'button'; del.className = 'remove-btn no-print';
    del.innerHTML = '&times;'; del.style.marginLeft = '10px';
    del.onclick = () => tr.remove();

    td.appendChild(btnBar); td.appendChild(inp); td.appendChild(del);
    tr.appendChild(td);

    if (label) {
        const up = label.toUpperCase();
        if      (up.includes('CORE'))  _rmStyleSec(tr, '#1e6e3a', '#d4edda');
        else if (up.includes('SUPP'))  _rmStyleSec(tr, '#7a4f00', '#fff3cd');
        else                           _rmStyleSec(tr, '#1a3b6e', '#dce4f0');
    }
    return tr;
}

function _rmStyleSec(tr, color, bg) {
    const td = tr.querySelector('td');
    if (!td) return;
    td.style.background = bg;
    td.style.color      = color;
    td.style.borderLeft = `4px solid ${color}`;
}

/* ─────────────────────────────────────────────────────────────────
   DATA ROW FACTORY
───────────────────────────────────────────────────────────────── */
function createRmRow(data = {}) {
    const tr = document.createElement('tr');

    /* ── Performance Measure ── */
    const tdPm = document.createElement('td');
    const pmTA = document.createElement('textarea');
    pmTA.placeholder = 'Performance Measure…';
    pmTA.dataset.key = 'performance_measure';
    pmTA.value = data.performanceMeasure || '';
    pmTA.addEventListener('input', () => { autoExpand(pmTA); _rmRefreshPushed(tr); });
    tdPm.appendChild(pmTA);
    tr.appendChild(tdPm);

    /* ── Operational Definition ── */
    const tdOd = document.createElement('td');
    const odTA = document.createElement('textarea');
    odTA.placeholder = 'Operational definition…';
    odTA.dataset.key = 'operational_definition';
    odTA.value = data.operationalDefinition || '';
    odTA.addEventListener('input', () => autoExpand(odTA));
    tdOd.appendChild(odTA);
    tr.appendChild(tdOd);

    /* ── Quality (Q) ── */
    const tdQ = document.createElement('td'); tdQ.className = 'rm-td-q';
    const qTA = document.createElement('textarea');
    qTA.placeholder = 'Quality target / criteria…';
    qTA.dataset.key = 'quality';
    qTA.value = data.quality || '';
    qTA.addEventListener('input', () => { autoExpand(qTA); _rmRefreshPushed(tr); });
    tdQ.appendChild(qTA); tr.appendChild(tdQ);

    /* ── Efficiency (E) ── */
    const tdE = document.createElement('td'); tdE.className = 'rm-td-e';
    const eTA = document.createElement('textarea');
    eTA.placeholder = 'Efficiency target / criteria…';
    eTA.dataset.key = 'efficiency';
    eTA.value = data.efficiency || '';
    eTA.addEventListener('input', () => { autoExpand(eTA); _rmRefreshPushed(tr); });
    tdE.appendChild(eTA); tr.appendChild(tdE);

    /* ── Timeliness (T) ── */
    const tdT = document.createElement('td'); tdT.className = 'rm-td-t';
    const tTA = document.createElement('textarea');
    tTA.placeholder = 'Timeliness target / criteria…';
    tTA.dataset.key = 'timeliness';
    tTA.value = data.timeliness || '';
    tTA.addEventListener('input', () => { autoExpand(tTA); _rmRefreshPushed(tr); });
    tdT.appendChild(tTA); tr.appendChild(tdT);

    /* ── Source of Data / Monitoring Tool ── */
    const tdSrc = document.createElement('td');
    const srcTA = document.createElement('textarea');
    srcTA.placeholder = 'Source of data / monitoring tool…';
    srcTA.dataset.key = 'source_monitoring';
    srcTA.value = data.sourceOfMonitoring || '';
    srcTA.addEventListener('input', () => autoExpand(srcTA));
    tdSrc.appendChild(srcTA); tr.appendChild(tdSrc);

    /* ── PUSH TO cell (screen only) ── */
    const tdPush = document.createElement('td');
    tdPush.className = 'rm-push-cell no-print';

    // State: track which forms this row has been pushed to
    const sentTo = new Set(data.sentTo || []);

    function makePushBtn(formKey, label, tabId) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `rm-push-btn ${formKey}`;
        btn.dataset.form = formKey;

        function refreshBtn() {
            if (sentTo.has(formKey)) {
                btn.textContent = `✔ ${label}`;
                btn.classList.add('sent');
                btn.title = `Already pushed to ${label} — click to push again`;
            } else {
                btn.textContent = `→ ${label}`;
                btn.classList.remove('sent');
                btn.title = `Push this row to ${label}`;
            }
        }
        refreshBtn();

        btn.onclick = () => {
            _rmPushRow(tr, formKey);
            sentTo.add(formKey);
            refreshBtn();
        };
        return btn;
    }

    tdPush.appendChild(makePushBtn('dpcr', 'DPCR', 'dpcr'));
    tdPush.appendChild(makePushBtn('spcr', 'SPCR', 'spcr'));
    tdPush.appendChild(makePushBtn('ipcr', 'IPCR', 'ipcr'));
    tr.appendChild(tdPush);

    /* ── Delete (screen only) ── */
    const tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button'); dBtn.type = 'button';
    dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    return tr;
}

/* ─────────────────────────────────────────────────────────────────
   ROW NUMBER REFRESH
───────────────────────────────────────────────────────────────── */
function _rmRefreshNumbers() {
    let n = 0;
    document.querySelectorAll('#rmBody tr').forEach(tr => {
        if (tr.classList.contains('rm-section-row')) return;
        n++;
        // (no number cell in current design — reserved for future use)
    });
}

/* ─────────────────────────────────────────────────────────────────
   READ FORM  (for save)
───────────────────────────────────────────────────────────────── */
function readRmForm() {
    const items = [];
    document.querySelectorAll('#rmBody tr').forEach(tr => {
        if (tr.classList.contains('rm-section-row')) {
            const inp = tr.querySelector('input[data-key="section_label"]');
            items.push({ is_section: true, section_label: inp?.value.trim() || '' });
            return;
        }
        const pmTA  = tr.querySelector('textarea[data-key="performance_measure"]');
        if (!pmTA) return;
        items.push({
            is_section:             false,
            performance_measure:    pmTA.value.trim(),
            operational_definition: tr.querySelector('textarea[data-key="operational_definition"]')?.value.trim() || '',
            quality:                tr.querySelector('textarea[data-key="quality"]')?.value.trim()                || '',
            efficiency:             tr.querySelector('textarea[data-key="efficiency"]')?.value.trim()             || '',
            timeliness:             tr.querySelector('textarea[data-key="timeliness"]')?.value.trim()             || '',
            source_monitoring:      tr.querySelector('textarea[data-key="source_monitoring"]')?.value.trim()      || '',
        });
    });
    return {
        prepared_by:       document.getElementById('rm_prepared_by')?.value.trim()       || '',
        prepared_by_title: document.getElementById('rm_prepared_by_title')?.value.trim() || '',
        reviewed_by:       document.getElementById('rm_reviewed_by')?.value.trim()       || '',
        reviewed_by_title: document.getElementById('rm_reviewed_by_title')?.value.trim() || '',
        approved_by:       document.getElementById('rm_approved_by')?.value.trim()       || '',
        approved_by_title: document.getElementById('rm_approved_by_title')?.value.trim() || '',
        prepared_date:     document.getElementById('rm_prepared_date')?.value            || null,
        reviewed_date:     document.getElementById('rm_reviewed_date')?.value            || null,
        approved_date:     document.getElementById('rm_approved_date')?.value            || null,
        items,
    };
}

/* ─────────────────────────────────────────────────────────────────
   HYDRATE from DB record
───────────────────────────────────────────────────────────────── */
function hydrateRmForm(matrix) {
    if (!matrix) return;
    const sv = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    sv('rm_prepared_by',       matrix.prepared_by       || '');
    sv('rm_prepared_by_title', matrix.prepared_by_title || '');
    sv('rm_reviewed_by',       matrix.reviewed_by       || '');
    sv('rm_reviewed_by_title', matrix.reviewed_by_title || '');
    sv('rm_approved_by',       matrix.approved_by       || '');
    sv('rm_approved_by_title', matrix.approved_by_title || '');
    sv('rm_prepared_date',     matrix.prepared_date     || '');
    sv('rm_reviewed_date',     matrix.reviewed_date     || '');
    sv('rm_approved_date',     matrix.approved_date     || '');

    const tbody = document.getElementById('rmBody');
    tbody.innerHTML = '';

    (matrix.items || []).forEach(item => {
        if (item.is_section) {
            tbody.appendChild(createRmSectionRow(item.section_label || ''));
        } else {
            const tr = createRmRow({
                performanceMeasure:    item.performance_measure     || '',
                operationalDefinition: item.operational_definition  || '',
                quality:               item.quality                 || '',
                efficiency:            item.efficiency              || '',
                timeliness:            item.timeliness              || '',
                sourceOfMonitoring:    item.source_monitoring       || '',
            });
            tbody.appendChild(tr);
            tr.querySelectorAll('textarea').forEach(autoExpand);
        }
    });
}

/* ─────────────────────────────────────────────────────────────────
   EVENT LISTENERS
───────────────────────────────────────────────────────────────── */
document.getElementById('rmAddRowBtn').addEventListener('click', () => {
    const tr = createRmRow();
    document.getElementById('rmBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('rmAddSectionBtn').addEventListener('click', () => {
    const tr = createRmSectionRow('STRATEGIC FUNCTION');
    document.getElementById('rmBody').appendChild(tr);
    tr.querySelector('input').focus();
});

document.getElementById('rmClearBtn').addEventListener('click', () => {
    if (!confirm('Clear all Rating Matrix rows and signature fields?')) return;
    document.getElementById('rmBody').innerHTML = '';
    ['rm_prepared_by','rm_prepared_by_title','rm_reviewed_by','rm_reviewed_by_title',
     'rm_approved_by','rm_approved_by_title','rm_prepared_date','rm_reviewed_date','rm_approved_date']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    showAlert('rm-alertInfo', 'info', 'Rating Matrix cleared.');
});

document.getElementById('rmSaveBtn').addEventListener('click', async () => {
    const data = readRmForm();
    const dataRows = data.items.filter(i => !i.is_section);
    if (!dataRows.length) {
        showAlert('rm-alertErr', 'err', 'Please add at least one row before saving.');
        return;
    }
    if (!data.prepared_by) {
        showAlert('rm-alertErr', 'err', 'Please fill in the Prepared By field.');
        return;
    }
    try {
        await apiFetch('/api/spcr-matrix', 'POST', {
            prepared_by:       data.prepared_by,
            prepared_by_title: data.prepared_by_title || null,
            reviewed_by:       data.reviewed_by       || null,
            reviewed_by_title: data.reviewed_by_title || null,
            approved_by:       data.approved_by       || null,
            approved_by_title: data.approved_by_title || null,
            prepared_date:     data.prepared_date     || null,
            reviewed_date:     data.reviewed_date     || null,
            approved_date:     data.approved_date     || null,
            items: data.items.map(item => ({
                is_section:             item.is_section             || false,
                section_label:          item.section_label          || null,
                performance_measure:    item.performance_measure    || null,
                operational_definition: item.operational_definition || null,
                quality:                item.quality                || null,
                efficiency:             item.efficiency             || null,
                timeliness:             item.timeliness             || null,
                source_monitoring:      item.source_monitoring      || null,
            })),
        });
        showAlert('rm-alertOk', 'ok', '✔ Rating Matrix saved to database.');
    } catch (err) {
        showAlert('rm-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

/* ─────────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────────── */
(function rmInit() {
    if (window.DB_LATEST_MATRIX) {
        hydrateRmForm(window.DB_LATEST_MATRIX);
    } else {
        // Default starter content
        const tbody = document.getElementById('rmBody');
        tbody.appendChild(createRmSectionRow('STRATEGIC FUNCTION'));
        const firstRow = createRmRow();
        tbody.appendChild(firstRow);
        firstRow.querySelectorAll('textarea').forEach(autoExpand);
    }
})();