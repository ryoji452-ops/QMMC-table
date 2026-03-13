/* ═══════════════════════════════════════════════════════════════
   spcr.js  —  redesigned to match DOH-SPMS Form 3 photo
   ─────────────────────────────────────────────────────────────
   TABLE COLUMNS (0-based td index):
     0  Strategic Goals & Objectives
     1  Performance/Success Indicator (Targets + Measure)
     2  Allotted Budget
     3  Person Accountable
     4  Actual Accomplishment
     5  Accomplishment Rate
     6  Q (1)
     7  E (2)
     8  T (3)
     9  A (4)
    10  Remarks/Justification
    11  Delete (screen only)
═══════════════════════════════════════════════════════════════ */

/* ── SECTION CONFIG ── */
const SPCR_FUNC_SECTIONS = [
    { label: 'STRATEGIC FUNCTIONS :', type: 'Strategic', color: '#1a3b6e', bg: '#dce4f0' },
    { label: 'CORE FUNCTIONS :',       type: 'Core',      color: '#1e6e3a', bg: '#d4edda' },
    { label: 'SUPPORT FUNCTIONS :',    type: 'Support',   color: '#7a4f00', bg: '#fff3cd' },
];

function _spcrFuncTypeFromLabel(label) {
    const up = (label || '').toUpperCase();
    if (up.includes('CORE'))    return 'Core';
    if (up.includes('SUPPORT')) return 'Support';
    return 'Strategic';
}

function _styleSpcrSection(tr, label) {
    const cfg = SPCR_FUNC_SECTIONS.find(f => f.type === _spcrFuncTypeFromLabel(label))
             || SPCR_FUNC_SECTIONS[0];
    const td = tr.querySelector('td');
    if (!td) return;
    td.style.background = cfg.bg;
    td.style.color      = cfg.color;
    td.style.fontWeight = '700';
    td.style.borderLeft = `4px solid ${cfg.color}`;
}

