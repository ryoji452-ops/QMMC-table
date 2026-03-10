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
const SECTS = window.SECTIONS    || [
    'ALL SECTIONS', 'EFMS', 'IMISS', 'PMG / EFMS / PROCUREMENT',
    'CAO', 'EFMS AND HEMS', 'HRMS/HRMPSB',
    'NURSING', 'MEDICAL', 'ADMINISTRATIVE', 'FINANCE', 'PHARMACY'
];

/* Performance/Success Indicator options (DPCR dropdown — each has a unique ID) */
const PERF_INDICATORS = [
    { id: 'PI-001', label: '100%' },
    { id: 'PI-002', label: '90%'  },
    { id: 'PI-003', label: '73%'  },
    { id: 'PI-004', label: '50%'  },
    { id: 'PI-005', label: 'At least 1' },
];

/* In-memory DPCR indicator registry: id → { rowEl, label, text } */
const DPCR_INDICATORS = new Map();   // keyed by PI-xxx id
/* In-memory SPCR indicator registry: rowEl → text */
const SPCR_INDICATORS = [];          // array of { rowEl }

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
function switchTab(tab, clickedBtn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    // Support both direct click (event.currentTarget) and programmatic call
    const btn = clickedBtn || (typeof event !== 'undefined' && event?.currentTarget)
              || [...document.querySelectorAll('.tab-btn')].find(b => b.getAttribute('onclick')?.includes(`'${tab}'`));
    if (btn) btn.classList.add('active');
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeScaleModal(); closeViewModal(); closeLinkModal(); }
});

/* ══════════════════════════════════════════
   MODALS
══════════════════════════════════════════ */
function openScaleModal()  { document.getElementById('scaleModal').classList.add('open'); }
function closeScaleModal() { document.getElementById('scaleModal').classList.remove('open'); }
function closeViewModal()  {
    document.getElementById('viewModal').classList.remove('open');
    document.getElementById('linkModal').classList.remove('open');
}

/* ── Link Modal: show a picker of rows from another table ── */
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

/* ══════════════════════════════════════════
   SYNC: SPCR employee info → DPCR header
══════════════════════════════════════════ */
function syncShared() {
    const name     = document.getElementById('s_emp_name')?.value || '';
    const title    = document.getElementById('s_emp_position')?.value || '';
    const approved = document.getElementById('s_approved_by')?.value || '';
    const nameEl   = document.getElementById('d_emp_name');
    const titleEl  = document.getElementById('d_emp_title');
    const approvedEl = document.getElementById('d_approved_by');
    const dispEl   = document.getElementById('d_disp_name');
    if (nameEl)    nameEl.value    = name;
    if (titleEl)   titleEl.value   = title;
    if (approvedEl) approvedEl.value = approved;
    if (dispEl)    dispEl.textContent = name || '\u00a0';
}

/* ══════════════════════════════════════════
   SPCR — ROW / SECTION FACTORIES
   Columns: Goal | Indicator | Budget | Person | Actual | Rate | Q E T A | Remarks | → IPCR | Del
══════════════════════════════════════════ */
function makeTA(placeholder, minH) {
    const ta = document.createElement('textarea');
    ta.placeholder = placeholder;
    ta.style.minHeight = (minH || 52) + 'px';
    ta.addEventListener('input', () => autoExpand(ta));
    return ta;
}

function createSpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // Strategic Goals and Objectives
    const tdGoal = document.createElement('td');
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal / objective…';
    goalTA.dataset.key  = 'strategic_goal';
    goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    // Performance / Success Indicator — freetext + → IPCR push button
    const tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:3px 4px;';

    if (data.pushed_from_dpcr) {
        const badge = document.createElement('div');
        badge.className = 'spcr-lock-badge';
        tdInd.appendChild(badge);
    }

    const piTA = document.createElement('textarea');
    piTA.className   = 'pi-custom';
    piTA.placeholder = 'Performance/Success Indicator (Targets + Measure)…';
    piTA.dataset.key = 'performance_indicator';
    piTA.value = data.performance_indicator || '';
    if (data.pushed_from_dpcr) { piTA.readOnly = true; piTA.style.color = '#555'; }
    piTA.addEventListener('input', () => autoExpand(piTA));

    const ipcrBtn = document.createElement('button');
    ipcrBtn.type = 'button'; ipcrBtn.className = 'row-view-btn row-link-btn';
    ipcrBtn.title = 'Push this row to IPCR';
    ipcrBtn.textContent = '→ IPCR'; ipcrBtn.style.color = '#6a3e9e';
    ipcrBtn.onclick = () => {
        const pmText = piTA.value.trim();
        const odText = goalTA.value.trim();
        if (!pmText && !odText) { alert('Please fill in the Performance Indicator before pushing to IPCR.'); return; }
        const newRow = createIpcrRow({ strategic_goal: odText, performance_indicator: pmText, linked_spcr_id: 'spcr-linked' });
        document.getElementById('ipcrBody').appendChild(newRow);
        newRow.querySelectorAll('textarea').forEach(autoExpand);
        ipcrBtn.textContent = '✔ sent'; ipcrBtn.style.color = '#1e6e3a';
        setTimeout(() => { ipcrBtn.textContent = '→ IPCR'; ipcrBtn.style.color = '#6a3e9e'; }, 2000);
        switchTab('ipcr');
        setTimeout(() => {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newRow.classList.add('row-highlight');
            setTimeout(() => newRow.classList.remove('row-highlight'), 2000);
        }, 100);
    };
    tdInd.appendChild(piTA); tdInd.appendChild(ipcrBtn);
    tr.appendChild(tdInd);

    // Allotted Budget
    const tdB = document.createElement('td'); tdB.style.textAlign = 'center';
    const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.dataset.key = 'allotted_budget'; bIn.value = data.allotted_budget || '';
    bIn.style.textAlign = 'center';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    // Person Accountable
    const tdP = document.createElement('td');
    const pIn = document.createElement('input'); pIn.type = 'text'; pIn.placeholder = '—';
    pIn.dataset.key = 'person_accountable'; pIn.value = data.person_accountable || '';
    tdP.appendChild(pIn); tr.appendChild(tdP);

    // Actual Accomplishment
    const tdA = document.createElement('td');
    const aTA = document.createElement('textarea');
    aTA.placeholder = '—'; aTA.dataset.key = 'actual_accomplishment';
    aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', () => autoExpand(aTA));
    tdA.appendChild(aTA); tr.appendChild(tdA);

    // Accomplishment Rate
    const tdR = document.createElement('td'); tdR.style.textAlign = 'center';
    const rIn = document.createElement('input'); rIn.type = 'text'; rIn.placeholder = '—';
    rIn.dataset.key = 'accomplishment_rate'; rIn.value = data.accomplishment_rate || '';
    rIn.style.textAlign = 'center';
    tdR.appendChild(rIn); tr.appendChild(tdR);

    // Q E T A — empty rating cells
    ['rating_q','rating_e','rating_t','rating_a'].forEach(key => {
        const td = document.createElement('td');
        td.className = 'spcr-rating-cell';
        tr.appendChild(td);
    });

    // Remarks
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = '—'; remTA.dataset.key = 'remarks';
    remTA.value = data.remarks || '';
    remTA.addEventListener('input', () => autoExpand(remTA));
    tdRem.appendChild(remTA); tr.appendChild(tdRem);

    // Delete button
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button');
    dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    return tr;
}

/* Keep old createMatrixRow as alias for hydration back-compat */
function createMatrixRow(data = {}) {
    return createSpcrRow({
        strategic_goal:        data.operational_definition || '',
        performance_indicator: data.performance_measure    || '',
        remarks:               data.source_monitoring      || '',
        pushed_from_dpcr:      data.pushed_from_dpcr       || false,
    });
}

function createSectionRow(label = '') {
    const tr = document.createElement('tr');
    tr.className = 'spcr-section-row';
    const td = document.createElement('td'); td.colSpan = 11;
    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = 'Section name (e.g. CORE FUNCTIONS)';
    inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:700;font-size:9.5px;outline:none;text-align:left;';
    inp.dataset.key = 'section_label';
    inp.value = label;
    td.appendChild(inp); tr.appendChild(td);
    const tdD = document.createElement('td');
    tdD.style.cssText = 'border:none;background:#f5f5f5;text-align:center;vertical-align:middle;width:26px;';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'remove-btn';
    btn.innerHTML = '&times;'; btn.onclick = () => tr.remove();
    tdD.appendChild(btn); tr.appendChild(tdD);
    return tr;
}

