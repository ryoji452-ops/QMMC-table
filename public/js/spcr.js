/* ═══════════════════════════════════════════════════════════════
   spcr.js  —  redesigned to match DOH-SPMS Form 3 photo
   ─────────────────────────────────────────────────────────────
   TABLE COLUMNS (0-based td index):
     0  drag-handle (no-print, 18px)
     1  row-actions  (no-print, 54px) ← push + view-links buttons
     2  Strategic Goals & Objectives
     3  Performance/Success Indicator
     4  Allotted Budget
     5  Person Accountable
     6  Actual Accomplishment
     7  Accomplishment Rate
     8  Q (1)
     9  E (2)
    10  T (3)
    11  A (4)
    12  Remarks/Justification
    13  Delete (screen only)
═══════════════════════════════════════════════════════════════ */

/* ── SECTION CONFIG ── */
const SPCR_FUNC_SECTIONS = [
    { label: 'STRATEGIC FUNCTIONS :', type: 'Strategic', color: '#1a3b6e', bg: '#dce4f0' },
    { label: 'CORE FUNCTIONS :',       type: 'Core',      color: '#1e6e3a', bg: '#d4edda' },
    { label: 'SUPPORT FUNCTIONS :',    type: 'Support',   color: '#7a4f00', bg: '#fff3cd' },
];

function _spcrFuncTypeFromLabel(label) {
    var up = (label || '').toUpperCase();
    if (up.includes('CORE'))    return 'Core';
    if (up.includes('SUPPORT')) return 'Support';
    return 'Strategic';
}

function _styleSpcrSection(tr, label) {
    var cfg = SPCR_FUNC_SECTIONS.filter(function(f) { return f.type === _spcrFuncTypeFromLabel(label); })[0]
           || SPCR_FUNC_SECTIONS[0];
    var tds = tr.querySelectorAll('td');
    /* col 0 = drag handle (transparent), col 1 = blank actions, col 2 = section content */
    var td = tds[2] || tds[1] || tds[0];
    if (!td) return;
    td.style.background = cfg.bg;
    td.style.color      = cfg.color;
    td.style.fontWeight = '700';
    td.style.borderLeft = '4px solid ' + cfg.color;
}

/* ══════════════════════════════════════════════════════════════
   SECTION FILTER — SPCR (sourced from saved DPCR records)
   ──────────────────────────────────────────────────────────────
   The dropdown is populated from every unique section_accountable
   value found across ALL saved DPCR records (from REC_DPCR in
   records.js, falling back to a fresh /api/dpcr fetch).

   "All Sections" selected  → load ALL rows from ALL saved DPCR
                              records into SPCR (replacing current rows).
   Specific section selected → load only rows whose section_accountable
                              contains that section value.
══════════════════════════════════════════════════════════════ */

/* Internal cache of fetched DPCR records for the filter */
var _spcrFilterDpcrCache = null;

/**
 * Fetch (and cache) all saved DPCR records with their items.
 * Uses REC_DPCR from records.js if already loaded, else hits /api/dpcr.
 */
async function _fetchDpcrRecords() {
    /* Prefer the already-loaded records.js cache */
    if (typeof REC_DPCR !== 'undefined' && Array.isArray(REC_DPCR) && REC_DPCR.length > 0) {
        _spcrFilterDpcrCache = REC_DPCR;
        return _spcrFilterDpcrCache;
    }
    if (_spcrFilterDpcrCache && _spcrFilterDpcrCache.length > 0) {
        return _spcrFilterDpcrCache;
    }
    try {
        _spcrFilterDpcrCache = await apiFetch('/api/dpcr');
    } catch (e) {
        _spcrFilterDpcrCache = [];
    }
    return _spcrFilterDpcrCache || [];
}

/**
 * Rebuild the section filter dropdown from the canonical SECTS list.
 * Uses the same choices as the Section Accountable multi-select widget
 * in DPCR — no duplicates, no async fetch required.
 * "ALL SECTIONS" is omitted (it is already represented by the "— All Sections —" placeholder).
 */
function rebuildSpcrSectionFilter() {
    var sel = document.getElementById('spcr-section-filter');
    if (!sel) return;
    while (sel.options.length > 1) sel.remove(1);
    SECTS.forEach(function(s) {
        if (s === 'ALL SECTIONS') return;
        var opt = document.createElement('option');
        opt.value = s; opt.textContent = s;
        sel.appendChild(opt);
    });
}

/**
 * Apply the section filter to SPCR:
 *   section = ''  → load ALL rows from ALL saved DPCR records into SPCR
 *   section = 'X' → load only rows whose section_accountable contains 'X'
 *
 * This replaces the current SPCR table rows entirely so the user
 * sees an accurate view of what was saved in DPCR.
 */