/* ── ROW FACTORY ──
   Columns: goal | indicator | budget | person | actual | rate | Q | E | T | A | remarks | del
*/
function createSpcrRow(data = {}) {
    const tr = document.createElement('tr');

    /* drag handle */
    tr.appendChild(makeDragHandle());

    /* 0 — Strategic Goals and Objectives */
    const tdGoal = document.createElement('td');
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal / objective…';
    goalTA.dataset.key = 'strategic_goal';
    goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA);
    tr.appendChild(tdGoal);

    /* 1 — Performance / Success Indicator + → IPCR push button */
    const tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:3px 4px;';

    if (data.pushed_from_dpcr) {
        const badge = document.createElement('div');
        badge.className = 'spcr-lock-badge';
        badge.textContent = '';
        tdInd.appendChild(badge);
    }

    const piTA = document.createElement('textarea');
    piTA.className   = 'pi-custom';
    piTA.placeholder = 'Performance/Success Indicator (Targets + Measure)…';
    piTA.dataset.key = 'performance_indicator';
    piTA.value = data.performance_indicator || '';
    piTA.addEventListener('input', () => autoExpand(piTA));

    const ipcrBtn = document.createElement('button');
    ipcrBtn.type = 'button';
    ipcrBtn.className = 'row-view-btn row-link-btn no-print';
    ipcrBtn.title = 'Push this row to IPCR';
    ipcrBtn.textContent = '→ IPCR';
    ipcrBtn.style.color = '#6a3e9e';
    ipcrBtn.onclick = () => {
        const pmText = piTA.value.trim();
        const odText = goalTA.value.trim();
        if (!pmText && !odText) {
            alert('Please fill in the Performance Indicator before pushing to IPCR.');
            return;
        }
        const newRow = createIpcrRow({
            strategic_goal:        odText,
            performance_indicator: pmText,
        });
        document.getElementById('ipcrBody').appendChild(newRow);
        newRow.querySelectorAll('textarea').forEach(autoExpand);
        ipcrBtn.textContent = '✔ sent';
        ipcrBtn.style.color = '#1e6e3a';
        setTimeout(() => { ipcrBtn.textContent = '→ IPCR'; ipcrBtn.style.color = '#6a3e9e'; }, 2000);
        switchTab('ipcr');
        setTimeout(() => {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newRow.classList.add('row-highlight');
            setTimeout(() => newRow.classList.remove('row-highlight'), 2000);
        }, 100);
    };

    tdInd.appendChild(piTA);
    tdInd.appendChild(ipcrBtn);
    tr.appendChild(tdInd);

    /* 2 — Allotted Budget */
    const tdB = document.createElement('td');
    tdB.style.textAlign = 'center';
    const bIn = document.createElement('input');
    bIn.type = 'text'; bIn.placeholder = '—';
    bIn.dataset.key = 'allotted_budget';
    bIn.value = data.allotted_budget || '';
    bIn.style.textAlign = 'center';
    tdB.appendChild(bIn);
    tr.appendChild(tdB);

    /* 3 — Person Accountable */
    const tdP = document.createElement('td');
    const pIn = document.createElement('input');
    pIn.type = 'text';
    pIn.placeholder = 'Person / Section…';
    pIn.dataset.key = 'person_accountable';
    pIn.value = data.person_accountable || '';
    pIn.style.cssText = 'width:100%;border:none;background:transparent;font-size:9.5px;font-family:Arial,sans-serif;outline:none;text-align:center;';
    tdP.appendChild(pIn);
    tr.appendChild(tdP);

    /* 4 — Actual Accomplishment */
    const tdA = document.createElement('td');
    const aTA = document.createElement('textarea');
    aTA.placeholder = 'Actual accomplishment…';
    aTA.dataset.key = 'actual_accomplishment';
    aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', () => autoExpand(aTA));
    tdA.appendChild(aTA);
    tr.appendChild(tdA);

    /* 5 — Accomplishment Rate (Actual÷Target × 100%) */
    const tdR = document.createElement('td');
    tdR.style.cssText = 'text-align:center;vertical-align:middle;';
    const rIn = document.createElement('input');
    rIn.type = 'text'; rIn.placeholder = '—';
    rIn.dataset.key = 'accomplishment_rate';
    rIn.value = data.accomplishment_rate || '';
    rIn.style.cssText = 'width:100%;border:none;background:transparent;font-size:9.5px;font-family:Arial,sans-serif;outline:none;text-align:center;font-weight:700;';
    tdR.appendChild(rIn);
    tr.appendChild(tdR);

    /* 6–9 — Q E T A rating cells (filled by Rating Matrix or manual) */
    ['rating_q','rating_e','rating_t','rating_a'].forEach(() => {
        const td = document.createElement('td');
        td.className = 'spcr-rating-cell';
        tr.appendChild(td);
    });

    /* 10 — Remarks / Justification on Unmet Targets */
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = '—';
    remTA.dataset.key = 'remarks';
    remTA.value = data.remarks || '';
    remTA.addEventListener('input', () => autoExpand(remTA));
    tdRem.appendChild(remTA);
    tr.appendChild(tdRem);

    /* 11 — Delete (screen only) */
    const tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button');
    dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => { tr.remove(); computeSpcrAverages(); };
    tdDel.appendChild(dBtn);
    tr.appendChild(tdDel);

    return tr;
}

/* Backward-compat alias */
function createMatrixRow(data = {}) {
    return createSpcrRow({
        strategic_goal:        data.operational_definition || '',
        performance_indicator: data.performance_measure    || '',
        remarks:               data.source_monitoring      || '',
        pushed_from_dpcr:      data.pushed_from_dpcr       || false,
    });
}

/* ── SECTION ROW FACTORY ── */
function createSectionRow(label = '') {
    const tr = document.createElement('tr');
    tr.className = 'spcr-section-row';

    /* drag handle */
    tr.appendChild(makeDragHandle());

    const td = document.createElement('td');
    td.colSpan = 11;

    /* Quick-pick buttons */
    const btnBar = document.createElement('div');
    btnBar.className = 'no-print';
    btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
    SPCR_FUNC_SECTIONS.forEach(f => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = f.label;
        b.style.cssText = `font-size:9px;font-family:Arial,sans-serif;font-weight:700;padding:2px 8px;
            border:1.5px solid ${f.color};border-radius:3px;cursor:pointer;
            background:${f.bg};color:${f.color};`;
        b.onclick = () => { inp.value = f.label; _styleSpcrSection(tr, f.label); };
        btnBar.appendChild(b);
    });

    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = 'Section name…';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:9.5px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key = 'section_label';
    inp.value = label;
    inp.addEventListener('input', () => _styleSpcrSection(tr, inp.value));

    td.appendChild(btnBar);
    td.appendChild(inp);
    tr.appendChild(td);

    /* Delete cell */
    const tdD = document.createElement('td');
    tdD.className = 'no-print';
    tdD.style.cssText = 'border:none;background:transparent;text-align:center;vertical-align:middle;width:26px;';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'remove-btn';
    btn.innerHTML = '&times;'; btn.onclick = () => tr.remove();
    tdD.appendChild(btn);
    tr.appendChild(tdD);

    if (label) _styleSpcrSection(tr, label);
    return tr;
}