/* Compute and display average A ratings per section */
function computeSpcrAverages() {
    let stratSum = 0, stratCount = 0;
    let coreSum  = 0, coreCount  = 0;
    let current  = 'strategic';

    document.querySelectorAll('#spcrBody tr').forEach(tr => {
        if (tr.classList.contains('spcr-section-row')) {
            const txt = (tr.querySelector('input')?.value || tr.querySelector('td')?.textContent || '').toUpperCase();
            current = txt.includes('CORE') ? 'core' : 'strategic';
            return;
        }
        const cells = tr.querySelectorAll('td');
        if (cells.length < 10) return;
        // Rating A is the 4th rating cell = col index 9 (0-based: goal=0, ind=1, budget=2, person=3, actual=4, rate=5, Q=6, E=7, T=8, A=9)
        const aCell = cells[9];
        const val   = parseFloat(aCell?.textContent?.trim());
        if (!isNaN(val) && val > 0) {
            if (current === 'core') { coreSum += val; coreCount++; }
            else                    { stratSum += val; stratCount++; }
        }
    });

    const avgStrat = stratCount ? (stratSum / stratCount).toFixed(2) : '0.00';
    const avgCore  = coreCount  ? (coreSum  / coreCount ).toFixed(2) : '0.00';
    const elS = document.getElementById('s_avg_strategic');
    const elC = document.getElementById('s_avg_core');
    if (elS) elS.textContent = avgStrat;
    if (elC) elC.textContent = avgCore;
}