async function filterSpcrBySection(section) {
    var records = await _fetchDpcrRecords();

    /* Collect matching items from every saved DPCR record */
    var matchingItems = [];
    records.forEach(function(rec) {
        var items = Array.isArray(rec.items) ? rec.items : [];
        items.forEach(function(item) {
            if (!section) {
                /* All sections — include every item */
                matchingItems.push({ item: item, rec: rec });
            } else {
                /* Specific section — check if section_accountable contains the value */
                var sa = (item.section_accountable || '').toLowerCase();
                if (sa.includes(section.toLowerCase())) {
                    matchingItems.push({ item: item, rec: rec });
                }
            }
        });
    });

    /* Rebuild SPCR body from matching items */
    var body = document.getElementById('spcrBody');
    if (!body) return;
    body.innerHTML = '';

    if (matchingItems.length === 0 && section) {
        /* No matches — show an info row and restore avg rows */
        var infoTr = document.createElement('tr');
        var infoTd = document.createElement('td');
        infoTd.colSpan = 14;
        infoTd.style.cssText = 'text-align:center;padding:14px;color:#888;font-style:italic;font-size:10px;';
        infoTd.textContent = 'No DPCR records found with section: ' + section;
        infoTr.appendChild(infoTd);
        body.appendChild(infoTr);
        _ensureAvgRows();
        computeSpcrAverages();
        return;
    }

    if (matchingItems.length === 0 && !section) {
        /* No saved DPCR records at all — keep existing DOM rows visible */
        _ensureAvgRows();
        computeSpcrAverages();
        return;
    }

    /* Group by function_type for section headers */
    var lastType = null;
    matchingItems.forEach(function(entry) {
        var item = entry.item;
        var ft = item.function_type || 'Strategic';

        if (ft !== lastType) {
            var cfg = (typeof SPCR_FUNC_SECTIONS !== 'undefined'
                ? SPCR_FUNC_SECTIONS.filter(function(f) { return f.type === ft; })[0] : null)
                || { label: ft.toUpperCase() + ' FUNCTIONS :', type: ft, color: '#1a3b6e', bg: '#dce4f0' };
            body.appendChild(createSectionRow(cfg.label));
            lastType = ft;
        }

        var tr = createSpcrRow({
            strategic_goal:        item.strategic_goal        || '',
            performance_indicator: item.performance_indicator || '',
            allotted_budget:       item.allotted_budget       || '',
            person_accountable:    item.section_accountable   || '',
            actual_accomplishment: item.actual_accomplishment || '',
            accomplishment_rate:   item.accomplishment_rate   || '',
            remarks:               item.remarks               || '',
            pushed_from_dpcr:      true,
        });
        body.appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
        /* Auto-generate Rating Matrix row for this PI */
        (function(row) {
            var piTA = row.querySelector('textarea.pi-custom');
            if (piTA && piTA.value.trim() && typeof _rmEnsureLinkedRow === 'function') {
                _rmEnsureLinkedRow(row, piTA);
            }
        })(tr);
    });

    _ensureAvgRows();
    computeSpcrAverages();
}


