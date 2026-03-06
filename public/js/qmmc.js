/* ═══════════════════════════════════════════
   QMMC – SPCR Matrix & DPCR  |  app.js
   public/js/qmmc.js
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   SHARED STATE
══════════════════════════════════════════ */
const DB = { matrices: [], dpcrRecords: [], nextMatrixId: 1, nextDpcrId: 1 };

const SECTIONS = [
    'ALL SECTIONS', 'EFMS', 'IMISS', 'PMG / EFMS / PROCUREMENT',
    'NURSING', 'MEDICAL', 'ADMINISTRATIVE', 'FINANCE', 'PHARMACY'
];

/* ── Tab switching ── */
function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    event.currentTarget.classList.add('active');
}

/* ── Keyboard ── */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeScaleModal(); closeViewModal(); }
});

/* ── Modals ── */
function openScaleModal()  { document.getElementById('scaleModal').classList.add('open'); }
function closeScaleModal() { document.getElementById('scaleModal').classList.remove('open'); }
function closeViewModal()  { document.getElementById('viewModal').classList.remove('open'); }

/* ── Alerts ── */
function showAlert(elId, type, msg) {
    const el = document.getElementById(elId);
    el.className = type === 'ok' ? 'alert-ok' : type === 'info' ? 'alert-info' : 'alert-err';
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4500);
}

