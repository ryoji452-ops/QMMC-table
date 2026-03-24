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

/* ── IPCR FUNCTION SECTION CONFIG ── */
const IPCR_FUNC_SECTIONS = [
    { label: 'CORE FUNCTIONS :',      type: 'Core',      color: '#1e6e3a', bg: '#d4edda' },
    { label: 'SUPPORT FUNCTIONS :',   type: 'Support',   color: '#7a4f00', bg: '#fff3cd' },
    { label: 'STRATEGIC FUNCTIONS :', type: 'Strategic', color: '#1a3b6e', bg: '#dce4f0' },
];

function _ipcrFuncTypeFromLabel(label) {
    var up = (label || '').toUpperCase();
    if (up.includes('SUPPORT'))  return 'Support';
    if (up.includes('STRATEGIC')) return 'Strategic';
    return 'Core';
}

function _styleIpcrSection(tr, label) {
    var cfg = IPCR_FUNC_SECTIONS.filter(function(f) { return f.type === _ipcrFuncTypeFromLabel(label); })[0]
           || IPCR_FUNC_SECTIONS[0];
    /* col 0 = drag handle (transparent), col 1 = blank actions, col 2 = section content */
    var tds = tr.querySelectorAll('td');
    var td  = tds[2] || tds[1] || tds[0];
    if (!td) return;
    td.style.background = cfg.bg;
    td.style.color      = cfg.color;
    td.style.fontWeight = '700';
    td.style.borderLeft = '4px solid ' + cfg.color;
}

/* ── IPCR SECTION ROW FACTORY ── */
function createIpcrSectionRow(label) {
    label = label || '';
    var tr = document.createElement('tr');
    tr.className = 'section-header';

    /* col 0: drag handle */
    tr.appendChild(makeDragHandle());

    /* col 1: blank actions placeholder — keeps columns aligned with data rows */
    var tdActBlank = document.createElement('td');
    tdActBlank.className = 'no-print';
    tdActBlank.style.cssText = 'border:none !important;background:transparent !important;padding:0;width:54px;min-width:54px;';
    tr.appendChild(tdActBlank);

    /* cols 2–10: section content spanning 9 data cols (goal→remarks) */
    var td = document.createElement('td');
    td.colSpan = 9;

    /* Quick-pick preset buttons */
    var btnBar = document.createElement('div');
    btnBar.className = 'no-print';
    btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
    IPCR_FUNC_SECTIONS.forEach(function(f) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = f.label;
        b.style.cssText = 'font-size:9px;font-family:Arial,sans-serif;font-weight:700;padding:2px 8px;'
            + 'border:1.5px solid ' + f.color + ';border-radius:3px;cursor:pointer;'
            + 'background:' + f.bg + ';color:' + f.color + ';transition:opacity .12s;';
        b.onclick = function() { inp.value = f.label; _styleIpcrSection(tr, f.label); };
        btnBar.appendChild(b);
    });

    var inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = 'Section name…';
    inp.className = 'section-label-input screen-only';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:10px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key = 'section_label';
    inp.value = label;

    /* Mirror span — visible on print, hidden on screen */
    var printSpan = document.createElement('span');
    printSpan.className = 'section-label-print';
    printSpan.style.cssText = 'font-weight:700;font-size:10px;vertical-align:middle;letter-spacing:.3px;';
    printSpan.textContent = label;

    inp.addEventListener('input', function() {
        _styleIpcrSection(tr, inp.value);
        printSpan.textContent = inp.value;
    });

    var del = document.createElement('button');
    del.type      = 'button';
    del.className = 'remove-btn no-print';
    del.innerHTML = '&times;';
    del.style.cssText = 'margin-left:8px;vertical-align:middle;';
    del.onclick = function() { tr.remove(); computeIpcrSummary(); };

    td.appendChild(btnBar);
    td.appendChild(inp);
    td.appendChild(printSpan);
    td.appendChild(del);
    tr.appendChild(td);

    /* Trailing no-print td — keeps td:last-child off the content cell on print */
    var tdTrail = document.createElement('td');
    tdTrail.className = 'no-print';
    tdTrail.style.cssText = 'border:none;background:transparent;padding:0;width:0;';
    tr.appendChild(tdTrail);

    if (label) _styleIpcrSection(tr, label);
    return tr;
}

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

    /* ? Guide button */
    var guideBtn = document.createElement('button');
    guideBtn.type      = 'button';
    guideBtn.className = 'row-action-btn no-print';
    guideBtn.title     = 'How is this row computed?';
    guideBtn.textContent = '? Guide';
    guideBtn.style.cssText = 'color:#6a3e9e;font-size:9px;';

    tdAct.appendChild(lnkBtn);
    tdAct.appendChild(viewLinkedBtn);
    tdAct.appendChild(guideBtn);
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

    /* cols 6–9: Q E T A — checkbox + number input, A auto-computed average */
    var ratingWidget = _buildQETACells({
        rating_q: data.rating_q,
        rating_e: data.rating_e,
        rating_t: data.rating_t,
        rating_a: data.rating_a,
        check_q:  data.check_q  !== undefined ? data.check_q  : false,
        check_e:  data.check_e  !== undefined ? data.check_e  : false,
        check_t:  data.check_t  !== undefined ? data.check_t  : false,
    }, function() { computeIpcrSummary(); });
    ratingWidget.cells.forEach(function(td) { tr.appendChild(td); });
    tr._ratingWidget = ratingWidget;

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
    dBtn.onclick = function() { tr.remove(); computeIpcrSummary(); };
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    /* Wire link button — opens full SPCR table view with per-row "Link" buttons */
    lnkBtn.onclick = function() {
        _openIpcrLinkFromSpcrTable(tr, indTA, goalTA, lnkBtn);
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

    /* Wire guide button */
    guideBtn.onclick = function() {
        _openViewModal('\u2139\uFE0F Computation Guide', '', _ratingComputeGuideHtml());
    };

    return tr;
}