/* ══════════════════════════════════════════════════════════════
   VIEW-LINKED MODAL
   Shows DPCR rows and IPCR rows whose PI matches this SPCR row.
══════════════════════════════════════════════════════════════ */
function _buildSpcrLinkedViewHtml(spcrPiText) {
    var needle = (spcrPiText || '').trim().toLowerCase();

    /* Matching DPCR rows */
    var dpcrRows = [];
    document.querySelectorAll('#dpcrBody tr:not(.section-header)').forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        if (cells.length < 3) return;
        /* col layout: 0=drag, 1=actions, 2=goal, 3=indicator ... */
        var goalTA = cells[2] ? cells[2].querySelector('textarea') : null;
        var indTA  = cells[3] ? cells[3].querySelector('textarea.pi-custom') : null;
        if (!indTA) return;
        var piVal = indTA.value.trim();
        if (!piVal) return;
        if (!needle || piVal.toLowerCase().includes(needle)) {
            var sections = '';
            if (tr._secMultiSel) {
                sections = tr._secMultiSel.getValues().join(', ');
            } else {
                var secEl = cells[5] ? cells[5].querySelector('select') : null;
                sections = secEl ? secEl.value : '—';
            }
            dpcrRows.push({
                goal:    goalTA ? goalTA.value.trim() : '—',
                pi:      piVal,
                sections: sections || '—',
                budget:  cells[4] ? ((cells[4].querySelector('input') || {}).value || '—') : '—',
                actual:  cells[6] ? ((cells[6].querySelector('textarea') || {}).value || '—') : '—',
                rate:    cells[7] ? ((cells[7].querySelector('input.dpcr-rate-hidden') || {}).value || '—') : '—',
            });
        }
    });

    /* Matching IPCR rows */
    var ipcrRows = [];
    document.querySelectorAll('#ipcrBody tr:not(.section-header)').forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        if (cells.length < 3) return;
        /* ipcr col layout: 0=drag, 1=actions, 2=goal, 3=indicator */
        var goalTA = cells[2] ? cells[2].querySelector('textarea') : null;
        var indTA  = cells[3] ? cells[3].querySelector('textarea') : null;
        if (!indTA) return;
        var piVal = indTA.value.trim();
        if (!piVal) return;
        if (!needle || piVal.toLowerCase().includes(needle)) {
            ipcrRows.push({
                goal:    goalTA ? goalTA.value.trim() : '—',
                pi:      piVal,
                actual:  cells[4] ? ((cells[4].querySelector('textarea') || {}).value || '—') : '—',
                rate:    cells[5] ? ((cells[5].querySelector('input')    || {}).value || '—') : '—',
                remarks: cells[10]? ((cells[10].querySelector('textarea')|| {}).value || '—') : '—',
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
            + '<th>Sections Accountable</th><th>Budget</th>'
            + '<th>Actual Accomplishment</th><th>Rate</th>'
            + '</tr></thead><tbody>';
        dpcrRows.forEach(function(r) {
            html += '<tr><td>' + esc(r.goal) + '</td><td>' + esc(r.pi) + '</td>'
                + '<td>' + esc(r.sections) + '</td><td>' + esc(r.budget) + '</td>'
                + '<td>' + esc(r.actual)   + '</td><td>' + esc(r.rate)  + '</td></tr>';
        });
        html += '</tbody></table>';
    }
    html += '</div>';

    html += '<div class="view-linked-section" style="margin-top:16px;">';
    html += '<div class="view-linked-title">\uD83D\uDFE3 Linked IPCR Rows <span class="view-linked-count">(' + ipcrRows.length + ')</span></div>';
    if (!ipcrRows.length) {
        html += '<p class="view-linked-empty">No matching IPCR rows found in the current session.</p>';
    } else {
        html += '<table class="view-tbl"><thead><tr>'
            + '<th>Strategic Goal</th><th>Performance Indicator</th>'
            + '<th>Actual Accomplishment</th><th>Rate</th><th>Remarks</th>'
            + '</tr></thead><tbody>';
        ipcrRows.forEach(function(r) {
            html += '<tr><td>' + esc(r.goal) + '</td><td>' + esc(r.pi) + '</td>'
                + '<td>' + esc(r.actual) + '</td><td>' + esc(r.rate) + '</td>'
                + '<td>' + esc(r.remarks) + '</td></tr>';
        });
        html += '</tbody></table>';
    }
    html += '</div>';

    return html;
}

/* ── ROW FACTORY ──
   Columns: drag(0) | actions(1) | goal(2) | indicator(3) | budget(4) |
            person(5) | actual(6) | rate(7) | Q(8) | E(9) | T(10) | A(11) |
            remarks(12) | del(13)
*/
function createSpcrRow(data) {
    data = data || {};
    var tr = document.createElement('tr');

    /* ── 0: drag handle ── */
    tr.appendChild(makeDragHandle());

    /* ── 1: row actions column (push + view links) ── */
    var tdAct = document.createElement('td');
    tdAct.className = 'spcr-row-actions no-print';

    if (data.pushed_from_dpcr) {
        var badge = document.createElement('div');
        badge.className   = 'spcr-lock-badge';
        badge.textContent = '↙ DPCR';
        tdAct.appendChild(badge);
    }

    /* → IPCR push button */
    var ipcrBtn = document.createElement('button');
    ipcrBtn.type      = 'button';
    ipcrBtn.className = 'row-action-btn';
    ipcrBtn.title     = 'Push this row to IPCR';
    ipcrBtn.textContent = '→ IPCR';
    ipcrBtn.style.color = '#6a3e9e';

    /* 👁 View linked rows button */
    var viewLinkedBtn = document.createElement('button');
    viewLinkedBtn.type      = 'button';
    viewLinkedBtn.className = 'row-action-btn';
    viewLinkedBtn.title     = 'View linked DPCR & IPCR rows';
    viewLinkedBtn.textContent = '👁 Links';
    viewLinkedBtn.style.color = '#555';

    tdAct.appendChild(ipcrBtn);
    tdAct.appendChild(viewLinkedBtn);
    tr.appendChild(tdAct);

    /* ── 2: Strategic Goals and Objectives ── */
    var tdGoal = document.createElement('td');
    var goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal / objective…';
    goalTA.dataset.key = 'strategic_goal';
    goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', function() { autoExpand(goalTA); });
    tdGoal.appendChild(goalTA);
    tr.appendChild(tdGoal);

    /* ── 3: Performance / Success Indicator ── */
    var tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:3px 4px;';

    var piTA = document.createElement('textarea');
    piTA.className   = 'pi-custom';
    piTA.placeholder = 'Performance/Success Indicator (Targets + Measure)…';
    piTA.dataset.key = 'performance_indicator';
    piTA.value = data.performance_indicator || '';
    piTA.addEventListener('input', function() {
        autoExpand(piTA);
        if (typeof _rmEnsureLinkedRow === 'function') _rmEnsureLinkedRow(tr, piTA);
    });

    tdInd.appendChild(piTA);
    tr.appendChild(tdInd);

    /* ── 4: Allotted Budget ── */
    var tdB = document.createElement('td');
    tdB.style.textAlign = 'center';
    var bIn = document.createElement('input');
    bIn.type = 'text'; bIn.placeholder = '—';
    bIn.dataset.key = 'allotted_budget';
    bIn.value = data.allotted_budget || '';
    bIn.style.textAlign = 'center';
    tdB.appendChild(bIn);
    tr.appendChild(tdB);

    /* ── 5: Person Accountable ── */
    var tdP = document.createElement('td');
    var pIn = document.createElement('input');
    pIn.type = 'text';
    pIn.placeholder = 'Person / Section…';
    pIn.dataset.key = 'person_accountable';
    pIn.value = data.person_accountable || '';
    pIn.style.cssText = 'width:100%;border:none;background:transparent;font-size:9.5px;font-family:Arial,sans-serif;outline:none;text-align:center;';
    tdP.appendChild(pIn);
    tr.appendChild(tdP);

    /* ── 6: Actual Accomplishment ── */
    var tdA = document.createElement('td');
    var aTA = document.createElement('textarea');
    aTA.placeholder = 'Actual accomplishment…';
    aTA.dataset.key = 'actual_accomplishment';
    aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', function() { autoExpand(aTA); });
    tdA.appendChild(aTA);
    tr.appendChild(tdA);

    /* ── 7: Accomplishment Rate ── */
    var tdR = document.createElement('td');
    tdR.style.cssText = 'text-align:center;vertical-align:middle;';
    var rIn = document.createElement('input');
    rIn.type = 'text'; rIn.placeholder = '—';
    rIn.dataset.key = 'accomplishment_rate';
    rIn.value = data.accomplishment_rate || '';
    rIn.style.cssText = 'width:100%;border:none;background:transparent;font-size:9.5px;font-family:Arial,sans-serif;outline:none;text-align:center;font-weight:700;';
    tdR.appendChild(rIn);
    tr.appendChild(tdR);

    /* ── 8–11: Q E T A rating cells ── */
    ['rating_q','rating_e','rating_t','rating_a'].forEach(function() {
        var td = document.createElement('td');
        td.className = 'spcr-rating-cell';
        tr.appendChild(td);
    });

    /* ── 12: Remarks / Justification ── */
    var tdRem = document.createElement('td');
    var remTA = document.createElement('textarea');
    remTA.placeholder = '—';
    remTA.dataset.key = 'remarks';
    remTA.value = data.remarks || '';
    remTA.addEventListener('input', function() { autoExpand(remTA); });
    tdRem.appendChild(remTA);
    tr.appendChild(tdRem);

    /* ── 13: Delete (screen only) ── */
    var tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    var dBtn = document.createElement('button');
    dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = function() { tr.remove(); computeSpcrAverages(); };
    tdDel.appendChild(dBtn);
    tr.appendChild(tdDel);

    /* ── Wire action buttons (need piTA / goalTA in scope) ── */
    ipcrBtn.onclick = function() {
        var pmText = piTA.value.trim();
        var odText = goalTA.value.trim();
        if (!pmText && !odText) {
            alert('Please fill in the Performance Indicator before pushing to IPCR.');
            return;
        }
        var newRow = createIpcrRow({
            strategic_goal:        odText,
            performance_indicator: pmText,
        });
        document.getElementById('ipcrBody').appendChild(newRow);
        newRow.querySelectorAll('textarea').forEach(autoExpand);
        ipcrBtn.textContent = '✔ sent';
        ipcrBtn.style.color = '#1e6e3a';
        setTimeout(function() { ipcrBtn.textContent = '→ IPCR'; ipcrBtn.style.color = '#6a3e9e'; }, 2000);
        switchTab('ipcr');
        setTimeout(function() {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newRow.classList.add('row-highlight');
            setTimeout(function() { newRow.classList.remove('row-highlight'); }, 2000);
        }, 100);
    };

    viewLinkedBtn.onclick = function() {
        var piText = piTA.value.trim();
        var titleStr = piText
            ? 'Linked rows for: \u201c' + piText.substring(0,60) + (piText.length > 60 ? '\u2026' : '') + '\u201d'
            : 'Linked DPCR & IPCR rows';
        var metaHtml = '<div class="view-meta">'
            + '<div><span>SPCR Indicator: </span><strong>' + esc(piText || '(empty)') + '</strong></div>'
            + '</div>';
        _openViewModal(titleStr, metaHtml, _buildSpcrLinkedViewHtml(piText));
    };

    return tr;
}

/* Backward-compat alias */
function createMatrixRow(data) {
    data = data || {};
    return createSpcrRow({
        strategic_goal:        data.operational_definition || '',
        performance_indicator: data.performance_measure    || '',
        remarks:               data.source_monitoring      || '',
        pushed_from_dpcr:      data.pushed_from_dpcr       || false,
    });
}

/* ── SECTION ROW FACTORY ── */
function createSectionRow(label) {
    label = label || '';
    var tr = document.createElement('tr');
    tr.className = 'spcr-section-row';

    /* col 0: drag handle — same as every data row */
    tr.appendChild(makeDragHandle());

    /* col 1: blank actions placeholder — keeps columns aligned with data rows */
    var tdActBlank = document.createElement('td');
    tdActBlank.className = 'spcr-section-act-blank no-print';
    tdActBlank.style.cssText = 'border:none !important;background:transparent !important;padding:0;width:54px;min-width:54px;';
    tr.appendChild(tdActBlank);

    /* cols 2–12: section content spanning 11 data cols (goal→remarks) */
    var td = document.createElement('td');
    td.colSpan = 11;

    /* Quick-pick preset buttons */
    var btnBar = document.createElement('div');
    btnBar.className = 'no-print';
    btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
    SPCR_FUNC_SECTIONS.forEach(function(f) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = f.label;
        b.style.cssText = 'font-size:9px;font-family:Arial,sans-serif;font-weight:700;padding:2px 8px;'
            + 'border:1.5px solid ' + f.color + ';border-radius:3px;cursor:pointer;'
            + 'background:' + f.bg + ';color:' + f.color + ';';
        b.onclick = function() { inp.value = f.label; _styleSpcrSection(tr, f.label); };
        btnBar.appendChild(b);
    });

    var inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = 'Section name…';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:9.5px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key = 'section_label';
    inp.value = label;
    inp.addEventListener('input', function() { _styleSpcrSection(tr, inp.value); });

    td.appendChild(btnBar);
    td.appendChild(inp);
    tr.appendChild(td);

    /* col 13: delete button */
    var tdD = document.createElement('td');
    tdD.className = 'no-print';
    tdD.style.cssText = 'border:none;background:transparent;text-align:center;vertical-align:middle;width:26px;';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'remove-btn';
    btn.innerHTML = '&times;'; btn.onclick = function() { tr.remove(); };
    tdD.appendChild(btn);
    tr.appendChild(tdD);

    if (label) _styleSpcrSection(tr, label);
    return tr;
}

