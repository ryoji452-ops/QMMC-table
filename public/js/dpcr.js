/* ═══════════════════════════════════════════
   dpcr.js
   DPCR row factory, read, hydrate,
   and all DPCR event listeners.
   Requires: shared.js, spcr.js (for createSpcrRow)
═══════════════════════════════════════════ */

/* ── FUNCTION TYPE SECTION CONFIG ── */
const DPCR_FUNC_SECTIONS = [
    { label: 'STRATEGIC FUNCTIONS',  type: 'Strategic', color: '#1a3b6e', bg: '#dce4f0' },
    { label: 'CORE FUNCTIONS',        type: 'Core',      color: '#1e6e3a', bg: '#d4edda' },
    { label: 'SUPPORT FUNCTIONS',     type: 'Support',   color: '#7a4f00', bg: '#fff3cd' },
];

function _funcTypeFromLabel(label) {
    const up = (label || '').toUpperCase();
    if (up.includes('CORE'))     return 'Core';
    if (up.includes('SUPPORT'))  return 'Support';
    return 'Strategic';
}

/* Applies color to a section-header <tr> based on its label */
function _styleSection(tr, label) {
    const cfg = DPCR_FUNC_SECTIONS.find(f => f.type === _funcTypeFromLabel(label))
             || DPCR_FUNC_SECTIONS[0];
    const td = tr.querySelector('td');
    if (!td) return;
    td.style.background  = cfg.bg;
    td.style.color       = cfg.color;
    td.style.fontWeight  = '700';
    td.style.borderLeft  = `4px solid ${cfg.color}`;
}

/* ── SECTION ROW FACTORY ── */
function createDpcrSectionRow(label = '') {
    const tr = document.createElement('tr');
    tr.className = 'section-header';

    /* drag handle */
    tr.insertBefore(makeDragHandle(), tr.firstChild);

    const td = document.createElement('td');
    td.colSpan = 12;

    // Preset buttons for each function type
    const btnBar = document.createElement('div');
    btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
    DPCR_FUNC_SECTIONS.forEach(f => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = f.label;
        b.style.cssText = `font-size:9px;font-family:Arial,sans-serif;font-weight:700;padding:2px 8px;
            border:1.5px solid ${f.color};border-radius:3px;cursor:pointer;
            background:${f.bg};color:${f.color};transition:opacity .12s;`;
        b.onclick = () => {
            inp.value = f.label;
            _styleSection(tr, f.label);
        };
        btnBar.appendChild(b);
    });

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Section name…';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:10px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key   = 'section_label';
    inp.value         = label;
    inp.addEventListener('input', () => _styleSection(tr, inp.value));

    const del = document.createElement('button');
    del.type      = 'button';
    del.className = 'remove-btn';
    del.innerHTML = '&times;';
    del.style.marginLeft = '8px';
    del.style.verticalAlign = 'middle';
    del.onclick   = () => tr.remove();

    td.appendChild(btnBar);
    td.appendChild(inp);
    td.appendChild(del);
    tr.appendChild(td);

    // Apply color immediately if label is provided
    if (label) _styleSection(tr, label);

    return tr;
}

