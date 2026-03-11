/* ═══════════════════════════════════════════
   spcr.js
   SPCR row/section factories, averages,
   read, hydrate, and SPCR event listeners.
   Requires: shared.js, ipcr.js (for createIpcrRow)
═══════════════════════════════════════════ */

/* ── FUNCTION TYPE SECTION CONFIG (shared with DPCR pattern) ── */
const SPCR_FUNC_SECTIONS = [
    { label: 'STRATEGIC FUNCTIONS', type: 'Strategic', color: '#1a3b6e', bg: '#dce4f0' },
    { label: 'CORE FUNCTIONS',       type: 'Core',      color: '#1e6e3a', bg: '#d4edda' },
    { label: 'SUPPORT FUNCTIONS',    type: 'Support',   color: '#7a4f00', bg: '#fff3cd' },
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

/* ── ROW FACTORY ── */
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

    // Performance / Success Indicator + push-to-IPCR button
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
    piTA.addEventListener('input', () => autoExpand(piTA));

    const ipcrBtn = document.createElement('button');
    ipcrBtn.type = 'button'; ipcrBtn.className = 'row-view-btn row-link-btn';
    ipcrBtn.title = 'Push this row to IPCR';
    ipcrBtn.textContent = '→ IPCR'; ipcrBtn.style.color = '#6a3e9e';
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
            linked_spcr_id:        'spcr-linked',
        });
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

    // Target (text description + % number) — mirrors DPCR target cell
    const tdTarget = document.createElement('td');
    tdTarget.style.cssText = 'vertical-align:top;padding:4px 5px;';
    const targetTA = document.createElement('textarea');
    targetTA.placeholder = 'Target description…';
    targetTA.dataset.key = 'target_text';
    targetTA.value = data.target_text || '';
    targetTA.addEventListener('input', () => autoExpand(targetTA));
    const targetIn = document.createElement('input');
    targetIn.type      = 'number';
    targetIn.className = 'spcr-target-input';
    targetIn.placeholder = '0';
    targetIn.min  = '0'; targetIn.max = '100'; targetIn.step = '1';
    targetIn.value = data.target_pct != null ? data.target_pct : '';
    targetIn.style.cssText = 'width:100%;border:none;border-top:1px solid #e0e0e0;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;text-align:center;margin-top:3px;padding-top:2px;';
    const targetLbl = document.createElement('div');
    targetLbl.style.cssText = 'font-size:8px;color:#888;';
    targetLbl.textContent = 'Target %';
    tdTarget.appendChild(targetTA);
    tdTarget.appendChild(targetIn);
    tdTarget.appendChild(targetLbl);
    tr.appendChild(tdTarget);

    // Allotted Budget
    const tdB = document.createElement('td'); tdB.style.textAlign = 'center';
    const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.dataset.key = 'allotted_budget'; bIn.value = data.allotted_budget || '';
    bIn.style.textAlign = 'center';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    // Person Accountable
    const tdP = document.createElement('td');
    const pSel = document.createElement('select');
    pSel.dataset.key = 'person_accountable';
    pSel.style.cssText = 'width:100%;border:none;background:transparent;font-size:9.5px;font-family:Arial,sans-serif;outline:none;';
    SECTS.forEach(s => {
        const opt = document.createElement('option'); opt.value = s; opt.textContent = s;
        if (data.person_accountable === s) opt.selected = true;
        pSel.appendChild(opt);
    });
    tdP.appendChild(pSel); tr.appendChild(tdP);

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
    ['rating_q','rating_e','rating_t','rating_a'].forEach(() => {
        const td = document.createElement('td'); td.className = 'spcr-rating-cell';
        tr.appendChild(td);
    });

    // Remarks
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = '—'; remTA.dataset.key = 'remarks';
    remTA.value = data.remarks || '';
    remTA.addEventListener('input', () => autoExpand(remTA));
    tdRem.appendChild(remTA); tr.appendChild(tdRem);

    // Delete
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button');
    dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    return tr;
}

/* Backward-compat alias for old matrix format */
function createMatrixRow(data = {}) {
    return createSpcrRow({
        strategic_goal:        data.operational_definition || '',
        performance_indicator: data.performance_measure    || '',
        remarks:               data.source_monitoring      || '',
        pushed_from_dpcr:      data.pushed_from_dpcr       || false,
    });
}