/* ── AVERAGE RATING FOOTER ROW ── */
function createAvgRow(label, idSuffix) {
    var tr = document.createElement('tr');
    tr.className = 'spcr-avg-row';
    tr.id = 'spcr-avg-' + idSuffix;

    /* col 0: blank for drag-handle column */
    var tdHandle = document.createElement('td');
    tdHandle.className = 'no-print';
    tdHandle.style.cssText = 'border:none;background:transparent;padding:0;width:18px;';
    tr.appendChild(tdHandle);

    /* col 1: blank for actions column */
    var tdActBlank = document.createElement('td');
    tdActBlank.className = 'no-print';
    tdActBlank.style.cssText = 'border:none;background:transparent;';
    tr.appendChild(tdActBlank);

    /* cols 2–11: label spanning 10 data cols */
    var tdLabel = document.createElement('td');
    tdLabel.colSpan = 10;
    tdLabel.className = 'spcr-avg-label';
    tdLabel.textContent = 'Average Rating (' + label + ')';
    tr.appendChild(tdLabel);

    /* col 12: value */
    var tdVal = document.createElement('td');
    tdVal.className = 'spcr-avg-val';
    tdVal.id = 's_avg_' + idSuffix.toLowerCase();
    tdVal.textContent = '0.00';
    tr.appendChild(tdVal);

    /* col 13: blank delete column */
    var tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;background:transparent;';
    tr.appendChild(tdDel);

    return tr;
}

