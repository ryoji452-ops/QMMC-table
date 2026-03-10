/* ═══════════════════════════════════════════
   dpcr.js
   DPCR row factory, read, hydrate,
   and all DPCR event listeners.
   Requires: shared.js, spcr.js (for createSpcrRow)
═══════════════════════════════════════════ */

/* ── ROW FACTORY ── */
function createDpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // Strategic Goal
    const tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    // Performance / Success Indicator — dropdown + freetext + push-to-SPCR
    const tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:4px 5px;';

    const piSel = document.createElement('select');
    piSel.className = 'pi-select';
    piSel.style.cssText = 'width:100%;border:none;border-bottom:1px solid #ccc;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;margin-bottom:3px;';
    const blankOpt = document.createElement('option');
    blankOpt.value = ''; blankOpt.textContent = '— select indicator —';
    piSel.appendChild(blankOpt);
    PERF_INDICATORS.forEach(pi => {
        const opt = document.createElement('option');
        opt.value = pi.id; opt.textContent = pi.label;
        opt.dataset.piLabel = pi.label;
        if (data.pi_id === pi.id) opt.selected = true;
        piSel.appendChild(opt);
    });

    const piTA = document.createElement('textarea');
    piTA.className = 'pi-custom';
    piTA.placeholder = 'Additional detail / measure…';
    piTA.value = data.performance_indicator || '';
    piTA.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;resize:none;overflow:hidden;min-height:36px;';
    piTA.addEventListener('input', () => autoExpand(piTA));

    const piViewBtn = document.createElement('button');
    piViewBtn.type = 'button'; piViewBtn.className = 'row-view-btn row-link-btn';
    piViewBtn.title = 'Push this row to SPCR';
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

        const pmText = [piLabel, detail].filter(Boolean).join(' — ');
        const newSpcrRow = createSpcrRow({
            strategic_goal:        goal,
            performance_indicator: pmText,
            person_accountable:    tdS.querySelector('select')?.value || '',
            pushed_from_dpcr:      true,
        });
        document.getElementById('spcrBody').appendChild(newSpcrRow);
        newSpcrRow.querySelectorAll('textarea').forEach(autoExpand);
        newSpcrRow.dataset.linkedPiId = piId;

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

    tdInd.appendChild(piSel);
    tdInd.appendChild(piTA);
    tdInd.appendChild(piViewBtn);
    tr.appendChild(tdInd);

    // Budget
    const tdB = document.createElement('td');
    const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.value = data.allotted_budget || '';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    // Section Accountable
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

    // Accomplishment Rate
    const tdR = document.createElement('td'); tdR.style.textAlign = 'center';
    const rIn = document.createElement('input'); rIn.type = 'text'; rIn.placeholder = 'e.g. 85%';
    rIn.value = data.accomplishment_rate || ''; rIn.style.textAlign = 'center';
    tdR.appendChild(rIn); tr.appendChild(tdR);

    // Q E T A rating cells — empty
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

/* ── READ FORM ── */
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

/* ── HYDRATE FROM DB ── */
function hydrateDpcrForm(form) {
    if (!form) return;
    document.getElementById('d_emp_name').value    = form.employee_name  || '';
    document.getElementById('d_emp_title').value   = form.employee_title || '';
    document.getElementById('d_approved_by').value = form.approved_by    || '';
    document.getElementById('d_disp_name').textContent = form.employee_name || '\u00a0';

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

/* ── EVENT LISTENERS ── */
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