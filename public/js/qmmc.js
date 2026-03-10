/* ═══════════════════════════════════════════
   QMMC – SPCR Matrix & DPCR  |  qmmc.js
   All saves/deletes go to Laravel via fetch.
   On page load, data is hydrated from
   window.DB_* variables injected by Blade.
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   CONFIG  (injected by Blade in index.blade.php)
   window.CSRF_TOKEN, window.SECTIONS,
   window.DB_MATRICES, window.DB_LATEST_MATRIX,
   window.DB_LATEST_DPCR
══════════════════════════════════════════ */
const CSRF  = window.CSRF_TOKEN  || '';
const SECTS = window.SECTIONS    || ['ALL SECTIONS','EFMS','IMISS','PMG / EFMS / PROCUREMENT',
                                     'NURSING','MEDICAL','ADMINISTRATIVE','FINANCE','PHARMACY'];

/* In-memory list of matrices (seeded from DB on load) */
let DB_matrices = window.DB_MATRICES || [];

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
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

/* ══════════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════════ */
function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    event.currentTarget.classList.add('active');
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeScaleModal(); closeViewModal(); }
});

/* ══════════════════════════════════════════
   MODALS
══════════════════════════════════════════ */
function openScaleModal()  { document.getElementById('scaleModal').classList.add('open'); }
function closeScaleModal() { document.getElementById('scaleModal').classList.remove('open'); }
function closeViewModal()  { document.getElementById('viewModal').classList.remove('open'); }

/* ══════════════════════════════════════════
   SYNC: SPCR signatories → DPCR
══════════════════════════════════════════ */
function syncShared() {
    const name     = document.getElementById('s_prepared_by').value;
    const title    = document.getElementById('s_prepared_by_title').value;
    const approved = document.getElementById('s_approved_by').value;
    document.getElementById('d_emp_name').value    = name;
    document.getElementById('d_emp_title').value   = title;
    document.getElementById('d_approved_by').value = approved;
    document.getElementById('d_disp_name').textContent = name || '\u00a0';
}

/* ══════════════════════════════════════════
   SPCR — ROW / SECTION FACTORIES
══════════════════════════════════════════ */
function makeTA(placeholder, minH) {
    const ta = document.createElement('textarea');
    ta.placeholder = placeholder;
    ta.style.minHeight = (minH || 58) + 'px';
    ta.addEventListener('input', () => autoExpand(ta));
    return ta;
}

function createMatrixRow(data = {}) {
    const tr = document.createElement('tr');
    tr.dataset.type = 'data';

    // Performance Measure
    const tdPM = document.createElement('td');
    const taPM = makeTA('Performance measure...');
    taPM.dataset.key = 'performance_measure';
    taPM.value = data.performance_measure || '';
    tdPM.appendChild(taPM); tr.appendChild(tdPM);

    // Operational Definition
    const tdOD = document.createElement('td');
    const taOD = makeTA('Operational definition...');
    taOD.dataset.key = 'operational_definition';
    taOD.value = data.operational_definition || '';
    tdOD.appendChild(taOD); tr.appendChild(tdOD);

    // Dimension cells (Q, E, T) — display only
    ['quality','efficiency','timeliness'].forEach(key => {
        const td = document.createElement('td');
        td.dataset.key = key;
        tr.appendChild(td);
    });

    // Source / Monitoring
    const tdSrc = document.createElement('td');
    const taSrc = makeTA('Source / Monitoring tool...');
    taSrc.dataset.key = 'source_monitoring';
    taSrc.value = data.source_monitoring || '';
    tdSrc.appendChild(taSrc); tr.appendChild(tdSrc);

    // Scale view button
    const tdV = document.createElement('td');
    tdV.className = 'col-view';
    tdV.style.cssText = 'text-align:center;vertical-align:middle;padding:4px 2px;';
    const vBtn = document.createElement('button');
    vBtn.type = 'button'; vBtn.className = 'row-view-btn';
    vBtn.textContent = 'view'; vBtn.onclick = openScaleModal;
    tdV.appendChild(vBtn); tr.appendChild(tdV);

    // Delete button
    const tdD = document.createElement('td');
    tdD.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button');
    dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdD.appendChild(dBtn); tr.appendChild(tdD);

    return tr;
}