document.getElementById('sAddRowBtn').addEventListener('click', () => {
    const tr = createSpcrRow();
    document.getElementById('spcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('sAddSectionBtn').addEventListener('click', () => {
    const tr = createSectionRow();
    document.getElementById('spcrBody').appendChild(tr);
    tr.querySelector('input').focus();
});

/* ── Read current SPCR form into a plain object ── */
function readSpcrForm() {
    const items = [];
    document.querySelectorAll('#spcrBody tr').forEach(tr => {
        if (tr.classList.contains('spcr-section-row')) {
            const inp = tr.querySelector('input[data-key="section_label"]');
            const txt = tr.querySelector('td');
            items.push({ is_section: true, section_label: inp ? inp.value.trim() : (txt?.textContent.trim() || '') });
            return;
        }
        const cells = tr.querySelectorAll('td');
        if (cells.length < 10) return;
        const goalTA = cells[0]?.querySelector('textarea');
        const indTA  = cells[1]?.querySelector('textarea.pi-custom');
        const bIn    = cells[2]?.querySelector('input');
        const pIn    = cells[3]?.querySelector('input');
        const aTA    = cells[4]?.querySelector('textarea');
        const rIn    = cells[5]?.querySelector('input');
        const remTA  = cells[10]?.querySelector('textarea');
        items.push({
            is_section:            false,
            strategic_goal:        goalTA?.value.trim()  || '',
            performance_indicator: indTA?.value.trim()   || '',
            allotted_budget:       bIn?.value.trim()     || '',
            person_accountable:    pIn?.value.trim()     || '',
            actual_accomplishment: aTA?.value.trim()     || '',
            accomplishment_rate:   rIn?.value.trim()     || '',
            remarks:               remTA?.value.trim()   || '',
        });
    });
    return {
        employee_name:     document.getElementById('s_emp_name').value.trim(),
        employee_position: document.getElementById('s_emp_position').value.trim(),
        employee_unit:     document.getElementById('s_emp_unit').value.trim(),
        period:            document.getElementById('s_period').value.trim(),
        supervisor:        document.getElementById('s_supervisor').value.trim(),
        approved_by:       document.getElementById('s_approved_by').value.trim(),
        year:              new Date().getFullYear(),
        semester:          '1st',
        items,
    };
}

/* ── Save SPCR → POST /api/spcr ── */
document.getElementById('sSaveBtn').addEventListener('click', async () => {
    const data = readSpcrForm();
    if (!data.employee_name) {
        showAlert('s-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        await apiFetch('/api/spcr', 'POST', data);
        showAlert('s-alertOk', 'ok', `✔ SPCR for "${data.employee_name}" saved.`);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

/* ── Clear SPCR form ── */
document.getElementById('sClearBtn').addEventListener('click', () => {
    if (!confirm('Clear all SPCR fields and rows?')) return;
    ['s_emp_name','s_emp_position','s_emp_unit','s_period','s_supervisor','s_approved_by']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = '\u00a0';
    document.getElementById('spcrBody').innerHTML =
        '<tr class="spcr-section-row"><td colspan="11">STRATEGIC FUNCTIONS :</td><td style="border:none;background:#f5f5f5;"></td></tr>';
    computeSpcrAverages();
});

/* ── Sync display name as user types ── */
const sEmpNameEl = document.getElementById('s_emp_name');
if (sEmpNameEl) {
    sEmpNameEl.addEventListener('input', function () {
        const disp = document.getElementById('s_disp_name');
        if (disp) disp.textContent = this.value || '\u00a0';
    });
}

/* ── Hydrate SPCR form from DB ── */
function hydrateSpcrForm(form) {
    if (!form) return;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('s_emp_name',      form.employee_name     || form.prepared_by       || '');
    setVal('s_emp_position',  form.employee_position || form.prepared_by_title || '');
    setVal('s_emp_unit',      form.employee_unit     || '');
    setVal('s_period',        form.period            || '');
    setVal('s_supervisor',    form.supervisor        || form.reviewed_by       || '');
    setVal('s_approved_by',   form.approved_by       || '');
    const disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = (form.employee_name || form.prepared_by || '\u00a0');

    document.getElementById('spcrBody').innerHTML = '';
    (form.items || []).forEach(item => {
        if (item.is_section || item.type === 'section') {
            document.getElementById('spcrBody').appendChild(
                createSectionRow(item.section_label || '')
            );
        } else {
            const tr = createSpcrRow({
                strategic_goal:        item.strategic_goal        || item.operational_definition || '',
                performance_indicator: item.performance_indicator || item.performance_measure    || '',
                allotted_budget:       item.allotted_budget       || '',
                person_accountable:    item.person_accountable    || '',
                actual_accomplishment: item.actual_accomplishment || '',
                accomplishment_rate:   item.accomplishment_rate   || '',
                remarks:               item.remarks               || item.source_monitoring || '',
            });
            document.getElementById('spcrBody').appendChild(tr);
            tr.querySelectorAll('textarea').forEach(autoExpand);
        }
    });
}

/* renderMatrixList removed — SPCR no longer uses the old matrix list UI. */

/* viewMatrix / deleteMatrix removed — old SPCR matrix API no longer used. */

/* pushToDPCR (old SPCR-matrix→DPCR) removed.
   Flow is now: DPCR → push → SPCR → push → IPCR. */

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

    // ── Performance / Success Indicator — dropdown + custom text + view-link to SPCR ──
    const tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:4px 5px;';

    // Dropdown: 100%, 90%, 73%, 50%, At least 1
    const piSel = document.createElement('select');
    piSel.className = 'pi-select';
    piSel.style.cssText = 'width:100%;border:none;border-bottom:1px solid #ccc;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;margin-bottom:3px;';
    const blankOpt = document.createElement('option'); blankOpt.value = ''; blankOpt.textContent = '— select indicator —';
    piSel.appendChild(blankOpt);
    PERF_INDICATORS.forEach(pi => {
        const opt = document.createElement('option');
        opt.value = pi.id; opt.textContent = pi.label;
        opt.dataset.piLabel = pi.label;
        if (data.pi_id === pi.id) opt.selected = true;
        piSel.appendChild(opt);
    });

    // Freetext for extra detail beneath the dropdown
    const piTA = document.createElement('textarea');
    piTA.className = 'pi-custom';
    piTA.placeholder = 'Additional detail / measure…';
    piTA.value = data.performance_indicator || '';
    piTA.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;resize:none;overflow:hidden;min-height:36px;';
    piTA.addEventListener('input', () => autoExpand(piTA));

    // ── Push-to-SPCR button — creates a new SPCR row from this DPCR row ──
    const piViewBtn = document.createElement('button');
    piViewBtn.type = 'button'; piViewBtn.className = 'row-view-btn row-link-btn';
    piViewBtn.title = 'Push this row to SPCR Rating Matrix';
    piViewBtn.textContent = '→ SPCR';
    piViewBtn.style.color = '#1a3b6e';

    piSel.addEventListener('change', () => {
        piViewBtn.style.color = piSel.value ? '#1a3b6e' : '#aaa';
    });

    piViewBtn.onclick = () => {
        const piId    = piSel.value;
        const pi      = PERF_INDICATORS.find(p => p.id === piId);
        const piLabel = pi ? pi.label : '';
        const detail  = piTA.value.trim();
        const goal    = goalTA.value.trim();

        if (!piLabel && !detail && !goal) {
            alert('Please fill in the Strategic Goal and select a Performance Indicator before pushing to SPCR.');
            return;
        }

        // Build the performance measure text: "PI label — detail" or just one of them
        const pmText = [piLabel, detail].filter(Boolean).join(' — ');

        // Create a new SPCR row pre-filled from this DPCR row
        const newSpcrRow = createSpcrRow({
            strategic_goal:        goal,
            performance_indicator: pmText,
            pushed_from_dpcr:      true,
        });
        document.getElementById('spcrBody').appendChild(newSpcrRow);
        newSpcrRow.querySelectorAll('textarea').forEach(autoExpand);

        // Mark the DPCR PI id on the new SPCR row for back-reference
        newSpcrRow.dataset.linkedPiId = piId;

        // Visual feedback
        piViewBtn.textContent = '✔ sent';
        piViewBtn.style.color = '#1e6e3a';
        setTimeout(() => { piViewBtn.textContent = '→ SPCR'; piViewBtn.style.color = '#1a3b6e'; }, 2000);

        // Switch to SPCR tab and highlight new row
        switchTab('spcr');
        setTimeout(() => {
            newSpcrRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newSpcrRow.classList.add('row-highlight');
            setTimeout(() => newSpcrRow.classList.remove('row-highlight'), 2000);
        }, 100);
    };

    tdInd.appendChild(piSel);
    tdInd.appendChild(piTA);
    tdInd.appendChild(piViewBtn);
    tr.appendChild(tdInd);

    // Budget
    const tdB = document.createElement('td');
    const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.value = data.allotted_budget || '';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    // Section Accountable (updated dropdown)
    const tdS = document.createElement('td');
    const sel = document.createElement('select');
    sel.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;';
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

/* _updateDpcrViewBtn removed — replaced by push-to-SPCR button. */

/* Collect all SPCR data rows as linkable objects */
function _getAllSpcrRows() {
    const rows = [];
    document.querySelectorAll('#spcrBody tr[data-type="data"]').forEach(tr => {
        const goalTA = tr.querySelector('textarea[data-key="strategic_goal"]');
        const indTA  = tr.querySelector('textarea[data-key="performance_indicator"]');
        rows.push({
            rowEl: tr,
            text:  indTA?.value.trim() || '(empty)',
            label: (indTA?.value.trim() || '(empty)') + (goalTA?.value.trim() ? ' — ' + goalTA.value.trim().substring(0,40) : ''),
        });
    });
    return rows;
}

/* _getSpcrRowsLinkedTo removed — no longer needed. */

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
══════════════════════════════════════════ */

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
    // Pre-fill SPCR form from latest DB record
    if (window.DB_LATEST_SPCR) {
        hydrateSpcrForm(window.DB_LATEST_SPCR);
    } else if (window.DB_LATEST_MATRIX) {
        // backward-compat: hydrate from old SPCR matrix format
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

    // DPCR is first on the navbar — ensure it is the active tab on load
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-dpcr').classList.add('active');
    const firstTabBtn = document.querySelector('.tab-btn');
    if (firstTabBtn) firstTabBtn.classList.add('active');
})();

/* ══════════════════════════════════════════
   IPCR — ROW FACTORY
   Columns: Goal | Indicator+link | Actual | Rate | Q | E | T | A | Remarks | Del
══════════════════════════════════════════ */
function createIpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // Strategic Goal / Objective
    const tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal / objective…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    // ── Performance / Success Indicator + link-from-SPCR view button ──
    const tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:4px 5px;';

    const indTA = document.createElement('textarea');
    indTA.placeholder = 'Performance/Success Indicator (Targets + Measure)…';
    indTA.value = data.performance_indicator || '';
    indTA.addEventListener('input', () => autoExpand(indTA));

    // Link button → picks from SPCR performance measures
    const lnkBtn = document.createElement('button');
    lnkBtn.type = 'button'; lnkBtn.className = 'row-view-btn row-link-btn';
    lnkBtn.title = 'Link Performance Indicator from SPCR';
    tr.dataset.linkedSpcrId = data.linked_spcr_id || '';
    _updateIpcrLinkBtn(lnkBtn, tr.dataset.linkedSpcrId);

    lnkBtn.onclick = () => {
        const spcrRows = _getAllSpcrRows();
        openLinkModal('Link from SPCR — Performance Measure', spcrRows, (row) => {
            tr.dataset.linkedSpcrId = row.rowEl ? (row.rowEl.rowIndex?.toString() || 'linked') : 'linked';
            indTA.value = row.text || '';
            autoExpand(indTA);
            // Also copy strategic goal from SPCR operational definition
            const odTA = row.rowEl?.querySelector('textarea[data-key="operational_definition"]');
            if (odTA?.value.trim()) {
                goalTA.value = odTA.value.trim();
                autoExpand(goalTA);
            }
            _updateIpcrLinkBtn(lnkBtn, 'linked');
        });
    };

    tdInd.appendChild(indTA);
    tdInd.appendChild(lnkBtn);
    tr.appendChild(tdInd);

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

function _updateIpcrLinkBtn(btn, val) {
    if (val) {
        btn.style.color = '#1e6e3a';
    } else {
        btn.textContent = '⬡ link SPCR';
        btn.style.color = '';
    }
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