/* ── COMPUTE AVERAGES ── */
function computeSpcrAverages() {
    var stratSum = 0, stratCount = 0;
    var coreSum  = 0, coreCount  = 0;
    var current  = 'strategic';

    document.querySelectorAll('#spcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('spcr-section-row')) {
            /* Section content is now at td[2] (0=drag, 1=actions-blank, 2=content) */
            var tds = tr.querySelectorAll('td');
            var contentTd = tds[2] || tds[1] || tds[0];
            var txt = ((tr.querySelector('input[data-key="section_label"]') || {}).value
                    || (contentTd ? contentTd.textContent : '') || '').toUpperCase();
            current = txt.includes('CORE') ? 'core' : 'strategic';
            return;
        }
        if (tr.classList.contains('spcr-avg-row')) return;

        var cells = tr.querySelectorAll('td');
        /* A rating is in col 11 (0=drag,1=actions,2=goal,3=ind,4=bud,5=person,
           6=actual,7=rate,8=Q,9=E,10=T,11=A) */
        var aCell = cells[11];
        var val   = parseFloat(aCell ? aCell.textContent.trim() : '');
        if (!isNaN(val) && val > 0) {
            if (current === 'core') { coreSum += val; coreCount++; }
            else                    { stratSum += val; stratCount++; }
        }
    });

    var avgStrat = stratCount ? (stratSum / stratCount).toFixed(2) : '0.00';
    var avgCore  = coreCount  ? (coreSum  / coreCount ).toFixed(2) : '0.00';

    var elS = document.getElementById('s_avg_strategic');
    var elC = document.getElementById('s_avg_core');
    if (elS) elS.textContent = avgStrat;
    if (elC) elC.textContent = avgCore;
}