/* ══════════════════════════════════════════════════════════════
   LINK FROM SPCR — full table view
   Opens the viewModal showing the entire live SPCR table.
   Each data row has a "Link" button the user clicks to pull
   that row's PI and Goal into the IPCR row.
══════════════════════════════════════════════════════════════ */
function _openIpcrLinkFromSpcrTable(ipcrTr, indTA, goalTA, lnkBtn) {
    /* Collect all SPCR data rows from the live DOM */
    var spcrDataRows = [];
    var currentSection = '';
    document.querySelectorAll('#spcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('spcr-section-row') || tr.classList.contains('spcr-avg-row')) {
            var inp = tr.querySelector('input[data-key="section_label"]');
            var tdC = tr.querySelector('td[colspan]');
            currentSection = (inp ? inp.value.trim() : (tdC ? tdC.textContent.trim() : '')) || currentSection;
            return;
        }
        var piTA   = tr.querySelector('textarea.pi-custom');
        var gTA    = tr.querySelector('textarea[data-key="strategic_goal"]');
        var pIn    = tr.querySelector('input[data-key="person_accountable"]');
        var cells  = tr.querySelectorAll('td');
        spcrDataRows.push({
            rowEl:    tr,
            section:  currentSection,
            goal:     gTA   ? gTA.value.trim()  : '',
            pi:       piTA  ? piTA.value.trim()  : '',
            person:   pIn   ? pIn.value.trim()   : '',
            actual:   cells[6] ? ((cells[6].querySelector('textarea') || {}).value || '') : '',
            rate:     cells[7] ? ((cells[7].querySelector('input')    || {}).value || '') : '',
            remarks:  cells[12]? ((cells[12].querySelector('textarea')|| {}).value || '') : '',
        });
    });

    var modal  = document.getElementById('viewModal');
    var titleEl = document.getElementById('viewModalTitle');
    var bodyEl  = document.getElementById('viewModalContent');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = 'Select a row from SPCR to link';

    if (!spcrDataRows.length) {
        bodyEl.innerHTML = '<p class="view-linked-empty" style="padding:18px 0;">'
            + 'No rows in the SPCR table. Add rows to SPCR first, or load a saved SPCR.'
            + '</p>';
        modal.classList.add('open');
        return;
    }

    /* Group rows under their section headers */
    var html = '<p style="font-size:10px;color:#555;margin-bottom:12px;font-style:italic;">'
        + 'Click <strong>Link</strong> on any row to copy its Performance Indicator and Strategic Goal into the IPCR row.'
        + '</p>';

    /* Build a full table — one <tbody> group per section */
    html += '<table class="view-tbl ipcr-link-spcr-table" style="width:100%;border-collapse:collapse;">'
        + '<thead><tr>'
        + '<th style="width:15%;">Strategic Goal</th>'
        + '<th style="width:22%;">Performance Indicator</th>'
        + '<th style="width:10%;">Person Accountable</th>'
        + '<th style="width:18%;">Actual Accomplishment</th>'
        + '<th style="width:8%;text-align:center;">Rate</th>'
        + '<th style="width:18%;">Remarks</th>'
        + '<th style="width:9%;text-align:center;" class="no-print">Action</th>'
        + '</tr></thead>';

    var lastSection = null;
    spcrDataRows.forEach(function(r, idx) {
        if (r.section !== lastSection) {
            /* Section header row inside the table */
            var secCfg = { color: '#1a3b6e', bg: '#dce4f0' };
            var up = (r.section || '').toUpperCase();
            if      (up.includes('CORE'))    secCfg = { color: '#1e6e3a', bg: '#d4edda' };
            else if (up.includes('SUPPORT')) secCfg = { color: '#7a4f00', bg: '#fff3cd' };
            html += '<tr><td colspan="7" style="background:' + secCfg.bg
                + ';color:' + secCfg.color
                + ';font-weight:700;border-left:4px solid ' + secCfg.color
                + ';padding:4px 8px;font-size:9.5px;letter-spacing:.3px;">'
                + esc(r.section || 'SECTION')
                + '</td></tr>';
            lastSection = r.section;
        }
        html += '<tr data-spcr-idx="' + idx + '">'
            + '<td>' + esc(r.goal   || '\u2014') + '</td>'
            + '<td><strong>' + esc(r.pi     || '\u2014') + '</strong></td>'
            + '<td>' + esc(r.person || '\u2014') + '</td>'
            + '<td>' + esc(r.actual || '\u2014') + '</td>'
            + '<td style="text-align:center;font-weight:700;">' + esc(r.rate   || '\u2014') + '</td>'
            + '<td>' + esc(r.remarks|| '\u2014') + '</td>'
            + '<td style="text-align:center;" class="no-print">'
            + '<button type="button" class="ipcr-link-pick-btn badge-btn badge-view" data-idx="' + idx + '" '
            + 'style="background:var(--navy);color:#fff;border:none;border-radius:3px;padding:3px 10px;'
            + 'font-size:10px;font-weight:700;cursor:pointer;font-family:Arial,sans-serif;">Link</button>'
            + '</td>'
            + '</tr>';
    });
    html += '</table>';

    bodyEl.innerHTML = html;
    modal.classList.add('open');

    /* Wire the Link buttons — use event delegation on the table */
    bodyEl.addEventListener('click', function handler(e) {
        var btn = e.target.closest('.ipcr-link-pick-btn');
        if (!btn) return;
        var idx = parseInt(btn.dataset.idx, 10);
        var row = spcrDataRows[idx];
        if (!row) return;

        /* Copy PI and Goal into the IPCR row */
        if (row.pi) {
            indTA.value = row.pi;
            autoExpand(indTA);
            if (typeof _rmEnsureLinkedRow === 'function') _rmEnsureLinkedRow(ipcrTr, indTA);
        }
        if (row.goal) {
            goalTA.value = row.goal;
            autoExpand(goalTA);
        }
        ipcrTr.dataset.linkedSpcrId = 'linked';
        _updateIpcrLinkBtn(lnkBtn, 'linked');

        /* Close modal and flash the IPCR row */
        modal.classList.remove('open');
        setTimeout(function() {
            ipcrTr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            ipcrTr.classList.add('row-highlight');
            setTimeout(function() { ipcrTr.classList.remove('row-highlight'); }, 2000);
        }, 80);

        bodyEl.removeEventListener('click', handler);
    });
}