/* ── ROW FACTORY ── */
function createDpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // drag handle
    tr.appendChild(makeDragHandle());

    // ── Strategic Goal ──
    const tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    // ── Performance / Success Indicator (text) ──
    const tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:4px 5px;';

    const piTA = document.createElement('textarea');
    piTA.className = 'pi-custom';
    piTA.placeholder = 'Performance / Success Indicator…';
    piTA.value = data.performance_indicator || '';
    piTA.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;resize:none;overflow:hidden;min-height:36px;';
    piTA.addEventListener('input', () => autoExpand(piTA));

    const piViewBtn = document.createElement('button');
    piViewBtn.type = 'button'; piViewBtn.className = 'row-view-btn row-link-btn';
    piViewBtn.title = 'Push this row to SPCR';
    piViewBtn.textContent = '→ SPCR';
    piViewBtn.style.color = '#1a3b6e';

    piViewBtn.onclick = () => {
        const detail = piTA.value.trim();
        const goal   = goalTA.value.trim();
        if (!detail && !goal) {
            alert('Please fill in the Strategic Goal and Performance Indicator before pushing to SPCR.');
            return;
        }
        const newSpcrRow = createSpcrRow({
            strategic_goal:        goal,
            performance_indicator: detail,
            person_accountable:    tdS.querySelector('select')?.value || '',
            pushed_from_dpcr:      true,
        });
        document.getElementById('spcrBody').appendChild(newSpcrRow);
        newSpcrRow.querySelectorAll('textarea').forEach(autoExpand);

        piViewBtn.textContent = '✔ sent';
        piViewBtn.style.color = '#1e6e3a';
        setTimeout(() => { piViewBtn.textContent = '→ SPCR'; piViewBtn.style.color = '#1a3b6e'; }, 2000);

        switchTab('spcr');
        setTimeout(() => {
            newSpcrRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newSpcrRow.classList.add('row-highlight');
            setTimeout(() => newSpcrRow.classList.remove('row-highlight'), 2000);
        }, 100);
    };

    tdInd.appendChild(piTA);
    tdInd.appendChild(piViewBtn);
    tr.appendChild(tdInd);

    // ── Target % (expected integer) ──
    const tdTarget = document.createElement('td');
    tdTarget.style.cssText = 'text-align:center;vertical-align:middle;';
    const targetIn = document.createElement('input');
    targetIn.type        = 'number';
    targetIn.className   = 'dpcr-target-input';
    targetIn.placeholder = '0';
    targetIn.min         = '0';
    targetIn.max         = '100';
    targetIn.step        = '1';
    targetIn.value       = data.target_pct != null ? data.target_pct : '';
    targetIn.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;text-align:center;';
    const targetLabel = document.createElement('div');
    targetLabel.style.cssText = 'font-size:8px;color:#888;margin-top:1px;';
    targetLabel.textContent = 'Target %';
    tdTarget.appendChild(targetIn);
    tdTarget.appendChild(targetLabel);
    tr.appendChild(tdTarget);

    // ── Budget ──
    const tdB = document.createElement('td');
    const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.value = data.allotted_budget || '';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    // ── Section Accountable ──
    const tdS = document.createElement('td');
    const sel = document.createElement('select');
    sel.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;';
    SECTS.forEach(s => {
        const opt = document.createElement('option'); opt.value = s; opt.textContent = s;
        if (data.section_accountable === s) opt.selected = true;
        sel.appendChild(opt);
    });
    tdS.appendChild(sel); tr.appendChild(tdS);

    // ── Actual Accomplishment (text + actual % number) ──
    const tdA = document.createElement('td');
    tdA.style.cssText = 'vertical-align:top;padding:4px 5px;';
    const aTA = document.createElement('textarea');
    aTA.placeholder = 'Actual accomplishment…'; aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', () => autoExpand(aTA));

    const actualIn = document.createElement('input');
    actualIn.type        = 'number';
    actualIn.className   = 'dpcr-actual-input';
    actualIn.placeholder = '0';
    actualIn.min         = '0';
    actualIn.max         = '100';
    actualIn.step        = '1';
    actualIn.value       = data.actual_pct != null ? data.actual_pct : '';
    actualIn.style.cssText = 'width:100%;border:none;border-top:1px solid #e0e0e0;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;text-align:center;margin-top:3px;padding-top:2px;';
    const actualLabel = document.createElement('div');
    actualLabel.style.cssText = 'font-size:8px;color:#888;';
    actualLabel.textContent = 'Actual %';

    tdA.appendChild(aTA);
    tdA.appendChild(actualIn);
    tdA.appendChild(actualLabel);
    tr.appendChild(tdA);

    // ── Accomplishment Rate — auto-computed: (actual ÷ target) × 100 ──
    const tdR = document.createElement('td');
    tdR.style.cssText = 'text-align:center;vertical-align:middle;';
    const rateDisplay = document.createElement('div');
    rateDisplay.className = 'dpcr-rate-display';
    rateDisplay.style.cssText = 'font-weight:700;font-size:10px;color:var(--navy);';
    // Hidden input stores the computed value for readDpcrForm()
    const rateHidden = document.createElement('input');
    rateHidden.type = 'hidden';
    rateHidden.className = 'dpcr-rate-hidden';
    tdR.appendChild(rateDisplay);
    tdR.appendChild(rateHidden);
    tr.appendChild(tdR);

    /* Live computation */
    function computeRate() {
        const t = parseFloat(targetIn.value);
        const a = parseFloat(actualIn.value);
        if (!isNaN(t) && t > 0 && !isNaN(a)) {
            const rate = (a / t * 100).toFixed(2);
            rateDisplay.textContent = rate + '%';
            rateHidden.value        = rate + '%';
            rateDisplay.style.color = parseFloat(rate) >= 100 ? '#1e6e3a' : parseFloat(rate) >= 75 ? '#7a4f00' : '#b00020';
        } else {
            rateDisplay.textContent = '—';
            rateHidden.value        = '';
            rateDisplay.style.color = '#888';
        }
    }
    targetIn.addEventListener('input', computeRate);
    actualIn.addEventListener('input', computeRate);

    // Restore computed value on hydrate
    if (data.accomplishment_rate) {
        rateDisplay.textContent = data.accomplishment_rate;
        rateHidden.value        = data.accomplishment_rate;
        const rv = parseFloat(data.accomplishment_rate);
        if (!isNaN(rv)) {
            rateDisplay.style.color = rv >= 100 ? '#1e6e3a' : rv >= 75 ? '#7a4f00' : '#b00020';
        }
    } else {
        computeRate();
    }

    // ── Q E T A rating cells ──
    ['q','e','t','a'].forEach(() => {
        const td = document.createElement('td'); td.className = 'rating-cell';
        tr.appendChild(td);
    });

    // ── Remarks ──
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = '—'; remTA.value = data.remarks || '';
    remTA.addEventListener('input', () => autoExpand(remTA));
    tdRem.appendChild(remTA); tr.appendChild(tdRem);

    // ── Delete ──
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    const dBtn = document.createElement('button'); dBtn.type = 'button';
    dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = () => tr.remove();
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    return tr;
}