/* ── AVERAGE RATING FOOTER ROW ── */
function createAvgRow(label, idSuffix) {
    const tr = document.createElement('tr');
    tr.className = 'spcr-avg-row';
    tr.id = 'spcr-avg-' + idSuffix;

    /* blank cell for drag-handle column */
    const tdHandle = document.createElement('td');
    tdHandle.className = 'no-print';
    tdHandle.style.cssText = 'border:none;background:transparent;padding:0;width:18px;';
    tr.appendChild(tdHandle);

    /* Spans cols 0–9 for label, col 10 for value */
    const tdLabel = document.createElement('td');
    tdLabel.colSpan = 10;
    tdLabel.className = 'spcr-avg-label';
    tdLabel.textContent = 'Average Rating (' + label + ')';
    tr.appendChild(tdLabel);

    const tdVal = document.createElement('td');
    tdVal.className = 'spcr-avg-val';
    tdVal.id = 's_avg_' + idSuffix.toLowerCase();
    tdVal.textContent = '0.00';
    tr.appendChild(tdVal);

    /* Empty del cell */
    const tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;background:transparent;';
    tr.appendChild(tdDel);

    return tr;
}

/* ── COMPUTE AVERAGES ── */
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
        if (tr.classList.contains('spcr-avg-row')) return;

        const cells = tr.querySelectorAll('td');
        /* A rating is in col 10 (shifted +1 by drag handle) */
        const aCell = cells[10];
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

/* ── READ FORM ── */
function readSpcrForm() {
    const items = [];
    document.querySelectorAll('#spcrBody tr').forEach(tr => {
        if (tr.classList.contains('spcr-section-row')) {
            const inp = tr.querySelector('input[data-key="section_label"]');
            const txt = tr.querySelector('td');
            items.push({ is_section: true, section_label: inp ? inp.value.trim() : (txt?.textContent.trim() || '') });
            return;
        }
        if (tr.classList.contains('spcr-avg-row')) return;

        const cells = tr.querySelectorAll('td');
        if (cells.length < 10) return;

        items.push({
            is_section:            false,
            strategic_goal:        cells[1]?.querySelector('textarea')?.value.trim()                    || '',
            performance_indicator: cells[2]?.querySelector('textarea.pi-custom')?.value.trim()          || '',
            allotted_budget:       cells[3]?.querySelector('input')?.value.trim()                       || '',
            person_accountable:    cells[4]?.querySelector('input')?.value.trim()                       || '',
            actual_accomplishment: cells[5]?.querySelector('textarea')?.value.trim()                    || '',
            accomplishment_rate:   cells[6]?.querySelector('input')?.value.trim()                       || '',
            remarks:               cells[11]?.querySelector('textarea')?.value.trim()                   || '',
        });
    });

    return {
        employee_name:     document.getElementById('s_emp_name')?.value.trim()     || '',
        employee_position: document.getElementById('s_emp_position')?.value.trim() || '',
        period:            document.getElementById('s_period')?.value.trim()        || '',
        supervisor:        document.getElementById('s_supervisor')?.value.trim()    || '',
        approved_by:       document.getElementById('s_approved_by')?.value.trim()  || '',
        year:              new Date().getFullYear(),
        semester:          '1st',
        items,
    };
}