/* ══════════════════════════════════════════════════════════════
   IPCR AVERAGE ROW — factory + rebuild
   Creates a summary row showing the average A(4) for a function
   group. Inserted just before each section-header row (i.e. at
   the bottom of the preceding function's rows) and at the very
   end of the tbody after the last function's rows.
══════════════════════════════════════════════════════════════ */

/* Create one avg row for a given function type + computed average */
function createIpcrAvgRow(funcType, avgValue) {
    var cfgMap = {
        Core:      { color: '#1e6e3a', bg: '#eaf6ee' },
        Support:   { color: '#7a4f00', bg: '#fdf6e3' },
        Strategic: { color: '#1a3b6e', bg: '#edf1f8' },
    };
    var cfg = cfgMap[funcType] || { color: '#333', bg: '#f5f5f5' };

    var tr = document.createElement('tr');
    tr.className = 'ipcr-avg-row';
    tr.dataset.funcType = funcType;
    tr.style.cssText = '-webkit-print-color-adjust:exact;print-color-adjust:exact;';

    /* col 0: drag-handle placeholder */
    var tdH = document.createElement('td');
    tdH.className = 'no-print';
    tdH.style.cssText = 'border:none;background:transparent;padding:0;width:18px;';
    tr.appendChild(tdH);

    /* col 1: actions placeholder */
    var tdA = document.createElement('td');
    tdA.className = 'no-print';
    tdA.style.cssText = 'border:none;background:transparent;padding:0;width:54px;';
    tr.appendChild(tdA);

    /* cols 2–8: label spanning goal → rate (7 cols) */
    var tdLabel = document.createElement('td');
    tdLabel.colSpan = 7;
    tdLabel.style.cssText = 'background:' + cfg.bg + ';color:' + cfg.color
        + ';font-weight:700;font-size:9.5px;text-align:right;padding:4px 10px;'
        + 'border-top:1.5px solid ' + cfg.color + ';letter-spacing:.2px;'
        + '-webkit-print-color-adjust:exact;print-color-adjust:exact;';
    tdLabel.textContent = 'Average Rating \u2014 ' + funcType + ' Functions:';
    tr.appendChild(tdLabel);

    /* col 9: A value */
    var tdVal = document.createElement('td');
    tdVal.className = 'ipcr-avg-val';
    tdVal.style.cssText = 'background:' + cfg.bg + ';color:' + cfg.color
        + ';font-weight:700;font-size:11px;text-align:center;padding:4px 6px;'
        + 'border-top:1.5px solid ' + cfg.color
        + ';-webkit-print-color-adjust:exact;print-color-adjust:exact;';
    tdVal.textContent = (avgValue !== null && !isNaN(avgValue))
        ? parseFloat(avgValue).toFixed(2)
        : '\u2014';
    tr.appendChild(tdVal);

    /* col 10: remarks — empty filler */
    var tdRem = document.createElement('td');
    tdRem.style.cssText = 'background:' + cfg.bg
        + ';border-top:1.5px solid ' + cfg.color
        + ';-webkit-print-color-adjust:exact;print-color-adjust:exact;';
    tr.appendChild(tdRem);

    /* col 11: delete button placeholder (no-print) */
    var tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;background:transparent;padding:0;width:26px;';
    tr.appendChild(tdDel);

    return tr;
}