/* ── COLLECT SPCR ROWS (used by IPCR link modal) ── */
function _getAllSpcrRows() {
    const rows = [];
    document.querySelectorAll('#spcrBody tr').forEach(tr => {
        if (tr.classList.contains('spcr-section-row')) return;
        const goalTA = tr.querySelector('textarea[data-key="strategic_goal"]');
        const indTA  = tr.querySelector('textarea.pi-custom');
        rows.push({
            rowEl: tr,
            text:  indTA?.value.trim() || '(empty)',
            label: (indTA?.value.trim() || '(empty)') + (goalTA?.value.trim() ? ' — ' + goalTA.value.trim().substring(0,40) : ''),
        });
    });
    return rows;
}

/* ── READ FORM ──
   Infers function_type from the last section header seen (like SPCR). */
function readDpcrForm() {
    const items = [];
    let currentFunctionType = 'Strategic';

    document.querySelectorAll('#dpcrBody tr').forEach(tr => {
        if (tr.classList.contains('section-header')) {
            const inp = tr.querySelector('input[data-key="section_label"]');
            const label = inp ? inp.value.trim() : (tr.querySelector('td')?.textContent.trim() || '');
            currentFunctionType = _funcTypeFromLabel(label);
            return;
        }
        const cells = tr.querySelectorAll('td');
        if (!cells.length) return;
        const goalTA   = cells[1]?.querySelector('textarea');
        const indTA    = cells[2]?.querySelector('textarea.pi-custom');
        const targetIn = cells[3]?.querySelector('input.dpcr-target-input');
        const bIn      = cells[4]?.querySelector('input');
        const secSel   = cells[5]?.querySelector('select');
        const aTA      = cells[6]?.querySelector('textarea');
        const actualIn = cells[6]?.querySelector('input.dpcr-actual-input');
        const rateHid  = cells[7]?.querySelector('input.dpcr-rate-hidden');
        const remTA    = cells[12]?.querySelector('textarea');
        if (!goalTA && !indTA) return;
        items.push({
            function_type:         currentFunctionType,
            strategic_goal:        goalTA?.value.trim()    || '',
            performance_indicator: indTA?.value.trim()     || '',
            target_pct:            targetIn?.value !== '' ? parseFloat(targetIn.value) : null,
            allotted_budget:       bIn?.value.trim()       || null,
            section_accountable:   secSel?.value           || 'ALL SECTIONS',
            actual_accomplishment: aTA?.value.trim()       || null,
            actual_pct:            actualIn?.value !== '' ? parseFloat(actualIn.value) : null,
            accomplishment_rate:   rateHid?.value          || null,
            rating_q: false, rating_e: false, rating_t: false, rating_a: false,
            remarks:               remTA?.value.trim()     || null,
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

/* ── HYDRATE FROM DB ── */
function hydrateDpcrForm(form) {
    if (!form) return;
    document.getElementById('d_emp_name').value    = form.employee_name  || '';
    document.getElementById('d_emp_title').value   = form.employee_title || '';
    document.getElementById('d_approved_by').value = form.approved_by    || '';
    document.getElementById('d_disp_name').textContent = form.employee_name || '\u00a0';

    document.getElementById('dpcrBody').innerHTML = '';
    let lastType = null;

    (form.items || []).forEach(item => {
        // Insert a section header whenever the function type changes
        const ft = item.function_type || 'Strategic';
        if (ft !== lastType) {
            const cfg = DPCR_FUNC_SECTIONS.find(f => f.type === ft) || DPCR_FUNC_SECTIONS[0];
            const secTr = createDpcrSectionRow(cfg.label);
            document.getElementById('dpcrBody').appendChild(secTr);
            lastType = ft;
        }
        const tr = createDpcrRow({
            strategic_goal:        item.strategic_goal,
            performance_indicator: item.performance_indicator,
            target_pct:            item.target_pct,
            allotted_budget:       item.allotted_budget,
            section_accountable:   item.section_accountable,
            actual_accomplishment: item.actual_accomplishment,
            actual_pct:            item.actual_pct,
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

/* ── PUSH DPCR ITEMS → SPCR ──
   Called after save. Clears SPCR body and rebuilds it from
   DPCR items grouped by function type (Strategic / Core / Support). */
function pushDpcrToSpcr(dpcrData) {
    const body = document.getElementById('spcrBody');
    if (!body) return;

    // Clear existing SPCR rows
    body.innerHTML = '';

    // Group items by function_type preserving order
    let lastType = null;
    (dpcrData.items || []).forEach(item => {
        const ft = item.function_type || 'Strategic';

        // Insert a colored section header whenever the type changes
        if (ft !== lastType) {
            const cfg = SPCR_FUNC_SECTIONS
                ? SPCR_FUNC_SECTIONS.find(f => f.type === ft) || SPCR_FUNC_SECTIONS[0]
                : { label: ft.toUpperCase() + ' FUNCTIONS', type: ft, color: '#1a3b6e', bg: '#dce4f0' };
            if (typeof createSectionRow === 'function') {
                body.appendChild(createSectionRow(cfg.label));
            }
            lastType = ft;
        }

        // Create SPCR row from DPCR item
        if (typeof createSpcrRow === 'function') {
            const tr = createSpcrRow({
                strategic_goal:        item.strategic_goal        || '',
                performance_indicator: item.performance_indicator || '',
                target_text:           item.target_text           || '',
                target_pct:            item.target_pct            ?? null,
                allotted_budget:       item.allotted_budget       || '',
                person_accountable:    item.section_accountable   || '',
                actual_accomplishment: item.actual_accomplishment || '',
                accomplishment_rate:   item.accomplishment_rate   || '',
                pushed_from_dpcr:      true,
            });
            body.appendChild(tr);
            tr.querySelectorAll('textarea').forEach(autoExpand);
        }
    });

    // Sync employee info to SPCR header fields
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('s_emp_name',    dpcrData.employee_name);
    setVal('s_emp_position', dpcrData.employee_title);
    setVal('s_approved_by', dpcrData.approved_by);
    const disp = document.getElementById('s_disp_name');
    if (disp && dpcrData.employee_name) disp.textContent = dpcrData.employee_name;
}

/* ── EVENT LISTENERS ── */
document.getElementById('dSaveBtn').addEventListener('click', async () => {
    const data = readDpcrForm();
    if (!data.employee_name) {
        showAlert('d-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        const saved = await apiFetch('/api/dpcr', 'POST', data);
        showAlert('d-alertOk', 'ok', `✔ DPCR for "${data.employee_name}" saved — pushing to SPCR…`);

        // 1. Notify Records page
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('dpcr', saved.form ?? saved);

        // 2. Push all items into SPCR and switch tab
        pushDpcrToSpcr(data);
        switchTab('spcr');

        // 3. Brief highlight so user sees what was pushed
        setTimeout(() => {
            document.querySelectorAll('#spcrBody tr:not(.spcr-section-row)').forEach(tr => {
                tr.classList.add('row-highlight');
                setTimeout(() => tr.classList.remove('row-highlight'), 2000);
            });
        }, 150);

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

/* Add Section — shows quick-pick buttons for Strategic / Core / Support */
document.getElementById('dAddSectionBtn').addEventListener('click', () => {
    const tr = createDpcrSectionRow('');
    document.getElementById('dpcrBody').appendChild(tr);
    tr.querySelector('input').focus();
});