/* ── HYDRATE FROM DB ── */
function hydrateSpcrForm(form) {
    if (!form) return;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('s_emp_name',     form.employee_name     || '');
    setVal('s_emp_position', form.employee_position || form.employee_title || '');
    setVal('s_period',       form.period            || '');
    setVal('s_supervisor',   form.supervisor        || form.reviewed_by   || '');
    setVal('s_approved_by',  form.approved_by       || '');

    const disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = form.employee_name || '\u00a0';

    const body = document.getElementById('spcrBody');
    body.innerHTML = '';

    (form.items || []).forEach(item => {
        if (item.is_section || item.type === 'section') {
            body.appendChild(createSectionRow(item.section_label || ''));
        } else {
            const tr = createSpcrRow({
                strategic_goal:        item.strategic_goal        || item.operational_definition || '',
                performance_indicator: item.performance_indicator || item.performance_measure    || '',
                allotted_budget:       item.allotted_budget       || '',
                person_accountable:    item.person_accountable    || '',
                actual_accomplishment: item.actual_accomplishment || '',
                accomplishment_rate:   item.accomplishment_rate   || '',
                remarks:               item.remarks               || item.source_monitoring       || '',
            });
            body.appendChild(tr);
            tr.querySelectorAll('textarea').forEach(autoExpand);
        }
    });

    /* Re-insert average footer rows if they were removed */
    _ensureAvgRows();
    computeSpcrAverages();
}

/* ── ENSURE AVERAGE FOOTER ROWS EXIST ── */
function _ensureAvgRows() {
    if (!document.getElementById('spcr-avg-strategic')) {
        document.getElementById('spcrBody').appendChild(createAvgRow('Strategic', 'strategic'));
    }
    if (!document.getElementById('spcr-avg-core')) {
        document.getElementById('spcrBody').appendChild(createAvgRow('Core', 'core'));
    }
}

/* ── EVENT LISTENERS ── */
document.getElementById('sSaveBtn').addEventListener('click', async () => {
    const data = readSpcrForm();
    if (!data.employee_name) {
        showAlert('s-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        const saved = await apiFetch('/api/spcr', 'POST', data);
        showAlert('s-alertOk', 'ok', `✔ SPCR for "${data.employee_name}" saved.`);
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('spcr', saved.form ?? saved);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

document.getElementById('sAddRowBtn').addEventListener('click', () => {
    /* Insert before average footer rows */
    const body  = document.getElementById('spcrBody');
    const avgS  = document.getElementById('spcr-avg-strategic');
    const tr    = createSpcrRow();
    avgS ? body.insertBefore(tr, avgS) : body.appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('sAddSectionBtn').addEventListener('click', () => {
    const body = document.getElementById('spcrBody');
    const avgS = document.getElementById('spcr-avg-strategic');
    const tr   = createSectionRow('');
    avgS ? body.insertBefore(tr, avgS) : body.appendChild(tr);
    tr.querySelector('input').focus();
});

document.getElementById('sClearBtn').addEventListener('click', () => {
    if (!confirm('Clear all SPCR data?')) return;
    ['s_emp_name','s_emp_position','s_period','s_supervisor','s_approved_by'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = '\u00a0';

    const body = document.getElementById('spcrBody');
    body.innerHTML = '';
    body.appendChild(createSectionRow('STRATEGIC FUNCTIONS :'));
    body.appendChild(createAvgRow('Strategic', 'strategic'));
    body.appendChild(createSectionRow('CORE FUNCTIONS :'));
    body.appendChild(createAvgRow('Core', 'core'));
    computeSpcrAverages();
});

/* Sync display name as user types */
const sNameEl = document.getElementById('s_emp_name');
if (sNameEl) {
    sNameEl.addEventListener('input', function () {
        const disp = document.getElementById('s_disp_name');
        if (disp) disp.textContent = this.value || '\u00a0';
        syncShared();
    });
}
['s_emp_position','s_approved_by'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncShared);
});

/* ── INIT — default body structure ── */
(function spcrInit() {
    const body = document.getElementById('spcrBody');
    if (!body || body.children.length > 0) return;
    body.appendChild(createSectionRow('STRATEGIC FUNCTIONS :'));
    body.appendChild(createAvgRow('Strategic', 'strategic'));
    body.appendChild(createSectionRow('CORE FUNCTIONS :'));
    body.appendChild(createAvgRow('Core', 'core'));
})();