/**
 * Rebuild all IPCR average rows.
 * Removes existing .ipcr-avg-row rows, then for each function group
 * (determined by section headers) inserts a fresh avg row just BEFORE
 * the next section-header (or at the end of the tbody for the last group).
 * Called at the end of computeIpcrSummary().
 */
function _rebuildIpcrAvgRows() {
    var body = document.getElementById('ipcrBody');
    if (!body) return;

    /* Remove existing avg rows */
    body.querySelectorAll('.ipcr-avg-row').forEach(function(r) { r.remove(); });

    /* Walk the tbody, grouping data rows by current function type */
    var groups = [];   /* [{type, lastDataRow}] */
    var currentType = 'Core';
    var lastDataRow = null;

    var rows = Array.from(body.querySelectorAll('tr'));
    rows.forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
            /* If we have a preceding group with data rows, record it */
            if (lastDataRow !== null) {
                groups.push({ type: currentType, lastDataRow: lastDataRow });
                lastDataRow = null;
            }
            /* Determine type from label */
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            var up = label.toUpperCase();
            if      (up.includes('SUPPORT'))   currentType = 'Support';
            else if (up.includes('STRATEGIC')) currentType = 'Strategic';
            else                               currentType = 'Core';
            return;
        }
        /* Skip any non-data rows (old avg rows already removed) */
        if (tr.classList.contains('ipcr-avg-row')) return;
        /* Any remaining row is a data row */
        lastDataRow = tr;
    });
    /* Handle the final group */
    if (lastDataRow !== null) {
        groups.push({ type: currentType, lastDataRow: lastDataRow });
    }

    /* Compute averages per type from _ratingWidget */
    var sums   = { Core: 0, Support: 0, Strategic: 0 };
    var counts = { Core: 0, Support: 0, Strategic: 0 };
    var curType = 'Core';
    Array.from(body.querySelectorAll('tr')).forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            var up = label.toUpperCase();
            if      (up.includes('SUPPORT'))   curType = 'Support';
            else if (up.includes('STRATEGIC')) curType = 'Strategic';
            else                               curType = 'Core';
            return;
        }
        if (tr.classList.contains('ipcr-avg-row')) return;
        var rw = tr._ratingWidget;
        if (!rw) return;
        var aVal = rw.getA();
        if (aVal !== null && !isNaN(aVal)) {
            sums[curType]   += aVal;
            counts[curType] += 1;
        }
    });

    /* Insert avg row after lastDataRow of each group */
    groups.forEach(function(g) {
        var avg = counts[g.type] ? sums[g.type] / counts[g.type] : null;
        var avgRow = createIpcrAvgRow(g.type, avg);
        /* Insert after lastDataRow */
        var next = g.lastDataRow.nextSibling;
        if (next) {
            body.insertBefore(avgRow, next);
        } else {
            body.appendChild(avgRow);
        }
    });
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
            var labelInp = tr.querySelector('input[data-key="section_label"]');
            var txt = (labelInp ? labelInp.value : ((tr.querySelector('td') || {}).textContent || '')).toUpperCase();
            if (txt.includes('SUPPORT'))    currentFunctionType = 'Support';
            else if (txt.includes('STRATEGIC')) currentFunctionType = 'Strategic';
            else if (txt.includes('CORE'))  currentFunctionType = 'Core';
            return;
        }
        if (tr.classList.contains('ipcr-avg-row')) return;  /* skip inline avg rows */
        var cells = tr.querySelectorAll('td');
        if (!cells.length) return;
        /* 0=drag,1=actions,2=goal,3=ind,4=actual,5=rate,6=Q,7=E,8=T,9=A,10=remarks,11=del */
        var goalTA = cells[2]  ? cells[2].querySelector('textarea')  : null;
        var indTA  = cells[3]  ? cells[3].querySelector('textarea')  : null;
        var aTA    = cells[4]  ? cells[4].querySelector('textarea')  : null;
        var rIn    = cells[5]  ? cells[5].querySelector('input')     : null;
        var remTA  = cells[10] ? cells[10].querySelector('textarea') : null;
        if (!goalTA && !indTA) return;
        var rw = tr._ratingWidget;
        items.push({
            function_type:         currentFunctionType,
            strategic_goal:        goalTA ? goalTA.value.trim() : '',
            performance_indicator: indTA  ? indTA.value.trim()  : '',
            actual_accomplishment: aTA    ? aTA.value.trim()    : null,
            accomplishment_rate:   rIn    ? rIn.value.trim()    : null,
            check_q:  rw ? rw.getCheckQ() : true,
            check_e:  rw ? rw.getCheckE() : true,
            check_t:  rw ? rw.getCheckT() : true,
            rating_q: rw ? rw.getQ()      : null,
            rating_e: rw ? rw.getE()      : null,
            rating_t: rw ? rw.getT()      : null,
            rating_a: rw ? rw.getA()      : null,
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
    /* Count rows and sum A(4) values per function type */
    var sums      = { Core: 0, Support: 0, Strategic: 0 };
    var counts    = { Core: 0, Support: 0, Strategic: 0 };  /* rows with A value */
    var rowCounts = { Core: 0, Support: 0, Strategic: 0 };  /* ALL data rows */
    var currentType = 'Core';

    document.querySelectorAll('#ipcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            var up = label.toUpperCase();
            if      (up.includes('SUPPORT'))   currentType = 'Support';
            else if (up.includes('STRATEGIC')) currentType = 'Strategic';
            else                               currentType = 'Core';
            return;
        }
        if (tr.classList.contains('ipcr-avg-row')) return;  /* skip inline avg rows */
        rowCounts[currentType] += 1;
        var rw = tr._ratingWidget;
        if (!rw) return;
        var aVal = rw.getA();
        if (aVal !== null && !isNaN(aVal)) {
            sums[currentType]   += aVal;
            counts[currentType] += 1;
        }
    });

    var totalRows = rowCounts.Core + rowCounts.Support + rowCounts.Strategic;

    /* Dynamic % per function = its row count ÷ total rows */
    var pctCore      = totalRows > 0 ? rowCounts.Core      / totalRows : 0;
    var pctSupport   = totalRows > 0 ? rowCounts.Support   / totalRows : 0;

    /* Auto-update the pct input fields to show the computed dynamic % */
    var pctCoreEl    = document.getElementById('i_pct_core');
    var pctSupportEl = document.getElementById('i_pct_support');
    if (pctCoreEl    && !pctCoreEl.dataset.manualOverride)
        pctCoreEl.value    = Math.round(pctCore    * 1000) / 10 + '%';
    if (pctSupportEl && !pctSupportEl.dataset.manualOverride)
        pctSupportEl.value = Math.round(pctSupport * 1000) / 10 + '%';

    /* If manually overridden, read the manual pct values instead */
    if (pctCoreEl    && pctCoreEl.dataset.manualOverride)
        pctCore    = parseFloat(pctCoreEl.value)    / 100 || pctCore;
    if (pctSupportEl && pctSupportEl.dataset.manualOverride)
        pctSupport = parseFloat(pctSupportEl.value) / 100 || pctSupport;

    /* Auto-fill avg inputs from A(4) row values (unless manually overridden) */
    var avgCoreEl    = document.getElementById('i_avg_core');
    var avgSupportEl = document.getElementById('i_avg_support');
    var autoCore     = counts.Core    ? (sums.Core    / counts.Core   ).toFixed(2) : '';
    var autoSupport  = counts.Support ? (sums.Support / counts.Support).toFixed(2) : '';
    if (avgCoreEl    && !avgCoreEl.dataset.manualOverride)    avgCoreEl.value    = autoCore;
    if (avgSupportEl && !avgSupportEl.dataset.manualOverride) avgSupportEl.value = autoSupport;

    var avgCore    = parseFloat(avgCoreEl    ? avgCoreEl.value    : 0) || 0;
    var avgSupport = parseFloat(avgSupportEl ? avgSupportEl.value : 0) || 0;

    /* Read raw numeric pct values for sum validation */
    var pctCoreNum    = parseFloat((pctCoreEl    ? pctCoreEl.value    : '').replace('%','')) || 0;
    var pctSupportNum = parseFloat((pctSupportEl ? pctSupportEl.value : '').replace('%','')) || 0;
    var pctTotal      = pctCoreNum + pctSupportNum;

    /* 100% validation warning */
    var warn = document.getElementById('ipcr_pct_warning');
    var pctOk = (pctCoreEl && pctSupportEl)
        ? Math.abs(pctTotal - 100) <= 0.05
        : true;  /* no inputs yet — don't warn */

    if (warn) {
        if (!pctOk && (pctCoreNum > 0 || pctSupportNum > 0)) {
            warn.textContent = '⚠ Percentages total ' + Math.round(pctTotal * 10) / 10 + '% — must equal 100%';
            warn.style.display = 'block';
        } else {
            warn.style.display = 'none';
        }
    }

    /* Style pct inputs red when invalid */
    if (pctCoreEl)    pctCoreEl.style.borderBottom    = pctOk ? '' : '2px solid #c00';
    if (pctSupportEl) pctSupportEl.style.borderBottom = pctOk ? '' : '2px solid #c00';

    var finalCore    = avgCore    * pctCore;
    var finalSupport = avgSupport * pctSupport;
    var finalAvg     = pctOk ? (finalCore + finalSupport) : 0;

    document.getElementById('i_final_core').textContent    = finalCore    ? finalCore.toFixed(8)    : '—';
    document.getElementById('i_final_support').textContent = finalSupport ? finalSupport.toFixed(8) : '—';
    document.getElementById('i_final_avg').textContent     = (finalAvg && pctOk) ? finalAvg.toFixed(2) : '—';

    var adj = '—';
    if (pctOk) {
        if      (finalAvg >= 5) adj = 'Outstanding';
        else if (finalAvg >= 4) adj = 'Very Satisfactory';
        else if (finalAvg >= 3) adj = 'Satisfactory';
        else if (finalAvg >= 2) adj = 'Unsatisfactory';
        else if (finalAvg >= 1) adj = 'Poor';
    }
    document.getElementById('i_adjectival').textContent = adj;

    /* Rebuild inline average rows inside ipcrBody */
    _rebuildIpcrAvgRows();
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
            check_q:               item.check_q,
            check_e:               item.check_e,
            check_t:               item.check_t,
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
        _persistClear(PERSIST_KEY_IPCR);
    } catch (err) { showAlert('i-alertErr', 'err', 'Save failed: ' + err.message); }
});

