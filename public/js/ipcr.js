/* ═══════════════════════════════════════════
   ipcr.js
   IPCR row factory, read, compute summary,
   hydrate, IPCR event listeners, and page init.
   Requires: shared.js, dpcr.js (for _getAllSpcrRows)
   Load LAST — init() calls all hydrate functions.
═══════════════════════════════════════════ */

/* ── ROW FACTORY ── */
function createIpcrRow(data = {}) {
    const tr = document.createElement('tr');

    // Strategic Goal / Objective
    const tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    const goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal / objective…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', () => autoExpand(goalTA));
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    // Performance / Success Indicator + link-from-SPCR button
    const tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:4px 5px;';

    const indTA = document.createElement('textarea');
    indTA.placeholder = 'Performance/Success Indicator (Targets + Measure)…';
    indTA.value = data.performance_indicator || '';
    indTA.addEventListener('input', () => autoExpand(indTA));

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
            const odTA = row.rowEl?.querySelector('textarea[data-key="strategic_goal"]');
            if (odTA?.value.trim()) { goalTA.value = odTA.value.trim(); autoExpand(goalTA); }
            _updateIpcrLinkBtn(lnkBtn, 'linked');
        });
    };

    tdInd.appendChild(indTA); tdInd.appendChild(lnkBtn);
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

    // Q E T A — numeric inputs (1–5)
    ['rating_q','rating_e','rating_t','rating_a'].forEach(key => {
        const td = document.createElement('td'); td.className = 'rating-cell';
        const inp = document.createElement('input'); inp.type = 'number';
        inp.min = '1'; inp.max = '5'; inp.step = '0.01';
        inp.placeholder = '—'; inp.value = data[key] != null ? data[key] : '';
        inp.style.cssText = 'width:100%;text-align:center;border:none;outline:none;background:transparent;font-size:10px;';
        td.appendChild(inp); tr.appendChild(td);
    });

    // Remarks
    const tdRem = document.createElement('td');
    const remTA = document.createElement('textarea');
    remTA.placeholder = 'Remarks / Justification…'; remTA.value = data.remarks || '';
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

function _updateIpcrLinkBtn(btn, val) {
    if (val) { btn.textContent = '🔗 view SPCR'; btn.style.color = '#1e6e3a'; }
    else      { btn.textContent = '⬡ link SPCR'; btn.style.color = ''; }
}

/* ── READ FORM ── */
function readIpcrForm() {
    const items = [];
    let currentFunctionType = 'Core';

    document.querySelectorAll('#ipcrBody tr').forEach(tr => {
        if (tr.classList.contains('section-header')) {
            const txt = (tr.querySelector('td')?.textContent || '').toUpperCase();
            if (txt.includes('SUPPORT'))      currentFunctionType = 'Support';
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
            function_type:         currentFunctionType,
            strategic_goal:        goalTA?.value.trim()  || '',
            performance_indicator: indTA?.value.trim()   || '',
            actual_accomplishment: aTA?.value.trim()     || null,
            accomplishment_rate:   rIn?.value.trim()     || null,
            rating_q:  qIn?.value  ? parseFloat(qIn.value)  : null,
            rating_e:  eIn?.value  ? parseFloat(eIn.value)  : null,
            rating_t:  tIn?.value  ? parseFloat(tIn.value)  : null,
            rating_a:  aRIn?.value ? parseFloat(aRIn.value) : null,
            remarks:               remTA?.value.trim()   || null,
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

/* ── COMPUTE SUMMARY ── */
function computeIpcrSummary() {
    const pctCore    = parseFloat(document.getElementById('i_pct_core').value)    / 100 || 0.70;
    const pctSupport = parseFloat(document.getElementById('i_pct_support').value) / 100 || 0.30;
    const avgCore    = parseFloat(document.getElementById('i_avg_core').value)    || 0;
    const avgSupport = parseFloat(document.getElementById('i_avg_support').value) || 0;

    const finalCore    = avgCore    * pctCore;
    const finalSupport = avgSupport * pctSupport;
    const finalAvg     = finalCore  + finalSupport;

    document.getElementById('i_final_core').textContent    = finalCore    ? finalCore.toFixed(8)    : '—';
    document.getElementById('i_final_support').textContent = finalSupport ? finalSupport.toFixed(8) : '—';
    document.getElementById('i_final_avg').textContent     = finalAvg     ? finalAvg.toFixed(2)     : '—';

    let adj = '—';
    if      (finalAvg >= 5) adj = 'Outstanding';
    else if (finalAvg >= 4) adj = 'Very Satisfactory';
    else if (finalAvg >= 3) adj = 'Satisfactory';
    else if (finalAvg >= 2) adj = 'Unsatisfactory';
    else if (finalAvg >= 1) adj = 'Poor';
    document.getElementById('i_adjectival').textContent = adj;
}

/* ── HYDRATE FROM DB ── */
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

/* ── EVENT LISTENERS ── */
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

document.getElementById('iAddRowBtn').addEventListener('click', () => {
    const tr = createIpcrRow();
    document.getElementById('ipcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

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

document.getElementById('iClearBtn').addEventListener('click', () => {
    if (!confirm('Clear all IPCR data?')) return;
    ['i_emp_name','i_emp_position','i_emp_unit','i_period',
     'i_supervisor','i_approved_by','i_recommending'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
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

/* Sync display name spans */
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

/* Summary recompute on input */
['i_pct_core','i_pct_support','i_avg_core','i_avg_support'].forEach(id => {
    document.getElementById(id).addEventListener('input', computeIpcrSummary);
});

/* ══════════════════════════════════════════
   INIT — runs once on page load
   Must be last; calls all hydrate functions.
══════════════════════════════════════════ */
(function init() {
    if (window.DB_LATEST_SPCR)        hydrateSpcrForm(window.DB_LATEST_SPCR);
    else if (window.DB_LATEST_MATRIX) hydrateSpcrForm(window.DB_LATEST_MATRIX); // back-compat

    if (window.DB_LATEST_DPCR) hydrateDpcrForm(window.DB_LATEST_DPCR);
    if (window.DB_LATEST_IPCR) hydrateIpcrForm(window.DB_LATEST_IPCR);

    // Force DPCR as the active tab on load
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-dpcr').classList.add('active');
    const firstTabBtn = document.querySelector('.tab-btn');
    if (firstTabBtn) firstTabBtn.classList.add('active');
})();