function createSectionRow(label = '') {
    const tr = document.createElement('tr');
    tr.className = 'section-row'; tr.dataset.type = 'section';
    const td = document.createElement('td'); td.colSpan = 7;
    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = 'Section name (e.g. CORE FUNCTION)';
    inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:700;font-size:10px;outline:none;text-align:center;';
    inp.dataset.key = 'section_label';
    inp.value = label;
    td.appendChild(inp);
    const tdD = document.createElement('td');
    tdD.style.cssText = 'border:none;background:var(--sec-bg);text-align:center;vertical-align:middle;width:26px;';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'remove-btn';
    btn.innerHTML = '&times;'; btn.onclick = () => tr.remove();
    tdD.appendChild(btn); tr.appendChild(td); tr.appendChild(tdD);
    return tr;
}

document.getElementById('addRowBtn').addEventListener('click', () => {
    const tr = createMatrixRow();
    document.getElementById('matrixBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('addSectionBtn').addEventListener('click', () => {
    const tr = createSectionRow();
    document.getElementById('matrixBody').appendChild(tr);
    tr.querySelector('input').focus();
});

/* ── Read current SPCR form into a plain object ── */
function readMatrixForm() {
    const items = [];
    document.querySelectorAll('#matrixBody tr').forEach(tr => {
        if (tr.classList.contains('section-row')) {
            const inp = tr.querySelector('input[data-key="section_label"]');
            items.push({ is_section: true, section_label: inp ? inp.value.trim() : '' });
        } else if (tr.dataset.type === 'data') {
            const obj = { is_section: false, quality: '', efficiency: '', timeliness: '' };
            tr.querySelectorAll('[data-key]').forEach(el => {
                if (el.tagName !== 'TD') obj[el.dataset.key] = el.value.trim();
            });
            items.push(obj);
        }
    });
    return {
        prepared_by:       document.getElementById('s_prepared_by').value.trim(),
        prepared_by_title: document.getElementById('s_prepared_by_title').value.trim(),
        reviewed_by:       document.getElementById('s_reviewed_by').value.trim(),
        reviewed_by_title: document.getElementById('s_reviewed_by_title').value.trim(),
        approved_by:       document.getElementById('s_approved_by').value.trim(),
        approved_by_title: document.getElementById('s_approved_by_title').value.trim(),
        items,
    };
}

/* ── Save Matrix → POST /api/spcr-matrix ── */
document.getElementById('saveBtn').addEventListener('click', async () => {
    const data = readMatrixForm();
    if (!data.prepared_by) {
        showAlert('s-alertErr', 'err', 'Please fill in the "Prepared By" field.');
        return;
    }
    try {
        const res = await apiFetch('/api/spcr-matrix', 'POST', data);
        DB_matrices.unshift({
            id:                res.matrix.id,
            prepared_by:       res.matrix.prepared_by,
            prepared_by_title: res.matrix.prepared_by_title,
            reviewed_by:       res.matrix.reviewed_by,
            approved_by:       res.matrix.approved_by,
            saved_at:          new Date(res.matrix.created_at).toLocaleString('en-PH', { hour12: true }),
        });
        renderMatrixList();
        showAlert('s-alertOk', 'ok', `✔ Matrix saved (Record #${res.matrix.id}). You can now push it to DPCR.`);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

/* ── Clear SPCR form ── */
document.getElementById('clearBtn').addEventListener('click', () => {
    if (!confirm('Clear all SPCR fields and rows?')) return;
    ['s_prepared_by','s_prepared_by_title','s_reviewed_by','s_reviewed_by_title','s_approved_by','s_approved_by_title']
        .forEach(id => document.getElementById(id).value = '');
    document.getElementById('matrixBody').innerHTML = `
        <tr class="section-row">
            <td colspan="7">STRATEGIC FUNCTION</td>
            <td style="border:none;background:var(--sec-bg);"></td>
        </tr>`;
    syncShared();
});

/* ── Render the Saved Matrices table ── */
function renderMatrixList() {
    const c = document.getElementById('prevList');
    if (!DB_matrices.length) {
        c.innerHTML = '<p class="no-prev">No saved matrices yet.</p>';
        return;
    }
    let html = `<table class="prev-table"><thead><tr>
        <th>#</th><th>Prepared By</th><th>Title</th>
        <th>Reviewed By</th><th>Approved By</th><th>Saved At</th><th>Actions</th>
    </tr></thead><tbody>`;
    DB_matrices.forEach(m => {
        html += `<tr>
            <td>${m.id}</td>
            <td>${esc(m.prepared_by)}</td>
            <td>${esc(m.prepared_by_title || '—')}</td>
            <td>${esc(m.reviewed_by || '—')}</td>
            <td>${esc(m.approved_by || '—')}</td>
            <td>${esc(m.saved_at)}</td>
            <td style="display:flex;gap:4px;align-items:center;">
                <button class="badge-btn badge-view" onclick="viewMatrix(${m.id})">View</button>
                <button class="badge-btn badge-push" onclick="pushToDPCR(${m.id})">→ Push to DPCR</button>
                <button class="badge-btn badge-del"  onclick="deleteMatrix(${m.id})">Delete</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    c.innerHTML = html;
}

/* ── View a saved matrix → GET /api/spcr-matrix/:id ── */
async function viewMatrix(id) {
    try {
        const m = await apiFetch(`/api/spcr-matrix/${id}`);
        document.getElementById('viewModalTitle').textContent = `Matrix #${m.id}`;
        let html = `<div class="view-meta">
            <div><span>Prepared By: </span><strong>${esc(m.prepared_by)}</strong>
                ${m.prepared_by_title ? `<em style="color:#555;font-size:10px;">(${esc(m.prepared_by_title)})</em>` : ''}</div>
            <div><span>Reviewed By: </span><strong>${esc(m.reviewed_by || '—')}</strong></div>
            <div><span>Approved By: </span><strong>${esc(m.approved_by || '—')}</strong></div>
        </div>
        <table class="view-tbl"><thead><tr>
            <th style="width:15%">PERFORMANCE MEASURE</th>
            <th style="width:20%">OPERATIONAL DEFINITION</th>
            <th style="width:15%">QUALITY (Q)</th>
            <th style="width:15%">EFFICIENCY (E)</th>
            <th style="width:15%">TIMELINESS (T)</th>
            <th style="width:10%">SOURCE OF DATA</th>
        </tr></thead><tbody>`;
        (m.items || []).forEach(item => {
            if (item.is_section) {
                html += `<tr class="sec-row"><td colspan="6">${esc(item.section_label || 'SECTION')}</td></tr>`;
            } else {
                html += `<tr>
                    <td>${esc(item.performance_measure || '')}</td>
                    <td>${esc(item.operational_definition || '')}</td>
                    <td>${esc(item.quality || '')}</td>
                    <td>${esc(item.efficiency || '')}</td>
                    <td>${esc(item.timeliness || '')}</td>
                    <td>${esc(item.source_monitoring || '')}</td>
                </tr>`;
            }
        });
        html += '</tbody></table>';
        document.getElementById('viewModalContent').innerHTML = html;
        document.getElementById('viewModal').classList.add('open');
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Could not load matrix: ' + err.message);
    }
}

/* ── Delete → DELETE /api/spcr-matrix/:id ── */
async function deleteMatrix(id) {
    if (!confirm(`Delete Matrix #${id}?`)) return;
    try {
        await apiFetch(`/api/spcr-matrix/${id}`, 'DELETE');
        DB_matrices = DB_matrices.filter(m => m.id !== id);
        renderMatrixList();
        showAlert('s-alertOk', 'ok', `Matrix #${id} deleted.`);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Delete failed: ' + err.message);
    }
}

/* ══════════════════════════════════════════
   PUSH SPCR → DPCR
══════════════════════════════════════════ */
async function pushToDPCR(id) {
    try {
        const m = await apiFetch(`/api/spcr-matrix/${id}`);
        const body = document.getElementById('dpcrBody');

        (m.items || []).forEach(item => {
            if (item.is_section) {
                const tr = document.createElement('tr');
                tr.className = 'section-header';
                const td = document.createElement('td'); td.colSpan = 12;
                td.textContent = item.section_label || 'SECTION';
                tr.appendChild(td); body.appendChild(tr);
            } else {
                const tr = createDpcrRow({
                    strategic_goal:        item.operational_definition,
                    performance_indicator: item.performance_measure,
                    remarks:               item.source_monitoring,
                    rating_q:              !!item.quality,
                    rating_e:              !!item.efficiency,
                    rating_t:              !!item.timeliness,
                });
                body.appendChild(tr);
                tr.querySelectorAll('textarea').forEach(autoExpand);
            }
        });

        document.getElementById('d_emp_name').value    = m.prepared_by;
        document.getElementById('d_emp_title').value   = m.prepared_by_title || '';
        document.getElementById('d_approved_by').value = m.approved_by || '';
        document.getElementById('d_disp_name').textContent = m.prepared_by || '\u00a0';

        const banner = document.getElementById('transferBanner');
        const count  = (m.items || []).filter(i => !i.is_section).length;
        banner.textContent = `✔ Matrix #${id} (${m.prepared_by}) pushed — ${count} row(s) added.`;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 5000);

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('page-dpcr').classList.add('active');
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Push failed: ' + err.message);
    }
}

/* ══════════════════════════════════════════
   DPCR — ROW FACTORY
══════════════════════════════════════════ */
function createDpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // Strategic Goal
    const tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    // Performance Indicator
    const tdInd = document.createElement('td');
    const indTA = document.createElement('textarea');
    indTA.placeholder = 'Performance/Success indicator…'; indTA.value = data.performance_indicator || '';
    indTA.addEventListener('input', () => autoExpand(indTA));
    tdInd.appendChild(indTA); tr.appendChild(tdInd);

    // Budget
    const tdB = document.createElement('td');
    const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.value = data.allotted_budget || '';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    // Section Accountable
    const tdS = document.createElement('td');
    const sel = document.createElement('select');
    SECTS.forEach(s => {
        const opt = document.createElement('option'); opt.value = s; opt.textContent = s;
        if (data.section_accountable === s) opt.selected = true;
        sel.appendChild(opt);
    });
    tdS.appendChild(sel); tr.appendChild(tdS);

    // Actual Accomplishment
    const tdA = document.createElement('td');
    const aTA = document.createElement('textarea');
    aTA.placeholder = '—'; aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', () => autoExpand(aTA));
    tdA.appendChild(aTA); tr.appendChild(tdA);

    // Rate
    const tdR = document.createElement('td'); tdR.style.textAlign = 'center';
    const rIn = document.createElement('input'); rIn.type = 'text'; rIn.placeholder = 'e.g. 85%';
    rIn.value = data.accomplishment_rate || ''; rIn.style.textAlign = 'center';
    tdR.appendChild(rIn); tr.appendChild(tdR);

    // Q E T A rating cells
    ['q','e','t','a'].forEach(() => {
        const td = document.createElement('td'); td.className = 'rating-cell';
        tr.appendChild(td);
    });

    // Remarks
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = '—'; remTA.value = data.remarks || '';
    remTA.addEventListener('input', () => autoExpand(remTA));
    tdRem.appendChild(remTA); tr.appendChild(tdRem);

    // Delete
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button'); dBtn.type = 'button';
    dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    return tr;
}

/* ── Read current DPCR form into plain object ── */
function readDpcrForm() {
    const items = [];
    document.querySelectorAll('#dpcrBody tr').forEach(tr => {
        if (tr.classList.contains('section-header')) return;
        const cells = tr.querySelectorAll('td');
        if (!cells.length) return;
        const goalTA = cells[0]?.querySelector('textarea');
        const indTA  = cells[1]?.querySelector('textarea');
        const bIn    = cells[2]?.querySelector('input');
        const sel    = cells[3]?.querySelector('select');
        const aTA    = cells[4]?.querySelector('textarea');
        const rIn    = cells[5]?.querySelector('input');
        const remTA  = cells[10]?.querySelector('textarea');
        if (!goalTA && !indTA) return;
        items.push({
            function_type:         'Strategic',
            strategic_goal:        goalTA?.value.trim()  || '',
            performance_indicator: indTA?.value.trim()   || '',
            allotted_budget:       bIn?.value.trim()     || null,
            section_accountable:   sel?.value            || 'ALL SECTIONS',
            actual_accomplishment: aTA?.value.trim()     || null,
            accomplishment_rate:   rIn?.value.trim()     || null,
            rating_q: false, rating_e: false, rating_t: false, rating_a: false,
            remarks:               remTA?.value.trim()   || null,
        });
    });
    return {
        employee_name:  document.getElementById('d_emp_name').value.trim(),
        employee_title: document.getElementById('d_emp_title').value.trim(),
        division:       'Admin',
        area:           'HOPSS',
        year:           new Date().getFullYear(),
        semester:       '1st',
        approved_by:    document.getElementById('d_approved_by').value.trim(),
        items,
    };
}

/* ── Save DPCR → POST /api/dpcr ── */
document.getElementById('dSaveBtn').addEventListener('click', async () => {
    const data = readDpcrForm();
    if (!data.employee_name) {
        showAlert('d-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        await apiFetch('/api/dpcr', 'POST', data);
        showAlert('d-alertOk', 'ok', `✔ DPCR for "${data.employee_name}" saved to database.`);
    } catch (err) {
        showAlert('d-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

document.getElementById('dAddRowBtn').addEventListener('click', () => {
    const tr = createDpcrRow();
    document.getElementById('dpcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('dAddSectionBtn').addEventListener('click', () => {
    const tr = document.createElement('tr'); tr.className = 'section-header';
    const td = document.createElement('td'); td.colSpan = 12;
    const inp = document.createElement('input'); inp.type = 'text';
    inp.placeholder = 'Section name (e.g. SUPPORT FUNCTIONS)';
    inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:bold;font-size:10px;outline:none;';
    const del = document.createElement('button'); del.type = 'button';
    del.className = 'remove-btn'; del.innerHTML = '&times;'; del.style.marginLeft = '8px';
    del.onclick = () => tr.remove();
    td.appendChild(inp); td.appendChild(del); tr.appendChild(td);
    document.getElementById('dpcrBody').appendChild(tr); inp.focus();
});

/* ══════════════════════════════════════════
   HYDRATE FROM DATABASE ON PAGE LOAD
   window.DB_LATEST_MATRIX and
   window.DB_LATEST_DPCR are injected by Blade
══════════════════════════════════════════ */
function hydrateSpcrForm(matrix) {
    if (!matrix) return;

    document.getElementById('s_prepared_by').value       = matrix.prepared_by       || '';
    document.getElementById('s_prepared_by_title').value = matrix.prepared_by_title || '';
    document.getElementById('s_reviewed_by').value       = matrix.reviewed_by       || '';
    document.getElementById('s_reviewed_by_title').value = matrix.reviewed_by_title || '';
    document.getElementById('s_approved_by').value       = matrix.approved_by       || '';
    document.getElementById('s_approved_by_title').value = matrix.approved_by_title || '';

    // Rebuild table rows from DB items
    document.getElementById('matrixBody').innerHTML = '';
    (matrix.items || []).forEach(item => {
        if (item.type === 'section') {
            document.getElementById('matrixBody').appendChild(
                createSectionRow(item.section_label || '')
            );
        } else {
            const tr = createMatrixRow({
                performance_measure:    item.performance_measure,
                operational_definition: item.operational_definition,
                source_monitoring:      item.source_monitoring,
            });
            document.getElementById('matrixBody').appendChild(tr);
            tr.querySelectorAll('textarea').forEach(autoExpand);
        }
    });
}

function hydrateDpcrForm(form) {
    if (!form) return;

    document.getElementById('d_emp_name').value    = form.employee_name  || '';
    document.getElementById('d_emp_title').value   = form.employee_title || '';
    document.getElementById('d_approved_by').value = form.approved_by    || '';
    document.getElementById('d_disp_name').textContent = form.employee_name || '\u00a0';

    // Rebuild DPCR rows from DB items
    document.getElementById('dpcrBody').innerHTML = '';
    (form.items || []).forEach(item => {
        const tr = createDpcrRow({
            strategic_goal:        item.strategic_goal,
            performance_indicator: item.performance_indicator,
            allotted_budget:       item.allotted_budget,
            section_accountable:   item.section_accountable,
            actual_accomplishment: item.actual_accomplishment,
            accomplishment_rate:   item.accomplishment_rate,
            rating_q:              item.rating_q,
            rating_e:              item.rating_e,
            rating_t:              item.rating_t,
            rating_a:              item.rating_a,
            remarks:               item.remarks,
        });
        document.getElementById('dpcrBody').appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
    });
}

/* ══════════════════════════════════════════
   INIT — runs once on page load
══════════════════════════════════════════ */
(function init() {
    // Render saved matrices list (seeded from DB via Blade)
    renderMatrixList();

    // Pre-fill SPCR form from latest DB record
    if (window.DB_LATEST_MATRIX) {
        hydrateSpcrForm(window.DB_LATEST_MATRIX);
    }

    // Pre-fill DPCR form from latest DB record
    if (window.DB_LATEST_DPCR) {
        hydrateDpcrForm(window.DB_LATEST_DPCR);
    }

    // Pre-fill IPCR form from latest DB record
    if (window.DB_LATEST_IPCR) {
        hydrateIpcrForm(window.DB_LATEST_IPCR);
    }
})();/* ══════════════════════════════════════════
   IPCR — ROW FACTORY
   Mirrors createDpcrRow() pattern exactly.
   Columns: Goal | Indicator | Actual | Rate | Q | E | T | A | Remarks | Del
══════════════════════════════════════════ */
function createIpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // Strategic Goal / Objective
    const tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal / objective…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    // Performance / Success Indicator
    const tdInd = document.createElement('td');
    const indTA = document.createElement('textarea');
    indTA.placeholder = 'Performance/Success Indicator (Targets + Measure)…';
    indTA.value = data.performance_indicator || '';
    indTA.addEventListener('input', () => autoExpand(indTA));
    tdInd.appendChild(indTA); tr.appendChild(tdInd);

    // Actual Accomplishment
    const tdA = document.createElement('td');
    const aTA = document.createElement('textarea');
    aTA.placeholder = 'Actual accomplishment…'; aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', () => autoExpand(aTA));
    tdA.appendChild(aTA); tr.appendChild(tdA);

    // Accomplishment Rate
    const tdR = document.createElement('td'); tdR.style.textAlign = 'center';
    const rIn = document.createElement('input'); rIn.type = 'text';
    rIn.placeholder = '100%'; rIn.value = data.accomplishment_rate || '';
    rIn.style.textAlign = 'center'; rIn.style.width = '100%';
    tdR.appendChild(rIn); tr.appendChild(tdR);

    // Q E T A rating cells — numeric inputs (1–5)
    ['rating_q','rating_e','rating_t','rating_a'].forEach(key => {
        const td = document.createElement('td'); td.className = 'rating-cell';
        const inp = document.createElement('input'); inp.type = 'number';
        inp.min = '1'; inp.max = '5'; inp.step = '0.01';
        inp.placeholder = '—'; inp.value = data[key] != null ? data[key] : '';
        inp.style.cssText = 'width:100%;text-align:center;border:none;outline:none;background:transparent;font-size:10px;';
        td.appendChild(inp); tr.appendChild(td);
    });

    // Remarks / Justification & Unmet Targets
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = 'Remarks / Justification…'; remTA.value = data.remarks || '';
    remTA.addEventListener('input', () => autoExpand(remTA));
    tdRem.appendChild(remTA); tr.appendChild(tdRem);

    // Delete button
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button'); dBtn.type = 'button';
    dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    return tr;
}

/* ── Read current IPCR form into plain object ── */
function readIpcrForm() {
    const items = [];
    let currentFunctionType = 'Core';

    document.querySelectorAll('#ipcrBody tr').forEach(tr => {
        if (tr.classList.contains('section-header')) {
            // Detect section type from header text
            const txt = (tr.querySelector('td')?.textContent || '').toUpperCase();
            if (txt.includes('SUPPORT')) currentFunctionType = 'Support';
            else if (txt.includes('CORE'))    currentFunctionType = 'Core';
            return;
        }
        const cells = tr.querySelectorAll('td');
        if (!cells.length) return;

        const goalTA = cells[0]?.querySelector('textarea');
        const indTA  = cells[1]?.querySelector('textarea');
        const aTA    = cells[2]?.querySelector('textarea');
        const rIn    = cells[3]?.querySelector('input');
        const qIn    = cells[4]?.querySelector('input');
        const eIn    = cells[5]?.querySelector('input');
        const tIn    = cells[6]?.querySelector('input');
        const aRIn   = cells[7]?.querySelector('input');
        const remTA  = cells[8]?.querySelector('textarea');

        if (!goalTA && !indTA) return;

        items.push({
            function_type:          currentFunctionType,
            strategic_goal:         goalTA?.value.trim()  || '',
            performance_indicator:  indTA?.value.trim()   || '',
            actual_accomplishment:  aTA?.value.trim()     || null,
            accomplishment_rate:    rIn?.value.trim()     || null,
            rating_q:               qIn?.value   ? parseFloat(qIn.value)   : null,
            rating_e:               eIn?.value   ? parseFloat(eIn.value)   : null,
            rating_t:               tIn?.value   ? parseFloat(tIn.value)   : null,
            rating_a:               aRIn?.value  ? parseFloat(aRIn.value)  : null,
            remarks:                remTA?.value.trim()   || null,
        });
    });

    return {
        employee_name:     document.getElementById('i_emp_name').value.trim(),
        employee_position: document.getElementById('i_emp_position').value.trim(),
        employee_unit:     document.getElementById('i_emp_unit').value.trim(),
        period:            document.getElementById('i_period').value.trim(),
        supervisor:        document.getElementById('i_supervisor').value.trim(),
        approved_by:       document.getElementById('i_approved_by').value.trim(),
        recommending:      document.getElementById('i_recommending').value.trim(),
        year:              new Date().getFullYear(),
        semester:          '1st',
        pct_core:          document.getElementById('i_pct_core').value.trim(),
        pct_support:       document.getElementById('i_pct_support').value.trim(),
        avg_core:          document.getElementById('i_avg_core').value.trim(),
        avg_support:       document.getElementById('i_avg_support').value.trim(),
        final_avg:         document.getElementById('i_final_avg').textContent.trim(),
        adjectival_rating: document.getElementById('i_adjectival').textContent.trim(),
        items,
    };
}

/* ── Auto-compute final average & adjectival rating ── */
function computeIpcrSummary() {
    const pctCore    = parseFloat(document.getElementById('i_pct_core').value)    / 100 || 0.70;
    const pctSupport = parseFloat(document.getElementById('i_pct_support').value) / 100 || 0.30;
    const avgCore    = parseFloat(document.getElementById('i_avg_core').value)    || 0;
    const avgSupport = parseFloat(document.getElementById('i_avg_support').value) || 0;

    const finalCore    = avgCore    * pctCore;
    const finalSupport = avgSupport * pctSupport;
    const finalAvg     = finalCore + finalSupport;

    document.getElementById('i_final_core').textContent    = finalCore    ? finalCore.toFixed(8)    : '—';
    document.getElementById('i_final_support').textContent = finalSupport ? finalSupport.toFixed(8) : '—';
    document.getElementById('i_final_avg').textContent     = finalAvg     ? finalAvg.toFixed(2)     : '—';

    let adj = '—';
    if (finalAvg >= 5)         adj = 'Outstanding';
    else if (finalAvg >= 4)    adj = 'Very Satisfactory';
    else if (finalAvg >= 3)    adj = 'Satisfactory';
    else if (finalAvg >= 2)    adj = 'Unsatisfactory';
    else if (finalAvg >= 1)    adj = 'Poor';
    document.getElementById('i_adjectival').textContent = adj;
}

/* ── Sync display name spans as user types ── */
document.getElementById('i_emp_name').addEventListener('input', function () {
    document.getElementById('i_disp_name').textContent  = this.value || '\u00a0';
    document.getElementById('i_disp_name2').textContent = this.value || '\u00a0';
});
document.getElementById('i_supervisor').addEventListener('input', function () {
    document.getElementById('i_disp_supervisor').textContent = this.value || '\u00a0';
});
document.getElementById('i_approved_by').addEventListener('input', function () {
    document.getElementById('i_disp_approved').textContent = this.value || '\u00a0';
});

/* ── Summary recompute on input change ── */
['i_pct_core','i_pct_support','i_avg_core','i_avg_support'].forEach(id => {
    document.getElementById(id).addEventListener('input', computeIpcrSummary);
});

/* ── Save IPCR → POST /api/ipcr ── */
document.getElementById('iSaveBtn').addEventListener('click', async () => {
    const data = readIpcrForm();
    if (!data.employee_name) {
        showAlert('i-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        await apiFetch('/api/ipcr', 'POST', data);
        showAlert('i-alertOk', 'ok', `✔ IPCR for "${data.employee_name}" saved to database.`);
    } catch (err) {
        showAlert('i-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

/* ── Add Row ── */
document.getElementById('iAddRowBtn').addEventListener('click', () => {
    const tr = createIpcrRow();
    document.getElementById('ipcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

/* ── Add Section ── */
document.getElementById('iAddSectionBtn').addEventListener('click', () => {
    const tr = document.createElement('tr'); tr.className = 'section-header';
    const td = document.createElement('td'); td.colSpan = 10;
    const inp = document.createElement('input'); inp.type = 'text';
    inp.placeholder = 'Section name (e.g. SUPPORT FUNCTIONS)';
    inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:bold;font-size:10px;outline:none;';
    const del = document.createElement('button'); del.type = 'button';
    del.className = 'remove-btn'; del.innerHTML = '&times;'; del.style.marginLeft = '8px';
    del.onclick = () => tr.remove();
    td.appendChild(inp); td.appendChild(del); tr.appendChild(td);
    document.getElementById('ipcrBody').appendChild(tr); inp.focus();
});

/* ── Clear Form ── */
document.getElementById('iClearBtn').addEventListener('click', () => {
    if (!confirm('Clear all IPCR data?')) return;
    ['i_emp_name','i_emp_position','i_emp_unit','i_period',
     'i_supervisor','i_approved_by','i_recommending'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('i_disp_name').textContent       = '\u00a0';
    document.getElementById('i_disp_name2').textContent      = '\u00a0';
    document.getElementById('i_disp_supervisor').textContent = '\u00a0';
    document.getElementById('i_disp_approved').textContent   = '\u00a0';
    document.getElementById('ipcrBody').innerHTML =
        '<tr class="section-header"><td colspan="10">CORE FUNCTIONS :</td></tr>';
    document.getElementById('i_avg_core').value    = '';
    document.getElementById('i_avg_support').value = '';
    computeIpcrSummary();
});

/* ── Hydrate IPCR from DB record ── */
function hydrateIpcrForm(form) {
    if (!form) return;
    document.getElementById('i_emp_name').value      = form.employee_name     || '';
    document.getElementById('i_emp_position').value  = form.employee_position || '';
    document.getElementById('i_emp_unit').value      = form.employee_unit     || '';
    document.getElementById('i_period').value        = form.period            || '';
    document.getElementById('i_supervisor').value    = form.supervisor        || '';
    document.getElementById('i_approved_by').value   = form.approved_by       || '';
    document.getElementById('i_recommending').value  = form.recommending      || '';
    document.getElementById('i_pct_core').value      = form.pct_core          || '70%';
    document.getElementById('i_pct_support').value   = form.pct_support       || '30%';
    document.getElementById('i_avg_core').value      = form.avg_core          || '';
    document.getElementById('i_avg_support').value   = form.avg_support       || '';

    document.getElementById('i_disp_name').textContent       = form.employee_name || '\u00a0';
    document.getElementById('i_disp_name2').textContent      = form.employee_name || '\u00a0';
    document.getElementById('i_disp_supervisor').textContent = form.supervisor     || '\u00a0';
    document.getElementById('i_disp_approved').textContent   = form.approved_by   || '\u00a0';

    document.getElementById('ipcrBody').innerHTML = '';
    (form.items || []).forEach(item => {
        const tr = createIpcrRow({
            strategic_goal:        item.strategic_goal,
            performance_indicator: item.performance_indicator,
            actual_accomplishment: item.actual_accomplishment,
            accomplishment_rate:   item.accomplishment_rate,
            rating_q:              item.rating_q,
            rating_e:              item.rating_e,
            rating_t:              item.rating_t,
            rating_a:              item.rating_a,
            remarks:               item.remarks,
        });
        document.getElementById('ipcrBody').appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
    });

    computeIpcrSummary();
}

/* ── switchTab already handles 'ipcr' by ID — no changes needed ── */