document.getElementById('iAddRowBtn').addEventListener('click', function() {
    var tr = createIpcrRow();
    document.getElementById('ipcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('iAddSectionBtn').addEventListener('click', function() {
    var tr = createIpcrSectionRow('');
    document.getElementById('ipcrBody').appendChild(tr);
    tr.querySelector('input[data-key="section_label"]').focus();
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
    var body = document.getElementById('ipcrBody');
    body.innerHTML = '';
    body.appendChild(createIpcrSectionRow('CORE FUNCTIONS :'));
    document.getElementById('i_avg_core').value    = '';
    document.getElementById('i_avg_support').value = '';
    computeIpcrSummary();
    _persistClear(PERSIST_KEY_IPCR);

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
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function() {
        /* Mark as manually overridden so auto-compute from rows won't clobber it.
           Clearing the field removes the override so auto-compute resumes. */
        el.dataset.manualOverride = el.value.trim() ? '1' : '';
        computeIpcrSummary();
    });
});

/* ── INIT ── */
(function init() {
    /* ── Priority order for each form: ──────────────────────────────
       1. localStorage draft  (most recent in-session work)
       2. Empty               (fresh / default blank state)
       NOTE: DB_LATEST_* is intentionally NOT used here so every page
       load starts blank unless the user had unsaved draft work.
       ─────────────────────────────────────────────────────────────── */

    var dpcrDraft = _persistLoad(PERSIST_KEY_DPCR);
    var spcrDraft = _persistLoad(PERSIST_KEY_SPCR);
    var ipcrDraft = _persistLoad(PERSIST_KEY_IPCR);

    /* DPCR — restore draft only, else leave the blade default blank */
    if (dpcrDraft) {
        hydrateDpcrForm(dpcrDraft);
    }

    /* SPCR — restore draft only, else leave blank */
    if (spcrDraft) {
        hydrateSpcrForm(spcrDraft);
    }

    /* IPCR — restore draft only, else leave blank */
    if (ipcrDraft) {
        hydrateIpcrForm(ipcrDraft);
    }

    initDragSort(document.getElementById('spcrBody'));
    initDragSort(document.getElementById('dpcrBody'));
    initDragSort(document.getElementById('ipcrBody'));

    /* After any drag-drop, recompute summaries + persist draft */
    var dpcrBody = document.getElementById('dpcrBody');
    var spcrBody = document.getElementById('spcrBody');
    var ipcrBody = document.getElementById('ipcrBody');

    registerDragCallback(function(tbody) {
        if (tbody === dpcrBody) {
            if (typeof computeDpcrFuncSummary === 'function') computeDpcrFuncSummary();
            _persistSave(PERSIST_KEY_DPCR, readDpcrForm);
        } else if (tbody === spcrBody) {
            if (typeof computeSpcrFuncSummary === 'function') computeSpcrFuncSummary();
            if (typeof computeSpcrAverages    === 'function') computeSpcrAverages();
            _persistSave(PERSIST_KEY_SPCR, readSpcrForm);
        } else if (tbody === ipcrBody) {
            if (typeof computeIpcrSummary === 'function') computeIpcrSummary();
            _persistSave(PERSIST_KEY_IPCR, readIpcrForm);
        }
    });

    /* ── Auto-save IPCR draft to localStorage on every change ── */
    _persistWireBody('ipcrBody', PERSIST_KEY_IPCR, readIpcrForm);
    ['i_emp_name','i_emp_position','i_emp_unit','i_period',
     'i_supervisor','i_approved_by','i_recommending'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', function() {
            _persistSave(PERSIST_KEY_IPCR, readIpcrForm);
        });
    });

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
            var secTr = createIpcrSectionRow(item.section_label || '');
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
        body.insertBefore(createIpcrSectionRow('CORE FUNCTIONS :'), body.firstChild);
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