/* ── SECTION ROW FACTORY — with quick-pick colored buttons ── */
function createSectionRow(label = '') {
    const tr = document.createElement('tr');
    tr.className = 'spcr-section-row';

    const td = document.createElement('td'); td.colSpan = 11;

    // Quick-pick preset buttons
    const btnBar = document.createElement('div');
    btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
    SPCR_FUNC_SECTIONS.forEach(f => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = f.label;
        b.style.cssText = `font-size:9px;font-family:Arial,sans-serif;font-weight:700;padding:2px 8px;
            border:1.5px solid ${f.color};border-radius:3px;cursor:pointer;
            background:${f.bg};color:${f.color};transition:opacity .12s;`;
        b.onclick = () => {
            inp.value = f.label;
            _styleSpcrSection(tr, f.label);
        };
        btnBar.appendChild(b);
    });

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Section name…';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:9.5px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key   = 'section_label';
    inp.value         = label;
    inp.addEventListener('input', () => _styleSpcrSection(tr, inp.value));

    td.appendChild(btnBar);
    td.appendChild(inp);
    tr.appendChild(td);

    // Delete cell
    const tdD = document.createElement('td');
    tdD.style.cssText = 'border:none;background:transparent;text-align:center;vertical-align:middle;width:26px;';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'remove-btn';
    btn.innerHTML = '&times;'; btn.onclick = () => tr.remove();
    tdD.appendChild(btn); tr.appendChild(tdD);

    // Apply color immediately if label provided
    if (label) _styleSpcrSection(tr, label);

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
        const cells = tr.querySelectorAll('td');
        if (cells.length < 10) return;
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
        const cells = tr.querySelectorAll('td');
        if (cells.length < 10) return;
        const goalTA   = cells[0]?.querySelector('textarea');
        const indTA    = cells[1]?.querySelector('textarea.pi-custom');
        const tgtTA    = cells[2]?.querySelector('textarea[data-key="target_text"]');
        const tgtIn    = cells[2]?.querySelector('input.spcr-target-input');
        const bIn      = cells[3]?.querySelector('input');
        const pSel     = cells[4]?.querySelector('select[data-key="person_accountable"]');
        const aTA      = cells[5]?.querySelector('textarea');
        const rIn      = cells[6]?.querySelector('input');
        const remTA    = cells[11]?.querySelector('textarea');
        items.push({
            is_section:            false,
            strategic_goal:        goalTA?.value.trim()  || '',
            performance_indicator: indTA?.value.trim()   || '',
            target_text:           tgtTA?.value.trim()   || '',
            target_pct:            tgtIn?.value !== '' ? parseFloat(tgtIn.value) : null,
            allotted_budget:       bIn?.value.trim()     || '',
            person_accountable:    pSel?.value           || '',
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
        year:              parseInt(document.getElementById('s_year')?.value)     || new Date().getFullYear(),
        semester:          document.getElementById('s_semester')?.value           || '1st',
        items,
    };
}

/* ── HYDRATE FROM DB ── */
function hydrateSpcrForm(form) {
    if (!form) return;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('s_emp_name',     form.employee_name     || form.prepared_by       || '');
    setVal('s_emp_position', form.employee_position || form.employee_title     || form.prepared_by_title || '');
    setVal('s_emp_unit',     form.employee_unit     || form.division           || '');
    setVal('s_period',       form.period            || form.area               || '');
    setVal('s_supervisor',   form.supervisor        || form.reviewed_by        || '');
    setVal('s_approved_by',  form.approved_by       || '');
    setVal('s_year',         form.year              || new Date().getFullYear());
    setVal('s_semester',     form.semester          || '1st');
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
                target_text:           item.target_text           || '',
                target_pct:            item.target_pct            ?? null,
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

/* ── EVENT LISTENERS ── */
document.getElementById('sSaveBtn').addEventListener('click', async () => {
    const data = readSpcrForm();
    if (!data.employee_name) {
        showAlert('s-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        const saved = await apiFetch('/api/spcr', 'POST', data);
        showAlert('s-alertOk', 'ok', `✔ SPCR for "${data.employee_name}" saved to database.`);
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('spcr', saved.form ?? saved);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

document.getElementById('sAddRowBtn').addEventListener('click', () => {
    const tr = createSpcrRow();
    document.getElementById('spcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('sAddSectionBtn').addEventListener('click', () => {
    const tr = createSectionRow('');
    document.getElementById('spcrBody').appendChild(tr);
    tr.querySelector('input').focus();
});

document.getElementById('sClearBtn').addEventListener('click', () => {
    if (!confirm('Clear all SPCR data?')) return;
    ['s_emp_name','s_emp_position','s_emp_unit','s_period','s_supervisor','s_approved_by'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = '\u00a0';
    // Reset with a styled Strategic Functions header
    const body = document.getElementById('spcrBody');
    body.innerHTML = '';
    body.appendChild(createSectionRow('STRATEGIC FUNCTIONS'));
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