/* ── Auto-expand textareas ── */
function autoExpand(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

/* ── HTML escape ── */
function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════
   SYNC: SPCR ↔ DPCR shared fields
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

function syncSharedReverse() {
    const name     = document.getElementById('d_emp_name').value;
    const title    = document.getElementById('d_emp_title').value;
    const approved = document.getElementById('d_approved_by').value;
    document.getElementById('s_prepared_by').value       = name;
    document.getElementById('s_prepared_by_title').value = title;
    document.getElementById('s_approved_by').value       = approved;
    document.getElementById('d_disp_name').textContent   = name || '\u00a0';
}

/* ══════════════════════════════════════════
   SPCR — ROW FACTORY
══════════════════════════════════════════ */
function makeTA(placeholder, minH) {
    const ta = document.createElement('textarea');
    ta.placeholder = placeholder;
    ta.style.minHeight = (minH || 58) + 'px';
    ta.addEventListener('input', () => autoExpand(ta));
    return ta;
}

function makeDimTable(key) {
    const td = document.createElement('td');
    td.dataset.key = key;
    return td;
}

function createMatrixRow(data = {}) {
    const tr = document.createElement('tr');
    tr.dataset.type = 'data';

    // Performance Measure
    const tdPM = document.createElement('td');
    const taPM = makeTA('Performance measure...');
    taPM.dataset.key = 'performance_measure';
    taPM.value = data.performance_measure || '';
    tdPM.appendChild(taPM);
    tr.appendChild(tdPM);

    // Operational Definition
    const tdOD = document.createElement('td');
    const taOD = makeTA('Operational definition...');
    taOD.dataset.key = 'operational_definition';
    taOD.value = data.operational_definition || '';
    tdOD.appendChild(taOD);
    tr.appendChild(tdOD);

    // Auto-generated dimension table cells
    tr.appendChild(makeDimTable('quality'));
    tr.appendChild(makeDimTable('efficiency'));
    tr.appendChild(makeDimTable('timeliness'));

    // Source / Monitoring
    const tdSrc = document.createElement('td');
    const taSrc = makeTA('Source / Monitoring tool...');
    taSrc.dataset.key = 'source_monitoring';
    taSrc.value = data.source_monitoring || '';
    tdSrc.appendChild(taSrc);
    tr.appendChild(tdSrc);

    // Scale view button
    const tdV = document.createElement('td');
    tdV.className = 'col-view';
    tdV.style.cssText = 'text-align:center;vertical-align:middle;padding:4px 2px;';
    const vBtn = document.createElement('button');
    vBtn.type = 'button';
    vBtn.className = 'row-view-btn';
    vBtn.textContent = 'view';
    vBtn.onclick = openScaleModal;
    tdV.appendChild(vBtn);
    tr.appendChild(tdV);

    // Delete
    const tdD = document.createElement('td');
    tdD.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button');
    dBtn.type = 'button';
    dBtn.className = 'remove-btn';
    dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdD.appendChild(dBtn);
    tr.appendChild(tdD);

    return tr;
}

/* ── Section row ── */
function addMatrixSection() {
    const tr = document.createElement('tr');
    tr.className = 'section-row';
    tr.dataset.type = 'section';

    const td = document.createElement('td');
    td.colSpan = 7;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Section name (e.g. CORE FUNCTION)';
    inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:700;font-size:10px;outline:none;text-align:center;';
    inp.dataset.key = 'section_label';
    td.appendChild(inp);

    const tdD = document.createElement('td');
    tdD.style.cssText = 'border:none;background:var(--sec-bg);text-align:center;vertical-align:middle;width:26px;';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remove-btn';
    btn.innerHTML = '&times;';
    btn.onclick = () => tr.remove();
    tdD.appendChild(btn);

    tr.appendChild(td);
    tr.appendChild(tdD);
    document.getElementById('matrixBody').appendChild(tr);
    inp.focus();
}

document.getElementById('addSectionBtn').addEventListener('click', addMatrixSection);

document.getElementById('addRowBtn').addEventListener('click', () => {
    const tr = createMatrixRow();
    document.getElementById('matrixBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

/* ── Read SPCR form ── */
function readMatrixForm() {
    const items = [];
    document.querySelectorAll('#matrixBody tr').forEach(tr => {
        if (tr.classList.contains('section-row')) {
            const inp = tr.querySelector('input[data-key="section_label"]');
            items.push({ type: 'section', section_label: inp ? inp.value.trim() : 'SECTION' });
        } else if (tr.dataset.type === 'data') {
            const obj = { type: 'data' };
            tr.querySelectorAll('[data-key]').forEach(el => {
                if (el.tagName === 'TD') {
                    obj[el.dataset.key] = el.dataset.key;
                } else {
                    obj[el.dataset.key] = el.value.trim();
                }
            });
            obj.quality    = true;
            obj.efficiency = true;
            obj.timeliness = true;
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
        saved_at:          new Date().toLocaleString('en-PH', { hour12: true }),
        items
    };
}

/* ── Save Matrix ── */
document.getElementById('saveBtn').addEventListener('click', () => {
    const data = readMatrixForm();
    if (!data.prepared_by) {
        showAlert('s-alertErr', 'err', 'Please fill in the "Prepared By" field.');
        return;
    }
    data.id = DB.nextMatrixId++;
    DB.matrices.unshift(data);
    renderMatrixList();
    showAlert('s-alertOk', 'ok', `✔ Matrix saved (Record #${data.id}). You can now push it to DPCR.`);
});

/* ── Clear SPCR ── */
document.getElementById('clearBtn').addEventListener('click', () => {
    if (!confirm('Clear all SPCR fields and rows?')) return;
    ['s_prepared_by', 's_prepared_by_title', 's_reviewed_by', 's_reviewed_by_title', 's_approved_by', 's_approved_by_title']
        .forEach(id => document.getElementById(id).value = '');
    document.getElementById('matrixBody').innerHTML = `
        <tr class="section-row">
            <td colspan="7">STRATEGIC FUNCTION</td>
            <td style="border:none;background:var(--sec-bg);"></td>
        </tr>`;
    loadMatrixDefaults();
    syncShared();
});

/* ── Render saved matrices list ── */
function renderMatrixList() {
    const c = document.getElementById('prevList');
    if (!DB.matrices.length) {
        c.innerHTML = '<p class="no-prev">No saved matrices yet.</p>';
        return;
    }
    let html = `<table class="prev-table"><thead><tr>
        <th>#</th><th>Prepared By</th><th>Title</th>
        <th>Reviewed By</th><th>Approved By</th><th>Saved At</th><th>Actions</th>
    </tr></thead><tbody>`;
    DB.matrices.forEach(m => {
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

/* ── View saved matrix ── */
function viewMatrix(id) {
    const m = DB.matrices.find(x => x.id === id);
    if (!m) return;
    document.getElementById('viewModalTitle').textContent = `Matrix #${m.id} — ${m.saved_at}`;
    let html = `<div class="view-meta">
        <div><span>Prepared By: </span><strong>${esc(m.prepared_by)}</strong>${m.prepared_by_title ? ' <em style="color:#555;font-size:10px;">(' + esc(m.prepared_by_title) + ')</em>' : ''}</div>
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
    m.items.forEach(item => {
        if (item.type === 'section') {
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
}

/* ── Delete matrix ── */
function deleteMatrix(id) {
    if (!confirm(`Delete Matrix #${id}?`)) return;
    const i = DB.matrices.findIndex(x => x.id === id);
    if (i > -1) DB.matrices.splice(i, 1);
    renderMatrixList();
    showAlert('s-alertOk', 'ok', `Matrix #${id} deleted.`);
}

/* ══════════════════════════════════════════
   PUSH SPCR → DPCR
══════════════════════════════════════════ */
function pushToDPCR(id) {
    const m = DB.matrices.find(x => x.id === id);
    if (!m) return;

    const body = document.getElementById('dpcrBody');

    m.items.forEach(item => {
        if (item.type === 'section') {
            const tr = document.createElement('tr');
            tr.className = 'section-header';
            const td = document.createElement('td');
            td.colSpan = 12;
            td.textContent = item.section_label || 'SECTION';
            tr.appendChild(td);
            body.appendChild(tr);
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

    // Sync signatories
    document.getElementById('d_emp_name').value    = m.prepared_by;
    document.getElementById('d_emp_title').value   = m.prepared_by_title;
    document.getElementById('d_approved_by').value = m.approved_by;
    document.getElementById('d_disp_name').textContent = m.prepared_by || '\u00a0';

    // Banner
    const banner = document.getElementById('transferBanner');
    banner.textContent = `✔ Matrix #${id} (${m.prepared_by}) pushed — ${m.items.filter(i => i.type === 'data').length} row(s) added.`;
    banner.style.display = 'block';
    setTimeout(() => { banner.style.display = 'none'; }, 5000);

    // Switch tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('page-dpcr').classList.add('active');
}

/* ══════════════════════════════════════════
   DPCR — ROW FACTORY
══════════════════════════════════════════ */
function createDpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // Strategic Goal
    const tdGoal = document.createElement('td');
    tdGoal.className = 'goal-cell';
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal…';
    goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA);
    tr.appendChild(tdGoal);

    // Performance Indicator
    const tdInd = document.createElement('td');
    const indTA = document.createElement('textarea');
    indTA.placeholder = 'Performance/Success indicator…';
    indTA.value = data.performance_indicator || '';
    indTA.addEventListener('input', () => autoExpand(indTA));
    tdInd.appendChild(indTA);
    tr.appendChild(tdInd);

    // Budget
    const tdB = document.createElement('td');
    const bIn = document.createElement('input');
    bIn.type = 'text';
    bIn.placeholder = '—';
    bIn.value = data.allotted_budget || '';
    tdB.appendChild(bIn);
    tr.appendChild(tdB);

    // Section Accountable
    const tdS = document.createElement('td');
    const sel = document.createElement('select');
    SECTIONS.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (data.section_accountable === s) opt.selected = true;
        sel.appendChild(opt);
    });
    tdS.appendChild(sel);
    tr.appendChild(tdS);

    // Actual Accomplishment
    const tdA = document.createElement('td');
    const aTA = document.createElement('textarea');
    aTA.placeholder = '—';
    aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', () => autoExpand(aTA));
    tdA.appendChild(aTA);
    tr.appendChild(tdA);

    // Rate
    const tdR = document.createElement('td');
    tdR.style.textAlign = 'center';
    const rIn = document.createElement('input');
    rIn.type = 'text';
    rIn.placeholder = 'e.g. 85%';
    rIn.value = data.accomplishment_rate || '';
    rIn.style.textAlign = 'center';
    tdR.appendChild(rIn);
    tr.appendChild(tdR);

    // Q E T A rating cells
    ['q', 'e', 't', 'a'].forEach(() => {
        const td = document.createElement('td');
        td.className = 'rating-cell';
        tr.appendChild(td);
    });

    // Remarks
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = '—';
    remTA.value = data.remarks || '';
    remTA.addEventListener('input', () => autoExpand(remTA));
    tdRem.appendChild(remTA);
    tr.appendChild(tdRem);

    // Delete
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button');
    dBtn.type = 'button';
    dBtn.className = 'remove-btn';
    dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdDel.appendChild(dBtn);
    tr.appendChild(tdDel);

    return tr;
}

/* ── DPCR add row/section ── */
document.getElementById('dAddRowBtn').addEventListener('click', () => {
    const tr = createDpcrRow();
    document.getElementById('dpcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('dAddSectionBtn').addEventListener('click', () => {
    const tr = document.createElement('tr');
    tr.className = 'section-header';
    const td = document.createElement('td');
    td.colSpan = 12;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Section name (e.g. SUPPORT FUNCTIONS)';
    inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:bold;font-size:10px;outline:none;';
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'remove-btn';
    del.innerHTML = '&times;';
    del.style.marginLeft = '8px';
    del.onclick = () => tr.remove();
    td.appendChild(inp);
    td.appendChild(del);
    tr.appendChild(td);
    document.getElementById('dpcrBody').appendChild(tr);
    inp.focus();
});

/* ── Save DPCR ── */
document.getElementById('dSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('d_emp_name').value.trim();
    if (!name) {
        showAlert('d-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    showAlert('d-alertOk', 'ok', `✔ DPCR for "${name}" saved successfully.`);
});

/* ══════════════════════════════════════════
   DEFAULT SPCR ROWS
══════════════════════════════════════════ */
function loadMatrixDefaults() {
    const defaults = [
        {
            performance_measure: '100% of the PGS Strategic deliverables are achieved within the prescribed timeline.',
            operational_definition: 'This indicator shall cover compliance to PGS Strategic Deliverables and Commitments of every sections which will appear in PGS Deliverables Monitoring tool.',
            source_monitoring: 'PGS Deliverable Monitoring'
        },
        {
            performance_measure: '90% compliance with the Green Viability Assessment (GVA) by June 2025.',
            operational_definition: '',
            source_monitoring: 'GVA Compliance Checklist'
        }
    ];
    defaults.forEach(d => {
        const tr = createMatrixRow(d);
        document.getElementById('matrixBody').appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
    });
}

/* ── DEFAULT DPCR ROWS ── */
function loadDpcrDefaults() {
    const rows = [
        { strategic_goal: 'Ensure safe health facilities and quality services',      performance_indicator: '100% of the PGS Strategic deliverables are achieved within the prescribed timeline.',                    section_accountable: 'ALL SECTIONS',             accomplishment_rate: 'NA', rating_e: true, rating_t: true },
        { strategic_goal: '',                                                         performance_indicator: '90% compliance with the Green Viability Assessment (GVA) by June 2025.',                                 section_accountable: 'EFMS',                    accomplishment_rate: 'NA', rating_e: true, rating_t: true },
        { strategic_goal: 'Implementation of Electronic Medical Record (EMR)',        performance_indicator: '73% among elected hospital areas are provided with Electronic Medical Record (EMR) system within the prescribed timeline.', section_accountable: 'IMISS',   accomplishment_rate: 'NA', rating_e: true, rating_t: true },
        { strategic_goal: 'Upgrading of QMMC infrastructures and facilities',        performance_indicator: '50% of the approved Infrastructure and Equipment projects are bidded and prepared for implementation by June 2025.',        section_accountable: 'PMG / EFMS / PROCUREMENT', rating_q: true, rating_e: true, rating_t: true },
        { strategic_goal: 'Ensure compliance with cross-cutting requirements',       performance_indicator: 'At least one (1) Electronic / Less Paper Transaction is completely developed and implemented within the year.',             section_accountable: 'IMISS',   rating_q: true, rating_e: true, rating_t: true }
    ];
    rows.forEach(d => {
        const tr = createDpcrRow(d);
        document.getElementById('dpcrBody').appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
    });
}

/* ── INIT ── */
loadMatrixDefaults();
loadDpcrDefaults();
renderMatrixList();