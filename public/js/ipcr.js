/* ═══════════════════════════════════════════
   ipcr.js
   IPCR row factory, read, compute summary,
   hydrate, event listeners, and page init.
   Requires: shared.js, dpcr.js (for _getAllSpcrRows)
   Load LAST.

   TABLE COLUMNS (0-based td index):
     0  drag-handle  (no-print, 18px)
     1  row-actions  (no-print, 54px) ← link-SPCR + view-links
     2  Strategic Goal
     3  Performance Indicator
     4  Actual Accomplishment
     5  Accomplishment Rate
     6  Q (1)   7 E (2)   8 T (3)   9 A (4)
    10  Remarks
    11  Delete (no-print)
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   SECTION FILTER — IPCR (sourced from saved SPCR records)
   ──────────────────────────────────────────────────────────────
   Dropdown populated from every unique person_accountable value
   across ALL saved SPCR records.

   "— All Sections —" → show all rows from all saved SPCR records
   Specific section   → show only rows whose person_accountable
                        contains that section value
══════════════════════════════════════════════════════════════ */




/* ══════════════════════════════════════════════════════════════
   VIEW-LINKED MODAL
══════════════════════════════════════════════════════════════ */
function _buildIpcrLinkedViewHtml(ipcrPiText) {
    var needle = (ipcrPiText || '').trim().toLowerCase();

    /* DPCR rows — col layout: 0=drag,1=actions,2=goal,3=ind */
    var dpcrRows = [];
    document.querySelectorAll('#dpcrBody tr:not(.section-header)').forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        if (cells.length < 4) return;
        var goalTA = cells[2] ? cells[2].querySelector('textarea') : null;
        var indTA  = cells[3] ? cells[3].querySelector('textarea.pi-custom') : null;
        if (!indTA) return;
        var piVal = indTA.value.trim();
        if (!piVal) return;
        if (!needle || piVal.toLowerCase().includes(needle)) {
            var sections = tr._secMultiSel ? tr._secMultiSel.getValues().join(', ') : '—';
            dpcrRows.push({
                goal:    goalTA ? goalTA.value.trim() : '—',
                pi:      piVal,
                sections:sections || '—',
                actual:  cells[7] ? ((cells[7].querySelector('textarea') || {}).value || '—') : '—',
                rate:    cells[8] ? ((cells[8].querySelector('input.dpcr-rate-hidden') || {}).value || '—') : '—',
            });
        }
    });

    /* SPCR rows — col layout: 0=drag,1=actions,2=goal,3=ind,5=person,6=actual,7=rate */
    var spcrRows = [];
    document.querySelectorAll('#spcrBody tr:not(.spcr-section-row):not(.spcr-avg-row)').forEach(function(tr) {
        var piTA   = tr.querySelector('textarea.pi-custom');
        var goalTA = tr.querySelector('textarea[data-key="strategic_goal"]');
        if (!piTA) return;
        var piVal = piTA.value.trim();
        if (!piVal) return;
        if (!needle || piVal.toLowerCase().includes(needle)) {
            var cells = tr.querySelectorAll('td');
            spcrRows.push({
                goal:   goalTA ? goalTA.value.trim() : '—',
                pi:     piVal,
                person: (tr.querySelector('input[data-key="person_accountable"]') || {}).value || '—',
                actual: cells[6] ? ((cells[6].querySelector('textarea') || {}).value || '—') : '—',
                rate:   cells[7] ? ((cells[7].querySelector('input')    || {}).value || '—') : '—',
            });
        }
    });

    var html = '';

    html += '<div class="view-linked-section">';
    html += '<div class="view-linked-title">\uD83D\uDFE6 Linked DPCR Rows <span class="view-linked-count">(' + dpcrRows.length + ')</span></div>';
    if (!dpcrRows.length) {
        html += '<p class="view-linked-empty">No matching DPCR rows found in the current session.</p>';
    } else {
        html += '<table class="view-tbl"><thead><tr>'
            + '<th>Strategic Goal</th><th>Performance Indicator</th>'
            + '<th>Sections Accountable</th><th>Actual</th><th>Rate</th>'
            + '</tr></thead><tbody>';
        dpcrRows.forEach(function(r) {
            html += '<tr><td>' + esc(r.goal) + '</td><td>' + esc(r.pi) + '</td>'
                + '<td>' + esc(r.sections) + '</td><td>' + esc(r.actual) + '</td>'
                + '<td>' + esc(r.rate) + '</td></tr>';
        });
        html += '</tbody></table>';
    }
    html += '</div>';

    html += '<div class="view-linked-section" style="margin-top:16px;">';
    html += '<div class="view-linked-title">\uD83D\uDD35 Linked SPCR Rows <span class="view-linked-count">(' + spcrRows.length + ')</span></div>';
    if (!spcrRows.length) {
        html += '<p class="view-linked-empty">No matching SPCR rows found in the current session.</p>';
    } else {
        html += '<table class="view-tbl"><thead><tr>'
            + '<th>Strategic Goal</th><th>Performance Indicator</th>'
            + '<th>Person Accountable</th><th>Actual</th><th>Rate</th>'
            + '</tr></thead><tbody>';
        spcrRows.forEach(function(r) {
            html += '<tr><td>' + esc(r.goal) + '</td><td>' + esc(r.pi) + '</td>'
                + '<td>' + esc(r.person) + '</td><td>' + esc(r.actual) + '</td>'
                + '<td>' + esc(r.rate) + '</td></tr>';
        });
        html += '</tbody></table>';
    }
    html += '</div>';

    return html;
}