/* ── READ FORM ── */
function readSpcrForm() {
    var items = [];
    document.querySelectorAll('#spcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('spcr-section-row')) {
            var inp = tr.querySelector('input[data-key="section_label"]');
            var txt = tr.querySelector('td');
            items.push({ is_section: true, section_label: inp ? inp.value.trim() : (txt ? txt.textContent.trim() : '') });
            return;
        }
        if (tr.classList.contains('spcr-avg-row')) return;

        var cells = tr.querySelectorAll('td');
        /* 0=drag,1=actions,2=goal,3=ind,4=bud,5=person,6=actual,7=rate,...,12=remarks,13=del */
        if (cells.length < 12) return;

        items.push({
            is_section:            false,
            strategic_goal:        cells[2]  ? ((cells[2].querySelector('textarea')            || {}).value || '').trim() : '',
            performance_indicator: cells[3]  ? ((cells[3].querySelector('textarea.pi-custom') || {}).value || '').trim() : '',
            allotted_budget:       cells[4]  ? ((cells[4].querySelector('input')              || {}).value || '').trim() : '',
            person_accountable:    cells[5]  ? ((cells[5].querySelector('input')              || {}).value || '').trim() : '',
            actual_accomplishment: cells[6]  ? ((cells[6].querySelector('textarea')            || {}).value || '').trim() : '',
            accomplishment_rate:   cells[7]  ? ((cells[7].querySelector('input')              || {}).value || '').trim() : '',
            remarks:               cells[12] ? ((cells[12].querySelector('textarea')           || {}).value || '').trim() : '',
        });
    });

    var getVal = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    return {
        employee_name:     getVal('s_emp_name'),
        employee_position: getVal('s_emp_position'),
        period:            getVal('s_period'),
        supervisor:        getVal('s_supervisor'),
        approved_by:       getVal('s_approved_by'),
        year:              new Date().getFullYear(),
        semester:          '1st',
        items:             items,
    };
}

