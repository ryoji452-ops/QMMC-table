/* ═══════════════════════════════════════════
   spcr.js
   SPCR row/section factories, averages,
   read, hydrate, and SPCR event listeners.
   Requires: shared.js, ipcr.js (for createIpcrRow)
═══════════════════════════════════════════ */

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

    // Allotted Budget
    const tdB = document.createElement('td'); tdB.style.textAlign = 'center';
    const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.dataset.key = 'allotted_budget'; bIn.value = data.allotted_budget || '';
    bIn.style.textAlign = 'center';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    // Person Accountable — dropdown matching DPCR Section Accountable
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

/* ── SECTION ROW FACTORY ── */
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
        // A-rating is column index 9 (0: goal, 1: ind, 2: budget, 3: person, 4: actual, 5: rate, 6:Q 7:E 8:T 9:A)
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
        const goalTA = cells[0]?.querySelector('textarea');
        const indTA  = cells[1]?.querySelector('textarea.pi-custom');
        const bIn    = cells[2]?.querySelector('input');
        const pSel   = cells[3]?.querySelector('select[data-key="person_accountable"]');
        const aTA    = cells[4]?.querySelector('textarea');
        const rIn    = cells[5]?.querySelector('input');
        const remTA  = cells[10]?.querySelector('textarea');
        items.push({
            is_section:            false,
            strategic_goal:        goalTA?.value.trim()  || '',
            performance_indicator: indTA?.value.trim()   || '',
            allotted_budget:       bIn?.value.trim()     || '',
            person_accountable:    pSel?.value          || '',
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

/* ── HYDRATE FROM DB ── */
function hydrateSpcrForm(form) {
    if (!form) return;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('s_emp_name',     form.employee_name     || form.prepared_by       || '');
    setVal('s_emp_position', form.employee_position || form.prepared_by_title || '');
    setVal('s_emp_unit',     form.employee_unit     || '');
    setVal('s_period',       form.period            || '');
    setVal('s_supervisor',   form.supervisor        || form.reviewed_by       || '');
    setVal('s_approved_by',  form.approved_by       || '');
    const disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = (form.employee_name || form.prepared_by || '\u00a0');

    document.getElementById('spcrBody').innerHTML = '';
    (form.items || []).forEach(item => {
        if (item.is_section || item.type === 'section') {
            document.getElementById('spcrBody').appendChild(createSectionRow(item.section_label || ''));
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

/* ── EVENT LISTENERS ── */
document.getElementById('sSaveBtn').addEventListener('click', async () => {
    const data = readSpcrForm();
    if (!data.employee_name) {
        showAlert('s-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        await apiFetch('/api/spcr', 'POST', data);
        showAlert('s-alertOk', 'ok', `✔ SPCR for "${data.employee_name}" saved to database.`);
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
    const tr = createSectionRow();
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
    document.getElementById('spcrBody').innerHTML =
        '<tr class="spcr-section-row"><td colspan="11">STRATEGIC FUNCTIONS :</td><td style="border:none;background:#f5f5f5;"></td></tr>';
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