/* ── ROW FACTORY ── */
function createIpcrRow(data) {
    data = data || {};
    var tr = document.createElement('tr');

    /* col 0: drag handle */
    tr.appendChild(makeDragHandle());

    /* col 1: row actions column — link SPCR + view links */
    var tdAct = document.createElement('td');
    tdAct.className = 'spcr-row-actions no-print';

    var lnkBtn = document.createElement('button');
    lnkBtn.type = 'button'; lnkBtn.className = 'row-action-btn';
    lnkBtn.title = 'Link Performance Indicator from SPCR';
    tr.dataset.linkedSpcrId = data.linked_spcr_id || '';
    _updateIpcrLinkBtn(lnkBtn, tr.dataset.linkedSpcrId);

    var viewLinkedBtn = document.createElement('button');
    viewLinkedBtn.type      = 'button';
    viewLinkedBtn.className = 'row-action-btn';
    viewLinkedBtn.title     = 'View linked DPCR & SPCR rows';
    viewLinkedBtn.textContent = '👁 Links';
    viewLinkedBtn.style.color = '#555';

    tdAct.appendChild(lnkBtn);
    tdAct.appendChild(viewLinkedBtn);
    tr.appendChild(tdAct);

    /* col 2: Strategic Goal */
    var tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    var goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal / objective…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', function() { autoExpand(goalTA); });
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    /* col 3: Performance / Success Indicator */
    var tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:4px 5px;';
    var indTA = document.createElement('textarea');
    indTA.className   = 'pi-custom';
    indTA.placeholder = 'Performance/Success Indicator (Targets + Measure)…';
    indTA.dataset.key = 'performance_indicator';
    indTA.value = data.performance_indicator || '';
    indTA.addEventListener('input', function() {
        autoExpand(indTA);
        if (typeof _rmEnsureLinkedRow === 'function') _rmEnsureLinkedRow(tr, indTA);
    });
    tdInd.appendChild(indTA); tr.appendChild(tdInd);

    /* col 4: Actual Accomplishment */
    var tdA = document.createElement('td');
    var aTA = document.createElement('textarea');
    aTA.placeholder = 'Actual accomplishment…'; aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', function() { autoExpand(aTA); });
    tdA.appendChild(aTA); tr.appendChild(tdA);

    /* col 5: Accomplishment Rate */
    var tdR = document.createElement('td'); tdR.style.textAlign = 'center';
    var rIn = document.createElement('input'); rIn.type = 'text';
    rIn.placeholder = '100%'; rIn.value = data.accomplishment_rate || '';
    rIn.style.textAlign = 'center'; rIn.style.width = '100%';
    tdR.appendChild(rIn); tr.appendChild(tdR);

    /* cols 6–9: Q E T A numeric inputs */
    ['rating_q','rating_e','rating_t','rating_a'].forEach(function(key) {
        var td = document.createElement('td'); td.className = 'rating-cell';
        var inp = document.createElement('input'); inp.type = 'number';
        inp.min = '1'; inp.max = '5'; inp.step = '0.01';
        inp.placeholder = '—'; inp.value = data[key] != null ? data[key] : '';
        inp.style.cssText = 'width:100%;text-align:center;border:none;outline:none;background:transparent;font-size:10px;';
        td.appendChild(inp); tr.appendChild(td);
    });

    /* col 10: Remarks */
    var tdRem = document.createElement('td');
    var remTA = document.createElement('textarea');
    remTA.placeholder = 'Remarks / Justification…'; remTA.value = data.remarks || '';
    remTA.addEventListener('input', function() { autoExpand(remTA); });
    tdRem.appendChild(remTA); tr.appendChild(tdRem);

    /* col 11: Delete */
    var tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    var dBtn = document.createElement('button'); dBtn.type = 'button';
    dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = function() { tr.remove(); };
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    /* Wire link button */
    lnkBtn.onclick = function() {
        var spcrRows = _getAllSpcrRows();
        openLinkModal('Link from SPCR \u2014 Performance Measure', spcrRows, function(row) {
            tr.dataset.linkedSpcrId = row.rowEl ? (row.rowEl.rowIndex ? row.rowEl.rowIndex.toString() : 'linked') : 'linked';
            indTA.value = row.text || '';
            autoExpand(indTA);
            var odTA = row.rowEl ? row.rowEl.querySelector('textarea[data-key="strategic_goal"]') : null;
            if (odTA && odTA.value.trim()) { goalTA.value = odTA.value.trim(); autoExpand(goalTA); }
            _updateIpcrLinkBtn(lnkBtn, 'linked');
        });
    };

    /* Wire view-links button */
    viewLinkedBtn.onclick = function() {
        var piText = indTA.value.trim(), goalText = goalTA.value.trim();
        var titleStr = piText
            ? 'Linked rows for: \u201c' + piText.substring(0,60) + (piText.length > 60 ? '\u2026' : '') + '\u201d'
            : 'Linked DPCR & SPCR rows';
        var metaHtml = '<div class="view-meta">'
            + '<div><span>IPCR Indicator: </span><strong>' + esc(piText || '(empty)') + '</strong></div>'
            + '<div><span>Strategic Goal: </span><strong>' + esc(goalText || '(empty)') + '</strong></div>'
            + '</div>';
        _openViewModal(titleStr, metaHtml, _buildIpcrLinkedViewHtml(piText));
    };

    return tr;
}