/* ── HYDRATE FROM DB ── */
function hydrateSpcrForm(form) {
    if (!form) return;
    var setVal = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('s_emp_name',     form.employee_name     || '');
    setVal('s_emp_position', form.employee_position || form.employee_title || '');
    setVal('s_period',       form.period            || '');
    setVal('s_supervisor',   form.supervisor        || form.reviewed_by   || '');
    setVal('s_approved_by',  form.approved_by       || '');

    var disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = form.employee_name || '\u00a0';

    var body = document.getElementById('spcrBody');
    body.innerHTML = '';

    (form.items || []).forEach(function(item) {
        if (item.is_section || item.type === 'section') {
            body.appendChild(createSectionRow(item.section_label || ''));
        } else {
            var tr = createSpcrRow({
                strategic_goal:        item.strategic_goal        || item.operational_definition || '',
                performance_indicator: item.performance_indicator || item.performance_measure    || '',
                allotted_budget:       item.allotted_budget       || '',
                person_accountable:    item.person_accountable    || '',
                actual_accomplishment: item.actual_accomplishment || '',
                accomplishment_rate:   item.accomplishment_rate   || '',
                remarks:               item.remarks               || item.source_monitoring      || '',
            });
            body.appendChild(tr);
            tr.querySelectorAll('textarea').forEach(autoExpand);
        }
    });

    _ensureAvgRows();
    computeSpcrAverages();
    rebuildSpcrSectionFilter();
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
document.getElementById('sSaveBtn').addEventListener('click', async function() {
    var data = readSpcrForm();
    if (!data.employee_name) {
        showAlert('s-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        var saved = await apiFetch('/api/spcr', 'POST', data);
        showAlert('s-alertOk', 'ok', '\u2714 SPCR for \u201c' + data.employee_name + '\u201d saved.');
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('spcr', saved.form || saved);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

document.getElementById('sAddRowBtn').addEventListener('click', function() {
    var body = document.getElementById('spcrBody');
    var avgS = document.getElementById('spcr-avg-strategic');
    var tr   = createSpcrRow();
    avgS ? body.insertBefore(tr, avgS) : body.appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('sAddSectionBtn').addEventListener('click', function() {
    var body = document.getElementById('spcrBody');
    var avgS = document.getElementById('spcr-avg-strategic');
    var tr   = createSectionRow('');
    avgS ? body.insertBefore(tr, avgS) : body.appendChild(tr);
    tr.querySelector('input').focus();
});

document.getElementById('sClearBtn').addEventListener('click', function() {
    if (!confirm('Clear all SPCR data?')) return;
    ['s_emp_name','s_emp_position','s_period','s_supervisor','s_approved_by'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
    });
    var disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = '\u00a0';

    var body = document.getElementById('spcrBody');
    body.innerHTML = '';
    body.appendChild(createSectionRow('STRATEGIC FUNCTIONS :'));
    body.appendChild(createAvgRow('Strategic', 'strategic'));
    body.appendChild(createSectionRow('CORE FUNCTIONS :'));
    body.appendChild(createAvgRow('Core', 'core'));
    computeSpcrAverages();

    var filterSel = document.getElementById('spcr-section-filter');
    if (filterSel) { filterSel.value = ''; filterSpcrBySection(''); }
});

/* Section filter change handler */
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'spcr-section-filter') {
        filterSpcrBySection(e.target.value);
    }
});

/* Sync display name as user types */
var sNameEl = document.getElementById('s_emp_name');
if (sNameEl) {
    sNameEl.addEventListener('input', function() {
        var disp = document.getElementById('s_disp_name');
        if (disp) disp.textContent = this.value || '\u00a0';
        syncShared();
    });
}
['s_emp_position','s_approved_by'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', syncShared);
});

/* ── INIT — default body structure ── */
(function spcrInit() {
    var body = document.getElementById('spcrBody');
    if (!body || body.children.length > 0) return;
    body.appendChild(createSectionRow('STRATEGIC FUNCTIONS :'));
    body.appendChild(createAvgRow('Strategic', 'strategic'));
    body.appendChild(createSectionRow('CORE FUNCTIONS :'));
    body.appendChild(createAvgRow('Core', 'core'));
})();

/* ══════════════════════════════════════════════════════════════
   LOAD FROM DPCR — SPCR action bar button
   ─────────────────────────────────────────────────────────────
   Fetches all saved DPCR forms from the API, shows them in a
   selection modal. When the user picks one:
     1. Opens a full-table VIEW of that DPCR's complete data in
        the viewModal so the user can review everything first.
     2. A "Load into SPCR" button inside the view lets them then
        push the whole table at once into the SPCR form.
══════════════════════════════════════════════════════════════ */

/* Build a full-detail view of one DPCR record (from API response shape) */
function _buildDpcrFullViewHtml(record) {
    var html = '';

    /* ── Header meta ── */
    html += '<div class="view-meta" style="margin-bottom:12px;">'
        + '<div><span>Employee: </span><strong>' + esc(record.employee_name  || '—') + '</strong></div>'
        + '<div><span>Title / Division: </span><strong>' + esc(record.employee_title || '—') + '</strong></div>'
        + '<div><span>Year: </span><strong>' + esc(String(record.year || '—')) + '</strong></div>'
        + '<div><span>Semester: </span><strong>' + esc(record.semester === '1st' ? '1st Semester (Jan–Jun)' : '2nd Semester (Jul–Dec)') + '</strong></div>'
        + '<div><span>Approved By: </span><strong>' + esc(record.approved_by || '—') + '</strong></div>'
        + '</div>';

    /* ── Items table ── */
    var items = Array.isArray(record.items) ? record.items : [];
    if (!items.length) {
        html += '<p class="view-linked-empty">No items in this DPCR record.</p>';
        return html;
    }

    html += '<table class="view-tbl">'
        + '<thead><tr>'
        + '<th>Type</th>'
        + '<th>Strategic Goal</th>'
        + '<th>Performance Indicator</th>'
        + '<th>Target %</th>'
        + '<th>Budget</th>'
        + '<th>Section Accountable</th>'
        + '<th>Actual Accomplishment</th>'
        + '<th>Actual %</th>'
        + '<th>Rate</th>'
        + '<th>Remarks</th>'
        + '</tr></thead><tbody>';

    var lastType = '';
    items.forEach(function(i) {
        var ft = i.function_type || 'Strategic';
        if (ft !== lastType) {
            var cfg = { Strategic: { color: '#1a3b6e', bg: '#dce4f0' },
                        Core:      { color: '#1e6e3a', bg: '#d4edda' },
                        Support:   { color: '#7a4f00', bg: '#fff3cd' } }[ft]
                   || { color: '#1a3b6e', bg: '#dce4f0' };
            html += '<tr><td colspan="10" style="background:' + cfg.bg
                + ';color:' + cfg.color
                + ';font-weight:700;border-left:4px solid ' + cfg.color
                + ';padding:4px 8px;font-size:9.5px;letter-spacing:.3px;">'
                + esc(ft.toUpperCase() + ' FUNCTIONS') + '</td></tr>';
            lastType = ft;
        }
        html += '<tr>'
            + '<td>' + esc(ft)                              + '</td>'
            + '<td>' + esc(i.strategic_goal        || '—')  + '</td>'
            + '<td>' + esc(i.performance_indicator || '—')  + '</td>'
            + '<td style="text-align:center;">' + esc(i.target_pct != null ? i.target_pct + '%' : '—') + '</td>'
            + '<td>' + esc(i.allotted_budget       || '—')  + '</td>'
            + '<td>' + esc(i.section_accountable   || '—')  + '</td>'
            + '<td>' + esc(i.actual_accomplishment || '—')  + '</td>'
            + '<td style="text-align:center;">' + esc(i.actual_pct != null ? i.actual_pct + '%' : '—') + '</td>'
            + '<td style="text-align:center;font-weight:700;">' + esc(i.accomplishment_rate || '—') + '</td>'
            + '<td>' + esc(i.remarks               || '—')  + '</td>'
            + '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

/* Load the selected DPCR record into the live SPCR form */
function _loadDpcrIntoSpcr(record) {
    if (!confirm('Load DPCR #' + record.id + ' (' + (record.employee_name || '?') + ') into the SPCR form?\nThis will replace all current SPCR rows.')) return;

    /* Close the view modal */
    if (typeof closeViewModal === 'function') closeViewModal();

    /* Use the existing pushDpcrToSpcr helper */
    if (typeof pushDpcrToSpcr === 'function') {
        pushDpcrToSpcr(record);
    }

    /* Rebuild section filter from new data */
    rebuildSpcrSectionFilter();

    showAlert('s-alertOk', 'ok',
        '\u2714 DPCR #' + record.id + ' (' + (record.employee_name || '') + ') loaded into SPCR.');
}

/* Open the DPCR-selection modal, then on pick show full-table view with Load button */
async function openDpcrSelectModal() {
    /* Show a loading state in the link modal */
    var listEl = document.getElementById('linkModalList');
    var titleEl = document.getElementById('linkModalTitle');
    if (!listEl || !titleEl) return;

    titleEl.textContent = 'Select a saved DPCR to load into SPCR';
    listEl.innerHTML = '<p style="color:#888;font-style:italic;padding:10px 0;">⏳ Loading saved DPCR forms…</p>';
    document.getElementById('linkModal').classList.add('open');

    var records;
    try {
        records = await apiFetch('/api/dpcr');
    } catch (err) {
        listEl.innerHTML = '<p style="color:#c00;padding:10px 0;">⚠ Failed to load: ' + esc(err.message) + '</p>';
        return;
    }

    if (!Array.isArray(records) || !records.length) {
        listEl.innerHTML = '<p style="color:#888;font-style:italic;padding:10px 0;">No saved DPCR forms found. Save a DPCR first.</p>';
        return;
    }

    listEl.innerHTML = '';
    records.forEach(function(rec) {
        var savedAt = rec.created_at
            ? new Date(rec.created_at).toLocaleString('en-PH', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })
            : '';
        var itemCount = Array.isArray(rec.items) ? rec.items.length : (rec.items_count || '?');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'link-row-btn';
        btn.innerHTML = '<span class="link-row-num">#' + rec.id + '</span>'
            + ' <strong>' + esc(rec.employee_name || '—') + '</strong>'
            + ' <span style="color:#555;font-weight:400;"> — ' + esc(rec.employee_title || '') + '</span>'
            + ' <span style="color:#888;font-size:9px;margin-left:6px;">'
            +   esc(String(rec.year || '')) + ' · ' + esc(rec.semester || '') + ' · '
            +   itemCount + ' items'
            +   (savedAt ? ' · ' + esc(savedAt) : '')
            + '</span>';

        btn.onclick = function() {
            /* Close the selection modal */
            document.getElementById('linkModal').classList.remove('open');

            /* Fetch full record (with items) then show view modal */
            apiFetch('/api/dpcr/' + rec.id).then(function(full) {
                /* Build the full-table view HTML */
                var bodyHtml = '<div class="view-linked-section">'
                    + '<div class="view-linked-title" style="margin-bottom:10px;">'
                    +   '📋 DPCR Form #' + full.id + ' — ' + esc(full.employee_name || '')
                    + '</div>'
                    + _buildDpcrFullViewHtml(full)
                    + '</div>';

                /* Inject a "Load into SPCR" button ABOVE the table */
                var loadBtnHtml = '<div style="margin-bottom:12px;">'
                    + '<button type="button" id="dpcrLoadIntoSpcrBtn" '
                    +   'style="background:var(--navy);color:#fff;border:none;border-radius:3px;'
                    +          'padding:6px 18px;font-size:11px;font-weight:700;cursor:pointer;'
                    +          'font-family:Arial,sans-serif;letter-spacing:.3px;">'
                    +   '⬇ Load Entire DPCR into SPCR'
                    + '</button>'
                    + '<span style="font-size:9.5px;color:#888;margin-left:10px;font-style:italic;">'
                    +   'Replaces all current SPCR rows with this DPCR\'s data.'
                    + '</span>'
                    + '</div>';

                _openViewModal(
                    'DPCR Form #' + full.id + ' — ' + esc(full.employee_name || ''),
                    '',
                    loadBtnHtml + bodyHtml
                );

                /* Wire the load button */
                var loadBtn = document.getElementById('dpcrLoadIntoSpcrBtn');
                if (loadBtn) {
                    loadBtn.onclick = function() { _loadDpcrIntoSpcr(full); };
                }
            }).catch(function(err) {
                _openViewModal('Error', '<p style="color:#c00;">Failed to load DPCR: ' + esc(err.message) + '</p>', '');
            });
        };

        listEl.appendChild(btn);
    });
}

/* Wire the "📋 Load from DPCR" button in the action bar */
(function _wireLoadDpcrBtn() {
    var btn = document.getElementById('sLoadDpcrBtn');
    if (btn) btn.addEventListener('click', openDpcrSelectModal);
})();