function _updateIpcrLinkBtn(btn, val) {
    if (val) { btn.textContent = '\uD83D\uDD17 SPCR'; btn.style.color = '#1e6e3a'; }
    else      { btn.textContent = '\u2B21 link';      btn.style.color = ''; }
}

/* ── READ FORM ── */
function readIpcrForm() {
    var items = [];
    var currentFunctionType = 'Core';
    document.querySelectorAll('#ipcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
            var txt = ((tr.querySelector('td') || {}).textContent || '').toUpperCase();
            if (txt.includes('SUPPORT'))   currentFunctionType = 'Support';
            else if (txt.includes('CORE')) currentFunctionType = 'Core';
            return;
        }
        var cells = tr.querySelectorAll('td');
        if (!cells.length) return;
        /* 0=drag,1=actions,2=goal,3=ind,4=actual,5=rate,6=Q,7=E,8=T,9=A,10=remarks,11=del */
        var goalTA = cells[2]  ? cells[2].querySelector('textarea')  : null;
        var indTA  = cells[3]  ? cells[3].querySelector('textarea')  : null;
        var aTA    = cells[4]  ? cells[4].querySelector('textarea')  : null;
        var rIn    = cells[5]  ? cells[5].querySelector('input')     : null;
        var qIn    = cells[6]  ? cells[6].querySelector('input')     : null;
        var eIn    = cells[7]  ? cells[7].querySelector('input')     : null;
        var tIn    = cells[8]  ? cells[8].querySelector('input')     : null;
        var aRIn   = cells[9]  ? cells[9].querySelector('input')     : null;
        var remTA  = cells[10] ? cells[10].querySelector('textarea') : null;
        if (!goalTA && !indTA) return;
        items.push({
            function_type:         currentFunctionType,
            strategic_goal:        goalTA ? goalTA.value.trim() : '',
            performance_indicator: indTA  ? indTA.value.trim()  : '',
            actual_accomplishment: aTA    ? aTA.value.trim()    : null,
            accomplishment_rate:   rIn    ? rIn.value.trim()    : null,
            rating_q:  qIn  && qIn.value  ? parseFloat(qIn.value)  : null,
            rating_e:  eIn  && eIn.value  ? parseFloat(eIn.value)  : null,
            rating_t:  tIn  && tIn.value  ? parseFloat(tIn.value)  : null,
            rating_a:  aRIn && aRIn.value ? parseFloat(aRIn.value) : null,
            remarks:               remTA  ? remTA.value.trim()  : null,
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
        items:             items,
    };
}

/* ── COMPUTE SUMMARY ── */
function computeIpcrSummary() {
    var pctCore    = parseFloat(document.getElementById('i_pct_core').value)    / 100 || 0.70;
    var pctSupport = parseFloat(document.getElementById('i_pct_support').value) / 100 || 0.30;
    var avgCore    = parseFloat(document.getElementById('i_avg_core').value)    || 0;
    var avgSupport = parseFloat(document.getElementById('i_avg_support').value) || 0;
    var finalCore    = avgCore    * pctCore;
    var finalSupport = avgSupport * pctSupport;
    var finalAvg     = finalCore  + finalSupport;
    document.getElementById('i_final_core').textContent    = finalCore    ? finalCore.toFixed(8)    : '—';
    document.getElementById('i_final_support').textContent = finalSupport ? finalSupport.toFixed(8) : '—';
    document.getElementById('i_final_avg').textContent     = finalAvg     ? finalAvg.toFixed(2)     : '—';
    var adj = '—';
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
    (form.items || []).forEach(function(item) {
        var tr = createIpcrRow({
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
        /* Auto-generate Rating Matrix row for this PI */
        (function(row) {
            var piTA = row.querySelector('textarea.pi-custom');
            if (piTA && piTA.value.trim() && typeof _rmEnsureLinkedRow === 'function') {
                _rmEnsureLinkedRow(row, piTA);
            }
        })(tr);
    });
    computeIpcrSummary();
}

/* ── PRINT IPCR ONLY ── */
function printIpcr() {
    var allPages = document.querySelectorAll('.page');
    var ipcrPage = document.getElementById('page-ipcr');
    var wasActive = [];
    allPages.forEach(function(p) { wasActive.push(p.classList.contains('active')); p.classList.remove('active'); });
    if (ipcrPage) ipcrPage.classList.add('active');
    window.print();
    allPages.forEach(function(p, i) { if (wasActive[i]) p.classList.add('active'); });
}

/* ── EVENT LISTENERS ── */
document.getElementById('iSaveBtn').addEventListener('click', async function() {
    var data = readIpcrForm();
    if (!data.employee_name) { showAlert('i-alertErr', 'err', 'Please fill in the employee name.'); return; }
    try {
        var saved = await apiFetch('/api/ipcr', 'POST', data);
        showAlert('i-alertOk', 'ok', '\u2714 IPCR for \u201c' + data.employee_name + '\u201d saved to database.');
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('ipcr', saved.form || saved.ipcr || saved);
    } catch (err) { showAlert('i-alertErr', 'err', 'Save failed: ' + err.message); }
});

document.getElementById('iAddRowBtn').addEventListener('click', function() {
    var tr = createIpcrRow();
    document.getElementById('ipcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('iAddSectionBtn').addEventListener('click', function() {
    var tr = document.createElement('tr'); tr.className = 'section-header';
    tr.appendChild(makeDragHandle());
    /* actions blank col */
    var tdB = document.createElement('td'); tdB.className = 'no-print';
    tdB.style.cssText = 'border:none;background:transparent;';
    tr.appendChild(tdB);
    var td = document.createElement('td'); td.colSpan = 9;
    var inp = document.createElement('input'); inp.type = 'text';
    inp.placeholder = 'Section name (e.g. SUPPORT FUNCTIONS)';
    inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:bold;font-size:10px;outline:none;';
    var del = document.createElement('button'); del.type = 'button';
    del.className = 'remove-btn no-print'; del.innerHTML = '&times;'; del.style.marginLeft = '8px';
    del.onclick = function() { tr.remove(); };
    td.appendChild(inp); td.appendChild(del); tr.appendChild(td);
    document.getElementById('ipcrBody').appendChild(tr); inp.focus();
});

document.getElementById('iClearBtn').addEventListener('click', function() {
    if (!confirm('Clear all IPCR data?')) return;
    ['i_emp_name','i_emp_position','i_emp_unit','i_period',
     'i_supervisor','i_approved_by','i_recommending'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('i_disp_name').textContent       = '\u00a0';
    document.getElementById('i_disp_name2').textContent      = '\u00a0';
    document.getElementById('i_disp_supervisor').textContent = '\u00a0';
    document.getElementById('i_disp_approved').textContent   = '\u00a0';
    document.getElementById('ipcrBody').innerHTML =
        '<tr class="section-header"><td style="border:none;background:transparent;width:18px;padding:0;"></td><td colspan="10">CORE FUNCTIONS :</td></tr>';
    document.getElementById('i_avg_core').value    = '';
    document.getElementById('i_avg_support').value = '';
    computeIpcrSummary();

});

document.getElementById('i_emp_name').addEventListener('input', function() {
    document.getElementById('i_disp_name').textContent  = this.value || '\u00a0';
    document.getElementById('i_disp_name2').textContent = this.value || '\u00a0';
});
document.getElementById('i_supervisor').addEventListener('input', function() {
    document.getElementById('i_disp_supervisor').textContent = this.value || '\u00a0';
});
document.getElementById('i_approved_by').addEventListener('input', function() {
    document.getElementById('i_disp_approved').textContent = this.value || '\u00a0';
});

['i_pct_core','i_pct_support','i_avg_core','i_avg_support'].forEach(function(id) {
    document.getElementById(id).addEventListener('input', computeIpcrSummary);
});

/* ── INIT ── */
(function init() {
    if (window.DB_LATEST_SPCR)        hydrateSpcrForm(window.DB_LATEST_SPCR);
    else if (window.DB_LATEST_MATRIX) hydrateSpcrForm(window.DB_LATEST_MATRIX);

    if (window.DB_LATEST_DPCR) hydrateDpcrForm(window.DB_LATEST_DPCR);
    if (window.DB_LATEST_IPCR) hydrateIpcrForm(window.DB_LATEST_IPCR);

    initDragSort(document.getElementById('spcrBody'));
    initDragSort(document.getElementById('dpcrBody'));
    initDragSort(document.getElementById('ipcrBody'));

    rebuildSpcrSectionFilter();

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    var rmPage = document.getElementById('page-rating-matrix');
    if (rmPage) {
        rmPage.classList.add('active');
        var firstBtn = document.querySelector('.tab-btn');
        if (firstBtn) firstBtn.classList.add('active');
    } else {
        var fp = document.querySelector('.page'); if (fp) fp.classList.add('active');
        var fb = document.querySelector('.tab-btn'); if (fb) fb.classList.add('active');
    }
})();

/* ══════════════════════════════════════════════════════════════
   LOAD FROM SPCR — IPCR action bar button
   ─────────────────────────────────────────────────────────────
   Mirrors the SPCR "Load from DPCR" feature exactly.
   Fetches all saved SPCR forms, lets user pick one, shows full
   table view, then loads the whole SPCR into IPCR on confirm.
══════════════════════════════════════════════════════════════ */

/* Build full-detail view of one SPCR record */
function _buildSpcrFullViewHtml(record) {
    var html = '<div class="view-meta" style="margin-bottom:12px;">'
        + '<div><span>Employee: </span><strong>' + esc(record.employee_name  || '—') + '</strong></div>'
        + '<div><span>Position: </span><strong>' + esc(record.employee_position || record.employee_title || '—') + '</strong></div>'
        + '<div><span>Year: </span><strong>' + esc(String(record.year || '—')) + '</strong></div>'
        + '<div><span>Semester: </span><strong>' + esc(record.semester === '1st' ? '1st Semester (Jan–Jun)' : '2nd Semester (Jul–Dec)') + '</strong></div>'
        + '<div><span>Approved By: </span><strong>' + esc(record.approved_by || '—') + '</strong></div>'
        + '</div>';

    var items = Array.isArray(record.items) ? record.items.filter(function(i){ return !i.is_section; }) : [];
    if (!items.length) {
        html += '<p class="view-linked-empty">No items in this SPCR record.</p>';
        return html;
    }

    html += '<table class="view-tbl">'
        + '<thead><tr>'
        + '<th>Strategic Goal</th>'
        + '<th>Performance Indicator</th>'
        + '<th>Budget</th>'
        + '<th>Person Accountable</th>'
        + '<th>Actual Accomplishment</th>'
        + '<th>Rate</th>'
        + '<th>Remarks</th>'
        + '</tr></thead><tbody>';

    items.forEach(function(i) {
        html += '<tr>'
            + '<td>' + esc(i.strategic_goal        || '—') + '</td>'
            + '<td>' + esc(i.performance_indicator || '—') + '</td>'
            + '<td>' + esc(i.allotted_budget        || '—') + '</td>'
            + '<td>' + esc(i.person_accountable     || '—') + '</td>'
            + '<td>' + esc(i.actual_accomplishment  || '—') + '</td>'
            + '<td style="text-align:center;font-weight:700;">' + esc(i.accomplishment_rate || '—') + '</td>'
            + '<td>' + esc(i.remarks                || '—') + '</td>'
            + '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

/* Load the selected SPCR record into the live IPCR form */
function _loadSpcrIntoIpcr(record) {
    if (!confirm('Load SPCR #' + record.id + ' (' + (record.employee_name || '?') + ') into the IPCR form?\nThis will replace all current IPCR rows.')) return;

    if (typeof closeViewModal === 'function') closeViewModal();

    /* Clear IPCR body */
    var body = document.getElementById('ipcrBody');
    if (!body) return;
    body.innerHTML = '';

    /* Populate header fields from SPCR */
    var setVal = function(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('i_emp_name',     record.employee_name);
    setVal('i_emp_position', record.employee_position || record.employee_title);
    setVal('i_approved_by',  record.approved_by);

    var dispN = document.getElementById('i_disp_name');
    var dispN2 = document.getElementById('i_disp_name2');
    if (dispN  && record.employee_name) dispN.textContent  = record.employee_name;
    if (dispN2 && record.employee_name) dispN2.textContent = record.employee_name;

    /* Build IPCR rows from SPCR items */
    var items = Array.isArray(record.items) ? record.items : [];
    var lastSection = '';
    items.forEach(function(item) {
        /* Section header rows from SPCR pass through as section headers */
        if (item.is_section) {
            var secTr = document.createElement('tr');
            secTr.className = 'section-header';
            secTr.appendChild(makeDragHandle());
            var tdB = document.createElement('td');
            tdB.className = 'no-print';
            tdB.style.cssText = 'border:none;background:transparent;';
            secTr.appendChild(tdB);
            var tdC = document.createElement('td'); tdC.colSpan = 9;
            tdC.textContent = item.section_label || 'FUNCTIONS';
            secTr.appendChild(tdC);
            body.appendChild(secTr);
            lastSection = item.section_label || '';
            return;
        }
        var tr = createIpcrRow({
            strategic_goal:        item.strategic_goal        || '',
            performance_indicator: item.performance_indicator || '',
            actual_accomplishment: item.actual_accomplishment || '',
            accomplishment_rate:   item.accomplishment_rate   || '',
        });
        body.appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
    });

    /* If no sections came through, add a default CORE header */
    if (!body.querySelector('.section-header')) {
        var defSec = document.createElement('tr');
        defSec.className = 'section-header';
        defSec.appendChild(makeDragHandle());
        var tdBd = document.createElement('td');
        tdBd.className = 'no-print';
        tdBd.style.cssText = 'border:none;background:transparent;';
        defSec.appendChild(tdBd);
        var tdCd = document.createElement('td'); tdCd.colSpan = 9;
        tdCd.textContent = 'CORE FUNCTIONS :';
        defSec.appendChild(tdCd);
        body.insertBefore(defSec, body.firstChild);
    }

    computeIpcrSummary();

    showAlert('i-alertOk', 'ok',
        '\u2714 SPCR #' + record.id + ' (' + (record.employee_name || '') + ') loaded into IPCR.');
}

/* Open the SPCR-selection modal, then on pick show full-table view with Load button */
async function openSpcrSelectModal() {
    var listEl  = document.getElementById('linkModalList');
    var titleEl = document.getElementById('linkModalTitle');
    if (!listEl || !titleEl) return;

    titleEl.textContent = 'Select a saved SPCR to load into IPCR';
    listEl.innerHTML = '<p style="color:#888;font-style:italic;padding:10px 0;">\u23F3 Loading saved SPCR forms\u2026</p>';
    document.getElementById('linkModal').classList.add('open');

    var records;
    try {
        records = await apiFetch('/api/spcr');
    } catch (err) {
        listEl.innerHTML = '<p style="color:#c00;padding:10px 0;">\u26A0 Failed to load: ' + esc(err.message) + '</p>';
        return;
    }

    if (!Array.isArray(records) || !records.length) {
        listEl.innerHTML = '<p style="color:#888;font-style:italic;padding:10px 0;">No saved SPCR forms found. Save a SPCR first.</p>';
        return;
    }

    listEl.innerHTML = '';
    records.forEach(function(rec) {
        var savedAt = rec.created_at
            ? new Date(rec.created_at).toLocaleString('en-PH', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })
            : '';
        var itemCount = Array.isArray(rec.items) ? rec.items.filter(function(i){ return !i.is_section; }).length : (rec.items_count || '?');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'link-row-btn';
        btn.innerHTML = '<span class="link-row-num">#' + rec.id + '</span>'
            + ' <strong>' + esc(rec.employee_name || '—') + '</strong>'
            + ' <span style="color:#555;font-weight:400;"> — ' + esc(rec.employee_position || rec.employee_title || '') + '</span>'
            + ' <span style="color:#888;font-size:9px;margin-left:6px;">'
            +   esc(String(rec.year || '')) + ' \u00B7 ' + esc(rec.semester || '') + ' \u00B7 '
            +   itemCount + ' items'
            +   (savedAt ? ' \u00B7 ' + esc(savedAt) : '')
            + '</span>';

        btn.onclick = function() {
            document.getElementById('linkModal').classList.remove('open');

            apiFetch('/api/spcr/' + rec.id).then(function(full) {
                var loadBtnHtml = '<div style="margin-bottom:12px;">'
                    + '<button type="button" id="spcrLoadIntoIpcrBtn" '
                    +   'style="background:var(--navy);color:#fff;border:none;border-radius:3px;'
                    +          'padding:6px 18px;font-size:11px;font-weight:700;cursor:pointer;'
                    +          'font-family:Arial,sans-serif;letter-spacing:.3px;">'
                    +   '\u2B07 Load Entire SPCR into IPCR'
                    + '</button>'
                    + '<span style="font-size:9.5px;color:#888;margin-left:10px;font-style:italic;">'
                    +   'Replaces all current IPCR rows with this SPCR\u2019s data.'
                    + '</span>'
                    + '</div>';

                var bodyHtml = '<div class="view-linked-section">'
                    + '<div class="view-linked-title" style="margin-bottom:10px;">'
                    +   '\uD83D\uDCCB SPCR Form #' + full.id + ' \u2014 ' + esc(full.employee_name || '')
                    + '</div>'
                    + _buildSpcrFullViewHtml(full)
                    + '</div>';

                _openViewModal(
                    'SPCR Form #' + full.id + ' \u2014 ' + esc(full.employee_name || ''),
                    '',
                    loadBtnHtml + bodyHtml
                );

                var loadBtn = document.getElementById('spcrLoadIntoIpcrBtn');
                if (loadBtn) loadBtn.onclick = function() { _loadSpcrIntoIpcr(full); };
            }).catch(function(err) {
                _openViewModal('Error', '<p style="color:#c00;">Failed to load SPCR: ' + esc(err.message) + '</p>', '');
            });
        };

        listEl.appendChild(btn);
    });
}

/* Wire buttons */
(function _wireIpcrLoadBtns() {
    var loadBtn = document.getElementById('iLoadSpcrBtn');
    if (loadBtn) loadBtn.addEventListener('click', openSpcrSelectModal);
})();