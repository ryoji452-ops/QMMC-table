/* ═══════════════════════════════════════════════════════════════
   spcr.js  —  redesigned to match DOH-SPMS Form 3 photo
   DIFF: computeSpcrFuncSummary row builder updated to match
         new 8-column summary table format (same as DPCR).
         All other functions unchanged.
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
    { label: 'STRATEGIC FUNCTIONS :', type: 'Strategic',  },
    { label: 'CORE FUNCTIONS :',       type: 'Core',       },
    { label: 'SUPPORT FUNCTIONS :',    type: 'Support',   },
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
    var td = tds[2] || tds[1] || tds[0];
    if (!td) return;
    td.style.background = cfg.bg;
    td.style.color      = cfg.color;
    td.style.fontWeight = '700';
    td.style.borderLeft = '4px solid ' + cfg.color;
}

/* ══════════════════════════════════════════════════════════════
   SECTION FILTER — SPCR
══════════════════════════════════════════════════════════════ */

var _spcrFilterDpcrCache = null;

async function _fetchDpcrRecords() {
    try {
        _spcrFilterDpcrCache = await apiFetch('/api/dpcr');
    } catch (e) {
        console.warn('SPCR filter: could not load DPCR records', e.message);
        _spcrFilterDpcrCache = [];
    }
    return _spcrFilterDpcrCache || [];
}

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

async function filterSpcrBySection(section) {
    var records = await _fetchDpcrRecords();

    function _matchesSection(saRaw, needle) {
        if (!needle) return true;
        var sa = (saRaw || '').trim();
        if (!sa) return false;
        if (sa === 'ALL SECTIONS') return true;
        var tokens = sa.split(',').map(function(t) { return t.trim().toLowerCase(); });
        return tokens.indexOf(needle.trim().toLowerCase()) !== -1;
    }

    var matchingItems = [];
    records.forEach(function(rec) {
        var items = Array.isArray(rec.items) ? rec.items : [];
        items.forEach(function(item) {
            if (_matchesSection(item.section_accountable, section)) {
                matchingItems.push({ item: item, rec: rec });
            }
        });
    });

    /* Reset the SPCR Rating Matrix before rebuilding the table so stale
       RM rows don't accumulate on top of the previous filter's rows. */
    if (window.RM_SPCR && typeof window.RM_SPCR.reset === 'function') {
        window.RM_SPCR.reset();
    }

    var body = document.getElementById('spcrBody');
    if (!body) return;
    body.innerHTML = '';

    if (matchingItems.length === 0) {
        var infoTr = document.createElement('tr');
        var infoTd = document.createElement('td');
        infoTd.colSpan = 14;
        infoTd.style.cssText = 'text-align:center;padding:14px;color:#888;font-style:italic;font-size:10px;';
        infoTd.textContent = section
            ? 'No DPCR records found with section accountable: ' + section
            : 'No saved DPCR records found. Save a DPCR form first.';
        infoTr.appendChild(infoTd);
        body.appendChild(infoTr);
        return;
    }

    var FT_ORDER = { Strategic: 0, Core: 1, Support: 2 };
    matchingItems.sort(function(a, b) {
        var fa = FT_ORDER[a.item.function_type] !== undefined ? FT_ORDER[a.item.function_type] : 99;
        var fb = FT_ORDER[b.item.function_type] !== undefined ? FT_ORDER[b.item.function_type] : 99;
        return fa - fb;
    });

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
            rating_q:              item.rating_q              != null ? item.rating_q : null,
            rating_e:              item.rating_e              != null ? item.rating_e : null,
            rating_t:              item.rating_t              != null ? item.rating_t : null,
            rating_a:              item.rating_a              != null ? item.rating_a : null,
            pushed_from_dpcr:      true,
        });
        body.appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
        (function(row) {
            var piTA = row.querySelector('textarea.pi-custom');
            if (piTA && piTA.value.trim() && typeof _rmEnsureLinkedRow === 'function') {
                _rmEnsureLinkedRow(row, piTA);
            }
        })(tr);
    });

    _ensureAvgRows();
    computeSpcrFuncSummary();
}


/* ══════════════════════════════════════════════════════════════
   VIEW-LINKED MODAL
══════════════════════════════════════════════════════════════ */
function _buildSpcrLinkedViewHtml(spcrPiText) {
    var needle = (spcrPiText || '').trim().toLowerCase();

    var dpcrRows = [];
    document.querySelectorAll('#dpcrBody tr:not(.section-header)').forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        if (cells.length < 3) return;
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

    var ipcrRows = [];
    document.querySelectorAll('#ipcrBody tr:not(.section-header)').forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        if (cells.length < 3) return;
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

/* ── ROW FACTORY ── */
function createSpcrRow(data) {
    data = data || {};
    var tr = document.createElement('tr');

    /* ── 0: drag handle ── */
    tr.appendChild(makeDragHandle());

    /* ── 1: row actions column ── */
    var tdAct = document.createElement('td');
    tdAct.className = 'spcr-row-actions no-print';

    if (data.pushed_from_dpcr) {
        var badge = document.createElement('div');
        badge.className   = 'spcr-lock-badge';
        badge.textContent = '↙ DPCR';
        tdAct.appendChild(badge);
    }

    var ipcrBtn = document.createElement('button');
    ipcrBtn.type      = 'button';
    ipcrBtn.className = 'row-action-btn';
    ipcrBtn.title     = 'Push this row to IPCR';
    ipcrBtn.textContent = '→ IPCR';
    ipcrBtn.style.color = '#6a3e9e';

    var viewLinkedBtn = document.createElement('button');
    viewLinkedBtn.type      = 'button';
    viewLinkedBtn.className = 'row-action-btn';
    viewLinkedBtn.title     = 'View linked DPCR & IPCR rows';
    viewLinkedBtn.textContent = '👁 Links';
    viewLinkedBtn.style.color = '#555';

    var guideBtn = document.createElement('button');
    guideBtn.type      = 'button';
    guideBtn.className = 'row-action-btn no-print';
    guideBtn.title     = 'How is this row computed?';
    guideBtn.textContent = '? Guide';
    guideBtn.style.cssText = 'color:#6a3e9e;font-size:9px;';

    tdAct.appendChild(ipcrBtn);
    tdAct.appendChild(viewLinkedBtn);
    tdAct.appendChild(guideBtn);
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

    /* ── 8–11: Q E T A rating cells ──
       rating_q/e/t from data (DPCR source) become grey placeholder text.
       The rater must type a fresh SPCR score; the cell stays empty until they do.
       rating_a is NOT pre-filled either — it recomputes from whatever Q/E/T the
       rater enters. ── */
    var ratingWidget = _buildQETACells({
        alwaysOpen: true,
        rating_q: data.rating_q,   /* used as placeholder in alwaysOpen mode */
        rating_e: data.rating_e,
        rating_t: data.rating_t,
        rating_a: null,            /* always start blank — recomputed live */
    }, function() { computeSpcrFuncSummary(); });
    ratingWidget.cells.forEach(function(td) { tr.appendChild(td); });
    tr._ratingWidget = ratingWidget;

    /* ── 12: Remarks / Justification ── */
    var tdRem = document.createElement('td');
    var remTA = document.createElement('textarea');
    remTA.placeholder = '—';
    remTA.dataset.key = 'remarks';
    remTA.value = data.remarks || '';
    remTA.addEventListener('input', function() { autoExpand(remTA); });
    tdRem.appendChild(remTA);
    tr.appendChild(tdRem);

    /* ── 13: Delete ── */
    var tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    var dBtn = document.createElement('button');
    dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = function() { tr.remove(); computeSpcrFuncSummary(); };
    tdDel.appendChild(dBtn);
    tr.appendChild(tdDel);

    /* ── Wire action buttons ── */
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

    guideBtn.onclick = function() {
        _openViewModal('\u2139\uFE0F Computation Guide', '', _ratingComputeGuideHtml());
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

    tr.appendChild(makeDragHandle());

    var tdActBlank = document.createElement('td');
    tdActBlank.className = 'spcr-section-act-blank no-print';
    tdActBlank.style.cssText = 'border:none !important;background:transparent !important;padding:0;width:54px;min-width:54px;';
    tr.appendChild(tdActBlank);

    var td = document.createElement('td');
    td.colSpan = 11;

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
    inp.className = 'section-label-input screen-only';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:9.5px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key = 'section_label';
    inp.value = label;

    var printSpan = document.createElement('span');
    printSpan.className = 'section-label-print';
    printSpan.style.cssText = 'font-weight:700;font-size:9.5px;vertical-align:middle;letter-spacing:.3px;';
    printSpan.textContent = label;

    inp.addEventListener('input', function() {
        _styleSpcrSection(tr, inp.value);
        printSpan.textContent = inp.value;
    });

    td.appendChild(btnBar);
    td.appendChild(inp);
    td.appendChild(printSpan);
    tr.appendChild(td);

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
/* computeSpcrAverages removed — average footer rows no longer used */
function computeSpcrAverages() { /* no-op: avg footer rows removed */ }

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
        if (cells.length < 12) return;

        items.push({
            is_section:            false,
            strategic_goal:        cells[2]  ? ((cells[2].querySelector('textarea')            || {}).value || '').trim() : '',
            performance_indicator: cells[3]  ? ((cells[3].querySelector('textarea.pi-custom') || {}).value || '').trim() : '',
            allotted_budget:       cells[4]  ? ((cells[4].querySelector('input')              || {}).value || '').trim() : '',
            person_accountable:    cells[5]  ? ((cells[5].querySelector('input')              || {}).value || '').trim() : '',
            actual_accomplishment: cells[6]  ? ((cells[6].querySelector('textarea')            || {}).value || '').trim() : '',
            accomplishment_rate:   cells[7]  ? ((cells[7].querySelector('input')              || {}).value || '').trim() : '',
            rating_q: tr._ratingWidget ? tr._ratingWidget.getQ()      : null,
            rating_e: tr._ratingWidget ? tr._ratingWidget.getE()      : null,
            rating_t: tr._ratingWidget ? tr._ratingWidget.getT()      : null,
            rating_a: tr._ratingWidget ? tr._ratingWidget.getA()      : null,
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

    /* Reset the SPCR Rating Matrix so stale rows don't accumulate when a
       new record is loaded.  Must happen BEFORE spcrBody is rebuilt. */
    if (window.RM_SPCR && typeof window.RM_SPCR.reset === 'function') {
        window.RM_SPCR.reset();
    }

    var setVal = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('s_emp_name',     form.employee_name     || '');
    setVal('s_emp_position', form.employee_position || form.employee_title || '');
    setVal('s_period',       form.period            || '');
    setVal('s_supervisor',   form.supervisor        || form.reviewed_by   || '');
    setVal('s_approved_by',  form.approved_by       || '');

    /* Re-expand upgraded intro-field textareas whose values were just set */
    ['s_emp_name', 's_emp_position', 's_period'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el && el.tagName === 'TEXTAREA') autoExpand(el);
    });

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
                check_q:               item.check_q,
                check_e:               item.check_e,
                check_t:               item.check_t,
                rating_q:              item.rating_q,
                rating_e:              item.rating_e,
                rating_t:              item.rating_t,
                rating_a:              item.rating_a,
                remarks:               item.remarks               || item.source_monitoring      || '',
            });
            body.appendChild(tr);
            tr.querySelectorAll('textarea').forEach(autoExpand);
        }
    });

    _ensureAvgRows();
    computeSpcrFuncSummary();
    rebuildSpcrSectionFilter();
}

/* ══════════════════════════════════════════════════════════════
   PUSH ENTIRE SPCR PAGE → IPCR
   Reads every header field and every table row from the current
   SPCR form and populates the IPCR page wholesale.
   - Employee name, position, period, supervisor → IPCR header fields
   - Section rows → converted to matching IPCR section rows
   - Data rows    → converted to IPCR data rows (goal + PI copied;
                    actuals, ratings, remarks carried across)
   - Switches to the IPCR tab when done.
══════════════════════════════════════════════════════════════ */
function pushSpcrToIpcr() {
    var spcrData = readSpcrForm();

    /* Require at least a name so the user knows something happened */
    var dataRows = (spcrData.items || []).filter(function(i) { return !i.is_section; });
    if (!spcrData.employee_name && dataRows.length === 0) {
        alert('The SPCR form is empty. Please fill in data before pushing to IPCR.');
        return;
    }

    if (!confirm(
        'Push the entire SPCR form to IPCR?\n\n' +
        'This will REPLACE all current IPCR rows with the SPCR content.\n' +
        'Employee info, section headers, and all rows will be transferred.'
    )) return;

    /* ── 1. Populate IPCR header fields ── */
    var setVal = function(id, val) {
        var el = document.getElementById(id);
        if (el) el.value = val || '';
    };
    setVal('i_emp_name',     spcrData.employee_name);
    setVal('i_emp_position', spcrData.employee_position);
    setVal('i_emp_unit',     '');          /* SPCR has no unit field — leave blank */
    setVal('i_period',       spcrData.period);
    setVal('i_supervisor',   spcrData.supervisor);
    setVal('i_approved_by',  spcrData.approved_by);
    setVal('i_recommending', '');          /* no equivalent in SPCR */

    /* Keep IPCR display-name spans in sync */
    var syncDisp = function(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val || '\u00a0';
    };
    syncDisp('i_disp_name',       spcrData.employee_name);
    syncDisp('i_disp_name2',      spcrData.employee_name);
    syncDisp('i_disp_supervisor', spcrData.supervisor);
    syncDisp('i_disp_approved',   spcrData.approved_by);

    /* ── 2. Clear IPCR body and rebuild from SPCR items ── */
    var ipcrBody = document.getElementById('ipcrBody');
    if (!ipcrBody) return;

    /* Reset the IPCR Rating Matrix so stale rows don't accumulate. */
    if (window.RM_IPCR && typeof window.RM_IPCR.reset === 'function') {
        window.RM_IPCR.reset();
    }

    ipcrBody.innerHTML = '';

    /* Reset percentage overrides so defaults recalculate */
    if (typeof _ipcrPctOverrides !== 'undefined') {
        Object.keys(_ipcrPctOverrides).forEach(function(k) {
            delete _ipcrPctOverrides[k];
        });
    }

    var hasAnySection = (spcrData.items || []).some(function(i) { return i.is_section; });

    /* If SPCR had no section rows, prepend a default CORE FUNCTIONS header */
    if (!hasAnySection && dataRows.length > 0) {
        if (typeof createIpcrSectionRow === 'function') {
            ipcrBody.appendChild(createIpcrSectionRow('CORE FUNCTIONS :'));
        }
    }

    (spcrData.items || []).forEach(function(item) {
        /* ── Section header row ── */
        if (item.is_section) {
            if (typeof createIpcrSectionRow === 'function') {
                ipcrBody.appendChild(createIpcrSectionRow(item.section_label || ''));
            }
            return;
        }

        /* ── Data row ── */
        if (typeof createIpcrRow === 'function') {
            var ipcrTr = createIpcrRow({
                strategic_goal:        item.strategic_goal        || '',
                performance_indicator: item.performance_indicator || '',
                actual_accomplishment: item.actual_accomplishment || '',
                accomplishment_rate:   item.accomplishment_rate   || '',
                rating_q:              item.rating_q              != null ? item.rating_q : null,
                rating_e:              item.rating_e              != null ? item.rating_e : null,
                rating_t:              item.rating_t              != null ? item.rating_t : null,
                rating_a:              item.rating_a              != null ? item.rating_a : null,
                remarks:               item.remarks               || '',
            });
            ipcrBody.appendChild(ipcrTr);
            ipcrTr.querySelectorAll('textarea').forEach(autoExpand);

            /* Wire Rating Matrix link if available */
            (function(row) {
                var piTA = row.querySelector('textarea.pi-custom');
                if (piTA && piTA.value.trim() && typeof _rmEnsureLinkedRow === 'function') {
                    _rmEnsureLinkedRow(row, piTA);
                }
            })(ipcrTr);
        }
    });

    /* ── 3. Recompute IPCR summary ── */
    if (typeof computeIpcrSummary === 'function') computeIpcrSummary();

    /* ── 4. Switch to IPCR tab and show success ── */
    switchTab('ipcr');
    showAlert('s-alertOk', 'ok',
        '\u2714 SPCR pushed to IPCR \u2014 '
        + dataRows.length + ' row' + (dataRows.length !== 1 ? 's' : '') + ' transferred.'
    );

    /* Scroll IPCR to top after tab switch */
    setTimeout(function() {
        var ipcrPage = document.getElementById('page-ipcr');
        if (ipcrPage) ipcrPage.scrollTop = 0;
    }, 80);
}

/* ══════════════════════════════════════════════════════════════
   SPCR FUNCTION SUMMARY — UPDATED to match reference image format.
   New columns: Remarks (editable) | Average Rating (Support)
   All original computation logic is preserved exactly.
══════════════════════════════════════════════════════════════ */

var _spcrPctOverrides = {};

function computeSpcrFuncSummary() {
    var sums        = { Strategic: 0, Core: 0, Support: 0 };
    var counts      = { Strategic: 0, Core: 0, Support: 0 };
    var currentType = 'Strategic';
    var activeFunctions = [];

    document.querySelectorAll('#spcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('spcr-section-row')) {
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            var up = label.toUpperCase();
            if      (up.includes('CORE'))    currentType = 'Core';
            else if (up.includes('SUPPORT')) currentType = 'Support';
            else                             currentType = 'Strategic';
            return;
        }
        if (tr.classList.contains('spcr-avg-row')) return;
        if (activeFunctions.indexOf(currentType) === -1) activeFunctions.push(currentType);
        var rw = tr._ratingWidget;
        if (!rw) return;
        var aVal = rw.getA();
        if (aVal !== null && !isNaN(aVal)) {
            sums[currentType]   += aVal;
            counts[currentType] += 1;
        }
    });

    var tbody = document.getElementById('spcrFuncSummaryBody');
    if (!tbody) return;
    var totalFinal = 0;
    var totalPct   = 0;

    /* Smart update: rebuild rows only when the function set changes */
    var existingFtKeys = Array.from(tbody.querySelectorAll('tr[data-ft]')).map(function(r) { return r.dataset.ft; });
    var needsRebuild = activeFunctions.join(',') !== existingFtKeys.join(',');
    if (needsRebuild) { tbody.innerHTML = ''; }


    activeFunctions.forEach(function(ft) {
        var defaultPct = activeFunctions.length > 0 ? (100 / activeFunctions.length) : 0;
        var pct = (_spcrPctOverrides[ft] !== undefined)
            ? _spcrPctOverrides[ft]
            : defaultPct;

        var avg   = counts[ft] ? (sums[ft] / counts[ft]) : null;
        var final = (avg !== null) ? avg * (pct / 100) : null;
        if (final !== null) totalFinal += final;
        totalPct += pct;

        /* Find existing row or create new one */
        var row = tbody.querySelector('tr[data-ft="' + ft + '"]');
        if (!row) {
            row = document.createElement('tr');
            row.dataset.ft = ft;

            /* col 1: Function label */
            var tdFt = document.createElement('td');
            tdFt.className = 'func-td-ft';
            tdFt.textContent = ft;
            row.appendChild(tdFt);

            /* col 2: Percentage Distribution (editable input) */
            var tdPct = document.createElement('td');
            tdPct.className = 'func-td-pct';
            var pctInp = document.createElement('input');
            pctInp.type  = 'number'; pctInp.min = '0'; pctInp.max = '100'; pctInp.step = '0.1';
            pctInp.value = Math.round(pct * 10) / 10;
            pctInp.className = 'func-pct-inp';
            pctInp.title = 'Enter percentage for ' + ft + ' functions';
            pctInp.dataset.ft = ft;
            pctInp.addEventListener('input', function() {
                var v = parseFloat(pctInp.value);
                _spcrPctOverrides[ft] = isNaN(v) ? 0 : v;
                computeSpcrFuncSummary();
            });
            tdPct.appendChild(pctInp);
            var pctSym = document.createElement('span');
            pctSym.textContent = ' %'; pctSym.style.fontSize = '10px';
            tdPct.appendChild(pctSym);
            row.appendChild(tdPct);

            /* col 3: Average Rating per Function */
            var tdAvg = document.createElement('td');
            tdAvg.className = 'func-td-avg';
            row.appendChild(tdAvg);

            /* col 4: Final Rating per Functions */
            var tdFin = document.createElement('td');
            tdFin.className = 'func-td-fin';
            row.appendChild(tdFin);

            /* col 5: Final Average Rating (per-row blank; tfoot shows total) */
            var tdFinalAvg = document.createElement('td');
            tdFinalAvg.className = 'func-td-final-avg';
            row.appendChild(tdFinalAvg);

            /* col 6: Adjectival Rating (per-row blank; tfoot shows result) */
            var tdAdj = document.createElement('td');
            tdAdj.className = 'func-td-adj';
            row.appendChild(tdAdj);

            /* col 7: Remarks (editable textarea) */
            var tdRem = document.createElement('td');
            tdRem.className = 'func-td-remarks';
            var remInp = document.createElement('textarea');
            remInp.className = 'func-remarks-inp';
            remInp.placeholder = '—';
            remInp.rows = 2;
            tdRem.appendChild(remInp);
            row.appendChild(tdRem);


            tbody.appendChild(row);
        } else {
            /* Row already exists — only update pct input if user is NOT focused */
            var pctInp = row.querySelector('input.func-pct-inp');
            if (pctInp && document.activeElement !== pctInp) {
                pctInp.value = Math.round(pct * 10) / 10;
            }
        }

        /* Always update computed cells */
        var tdAvg    = row.querySelector('.func-td-avg');
        var tdFin    = row.querySelector('.func-td-fin');
        var tdFinalAvg = row.querySelector('.func-td-final-avg');
        var tdAdj      = row.querySelector('.func-td-adj');

        if (tdAvg)    tdAvg.textContent    = avg    !== null ? avg.toFixed(2)    : '—';
        if (tdFin)    tdFin.textContent    = final  !== null ? final.toFixed(4)  : '—';
        if (tdFinalAvg) tdFinalAvg.textContent = final !== null ? final.toFixed(4) : '—';
        if (tdAdj) {
            var rowAdj = '—';
            if (avg !== null && !isNaN(avg) && avg >= 1) {
                if      (avg >= 5) rowAdj = 'Outstanding';
                else if (avg >= 4) rowAdj = 'Very Satisfactory';
                else if (avg >= 3) rowAdj = 'Satisfactory';
                else if (avg >= 2) rowAdj = 'Unsatisfactory';
                else               rowAdj = 'Poor';
            }
            tdAdj.textContent = rowAdj;
        }
    });

    /* 100% validation warning */
    var warn = document.getElementById('spcr_pct_warning');
    if (warn) {
        if (activeFunctions.length > 0 && Math.abs(totalPct - 100) > 0.05) {
            warn.textContent = '⚠ Percentages total ' + Math.round(totalPct * 10) / 10 + '% — must equal 100%';
            warn.style.display = 'inline-block';
            totalFinal = 0;
        } else {
            warn.style.display = 'none';
        }
    }

    /* Update tfoot final avg and adjectival */
    var elFinal = document.getElementById('spcr_final_avg');
    var elAdj   = document.getElementById('spcr_adjectival');
    if (elFinal) elFinal.textContent = (totalFinal && Math.abs(totalPct - 100) <= 0.05) ? totalFinal.toFixed(2) : '—';
    if (elAdj) {
        var adj = '—';
        if (Math.abs(totalPct - 100) <= 0.05) {
            if      (totalFinal >= 5) adj = 'Outstanding';
            else if (totalFinal >= 4) adj = 'Very Satisfactory';
            else if (totalFinal >= 3) adj = 'Satisfactory';
            else if (totalFinal >= 2) adj = 'Unsatisfactory';
            else if (totalFinal >= 1) adj = 'Poor';
        }
        elAdj.textContent = adj;
    }

    /* Rebuild inline average rows inside spcrBody */
    _rebuildSpcrInlineAvgRows();
}

/* ══════════════════════════════════════════════════════════════
   SPCR INLINE AVERAGE ROW — factory + rebuild (unchanged)
══════════════════════════════════════════════════════════════ */
function createSpcrInlineAvgRow(funcType, avgValue) {
    var cfgMap = {
        Strategic: { color: '#000000', bg: '#ffffff' },
        Core:      { color: '#000000', bg: '#ffffff' },
        Support:   { color: '#000000', bg: '#ffffff' },
    };
    var cfg = cfgMap[funcType] || { color: '#333', bg: '#f5f5f5' };
    var printExact = '-webkit-print-color-adjust:exact;print-color-adjust:exact;';

    var tr = document.createElement('tr');
    tr.className = 'spcr-inline-avg-row';
    tr.dataset.funcType = funcType;
    tr.style.cssText = printExact;

    var tdH = document.createElement('td');
    tdH.className = 'no-print';
    tdH.style.cssText = 'border:none;background:transparent;padding:0;width:18px;';
    tr.appendChild(tdH);

    var tdAct = document.createElement('td');
    tdAct.className = 'no-print';
    tdAct.style.cssText = 'border:none;background:transparent;padding:0;width:54px;';
    tr.appendChild(tdAct);

    var tdLabel = document.createElement('td');
    tdLabel.colSpan = 6;
    tdLabel.style.cssText = 'background:' + cfg.bg + ';color:' + cfg.color
        + ';font-weight:700;font-size:9.5px;text-align:right;padding:4px 10px;'
        + 'border-top:1.5px solid ' + cfg.color + ';letter-spacing:.2px;' + printExact;
    tdLabel.textContent = 'Average Rating \u2014 ' + funcType + ' Functions:';
    tr.appendChild(tdLabel);

    ['Q','E','T'].forEach(function() {
        var td = document.createElement('td');
        td.style.cssText = 'background:' + cfg.bg
            + ';border-top:1.5px solid ' + cfg.color + ';' + printExact;
        tr.appendChild(td);
    });

    var tdVal = document.createElement('td');
    tdVal.className = 'spcr-inline-avg-val';
    tdVal.style.cssText = 'background:' + cfg.bg + ';color:' + cfg.color
        + ';font-weight:700;font-size:11px;text-align:center;padding:2px 2px;'
        + 'border-top:1.5px solid ' + cfg.color + ';' + printExact;
    tdVal.textContent = (avgValue !== null && !isNaN(avgValue))
        ? parseFloat(avgValue).toFixed(2)
        : '\u2014';
    tr.appendChild(tdVal);

    var tdRem = document.createElement('td');
    tdRem.style.cssText = 'background:' + cfg.bg
        + ';border-top:1.5px solid ' + cfg.color + ';' + printExact;
    tr.appendChild(tdRem);

    var tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;background:transparent;padding:0;width:26px;';
    tr.appendChild(tdDel);

    return tr;
}

function _rebuildSpcrInlineAvgRows() {
    var body = document.getElementById('spcrBody');
    if (!body) return;

    body.querySelectorAll('.spcr-inline-avg-row').forEach(function(r) { r.remove(); });

    var groups      = [];
    var currentType = 'Strategic';
    var lastDataRow = null;

    Array.from(body.querySelectorAll('tr')).forEach(function(tr) {
        if (tr.classList.contains('spcr-section-row')) {
            if (lastDataRow !== null) {
                groups.push({ type: currentType, lastDataRow: lastDataRow });
                lastDataRow = null;
            }
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            var up = label.toUpperCase();
            if      (up.includes('CORE'))    currentType = 'Core';
            else if (up.includes('SUPPORT')) currentType = 'Support';
            else                             currentType = 'Strategic';
            return;
        }
        if (tr.classList.contains('spcr-avg-row') || tr.classList.contains('spcr-inline-avg-row')) return;
        lastDataRow = tr;
    });
    if (lastDataRow !== null) {
        groups.push({ type: currentType, lastDataRow: lastDataRow });
    }

    var sums   = { Strategic: 0, Core: 0, Support: 0 };
    var counts = { Strategic: 0, Core: 0, Support: 0 };
    var curType = 'Strategic';

    Array.from(body.querySelectorAll('tr')).forEach(function(tr) {
        if (tr.classList.contains('spcr-section-row')) {
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            var up = label.toUpperCase();
            if      (up.includes('CORE'))    curType = 'Core';
            else if (up.includes('SUPPORT')) curType = 'Support';
            else                             curType = 'Strategic';
            return;
        }
        if (tr.classList.contains('spcr-avg-row') || tr.classList.contains('spcr-inline-avg-row')) return;
        var rw = tr._ratingWidget;
        if (!rw) return;
        var aVal = rw.getA();
        if (aVal !== null && !isNaN(aVal)) {
            sums[curType]   += aVal;
            counts[curType] += 1;
        }
    });

    groups.forEach(function(g) {
        var avg    = counts[g.type] ? sums[g.type] / counts[g.type] : null;
        var avgRow = createSpcrInlineAvgRow(g.type, avg);
        var next   = g.lastDataRow.nextSibling;
        next ? body.insertBefore(avgRow, next) : body.appendChild(avgRow);
    });
}

/* _ensureAvgRows removed — avg footer rows no longer used */
function _ensureAvgRows() { /* no-op */ }

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
        _persistClear(PERSIST_KEY_SPCR);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Save failed: ' + err.message);
    }
});

document.getElementById('sAddRowBtn').addEventListener('click', function() {
    var body = document.getElementById('spcrBody');
    var tr   = createSpcrRow();
    body.appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('sAddSectionBtn').addEventListener('click', function() {
    var body = document.getElementById('spcrBody');
    var tr   = createSectionRow('');
    body.appendChild(tr);
    tr.querySelector('input').focus();
});

document.getElementById('sClearBtn').addEventListener('click', function() {
    if (!confirm('Clear all SPCR data?')) return;
    ['s_emp_name','s_emp_position','s_period','s_supervisor','s_approved_by'].forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.value = '';
        /* Collapse upgraded intro textareas back to single-row height */
        if (el.tagName === 'TEXTAREA') autoExpand(el);
    });
    var disp = document.getElementById('s_disp_name');
    if (disp) disp.textContent = '\u00a0';

    var body = document.getElementById('spcrBody');
    body.innerHTML = '';
    body.appendChild(createSectionRow('STRATEGIC FUNCTIONS :'));
    body.appendChild(createSectionRow('CORE FUNCTIONS :'));
    computeSpcrFuncSummary();
    _persistClear(PERSIST_KEY_SPCR);

    var filterSel = document.getElementById('spcr-section-filter');
    if (filterSel) { filterSel.value = ''; filterSpcrBySection(''); }
});

/* Wire the "Push to IPCR" whole-page button */
(function _wirePushToIpcrBtn() {
    var btn = document.getElementById('sPushToIpcrBtn');
    if (btn) btn.addEventListener('click', pushSpcrToIpcr);
})();

/* ── Auto-save SPCR draft to localStorage ── */
(function _wireSpcrPersist() {
    _persistWireBody('spcrBody', PERSIST_KEY_SPCR, readSpcrForm);
    ['s_emp_name','s_emp_position','s_period','s_supervisor','s_approved_by'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', function() {
            _persistSave(PERSIST_KEY_SPCR, readSpcrForm);
        });
    });
})();

document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'spcr-section-filter') {
        filterSpcrBySection(e.target.value);
    }
});

var sNameEl = document.getElementById('s_emp_name');
if (sNameEl) {
    sNameEl.addEventListener('input', function() {
        var disp = document.getElementById('s_disp_name');
        if (disp) disp.textContent = this.value || '\u00a0';
    });
}
/* SPCR employee info is independent from DPCR header fields. */

/* ── INIT ── */
(function spcrInit() {
    var body = document.getElementById('spcrBody');
    if (!body || body.children.length > 0) return;
    body.appendChild(createSectionRow('STRATEGIC FUNCTIONS :'));
    body.appendChild(createSectionRow('CORE FUNCTIONS :'));
})();

/* ══════════════════════════════════════════════════════════════
   LOAD FROM DPCR (unchanged)
══════════════════════════════════════════════════════════════ */

function _buildDpcrFullViewHtml(record) {
    var html = '';

    html += '<div class="view-meta" style="margin-bottom:12px;">'
        + '<div><span>Employee: </span><strong>' + esc(record.employee_name  || '—') + '</strong></div>'
        + '<div><span>Title / Division: </span><strong>' + esc(record.employee_title || '—') + '</strong></div>'
        + '<div><span>Year: </span><strong>' + esc(String(record.year || '—')) + '</strong></div>'
        + '<div><span>Semester: </span><strong>' + esc(record.semester === '1st' ? '1st Semester (Jan–Jun)' : '2nd Semester (Jul–Dec)') + '</strong></div>'
        + '<div><span>Approved By: </span><strong>' + esc(record.approved_by || '—') + '</strong></div>'
        + '</div>';

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
            var cfg = { Strategic: { color: '#000000', bg: '#ffffff' },
                        Core:      { color: '#000000', bg: '#ffffff' },
                        Support:   { color: '#000000', bg: '#ffffff' } }[ft]
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

function _loadDpcrIntoSpcr(record) {
    if (!confirm(
        'Load DPCR #' + record.id + ' \u2014 ' + (record.employee_name || '?')
        + ' into the SPCR form?\nThis will replace all current SPCR rows.'
    )) return;

    if (typeof closeViewModal === 'function') closeViewModal();

    if (typeof pushDpcrToSpcr === 'function') {
        pushDpcrToSpcr(record);
    }

    rebuildSpcrSectionFilter();

    showAlert('s-alertOk', 'ok',
        '\u2714 DPCR #' + record.id + ' \u2014 \u201c' + (record.employee_name || '') + '\u201d loaded into SPCR.');
}

/* ══════════════════════════════════════════════════════════════
   LOAD FROM DPCR — two-phase viewModal (matches "View Saved DPCR" in dpcr.js)

   Phase 1 (list): search-filterable list of all saved DPCR records.
   Phase 2 (detail): full record preview + ← Back + ⬇ Load into SPCR.
══════════════════════════════════════════════════════════════ */
async function openDpcrSelectModal() {
    var modal   = document.getElementById('viewModal');
    var titleEl = document.getElementById('viewModalTitle');
    var bodyEl  = document.getElementById('viewModalContent');
    if (!modal || !titleEl || !bodyEl) return;

    /* ── Phase 1: searchable list ── */
    function _renderList(records) {
        titleEl.textContent = 'Saved DPCR Forms — Load into SPCR';

        if (!Array.isArray(records) || !records.length) {
            bodyEl.innerHTML = '<p style="color:#888;font-style:italic;padding:12px 0;">'
                + 'No saved DPCR forms found. Save a DPCR first.</p>';
            return;
        }

        /* Search bar */
        var searchWrap = document.createElement('div');
        searchWrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';

        var searchInp = document.createElement('input');
        searchInp.type        = 'text';
        searchInp.placeholder = '\uD83D\uDD0D Search by name, title, year\u2026';
        searchInp.style.cssText =
            'flex:1;border:1px solid #b0c0dc;border-radius:3px;padding:5px 10px;'
            + 'font-size:10.5px;font-family:Arial,sans-serif;outline:none;height:28px;';

        var countBadge = document.createElement('span');
        countBadge.style.cssText = 'font-size:10px;color:#888;white-space:nowrap;';
        countBadge.textContent   = records.length + ' record' + (records.length !== 1 ? 's' : '');

        searchWrap.appendChild(searchInp);
        searchWrap.appendChild(countBadge);

        /* Scrollable list */
        var listWrap = document.createElement('div');
        listWrap.style.cssText =
            'display:flex;flex-direction:column;gap:5px;max-height:60vh;overflow-y:auto;padding-right:4px;';

        function _buildRow(rec) {
            var savedAt = rec.created_at
                ? new Date(rec.created_at).toLocaleString('en-PH', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : '';
            var semLabel  = rec.semester === '1st' ? '1st Sem (Jan\u2013Jun)'
                          : rec.semester === '2nd' ? '2nd Sem (Jul\u2013Dec)'
                          : (rec.semester || '');
            var itemCount = Array.isArray(rec.items) ? rec.items.length : (rec.items_count || '?');

            var btn = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'link-row-btn';
            btn.dataset.searchText = [
                rec.employee_name  || '',
                rec.employee_title || '',
                String(rec.year    || ''),
                rec.semester       || '',
                rec.approved_by    || '',
            ].join(' ').toLowerCase();

            btn.innerHTML =
                '<span class="link-row-num">#' + rec.id + '</span>'
                + ' <strong>' + esc(rec.employee_name || '\u2014') + '</strong>'
                + ' <span style="color:#555;font-weight:400;">'
                +   ' \u2014 ' + esc(rec.employee_title || '') + '</span>'
                + ' <span style="color:#888;font-size:9px;margin-left:6px;">'
                +   esc(String(rec.year || '')) + ' \u00B7 ' + esc(semLabel)
                +   ' \u00B7 ' + itemCount + ' item' + (itemCount !== 1 ? 's' : '')
                +   (savedAt ? ' \u00B7 ' + esc(savedAt) : '')
                + '</span>';

            btn.addEventListener('click', function() {
                _renderDetail(rec.id, records);
            });

            return btn;
        }

        var allButtons = records.map(_buildRow);
        allButtons.forEach(function(b) { listWrap.appendChild(b); });

        /* Live search */
        searchInp.addEventListener('input', function() {
            var needle = searchInp.value.toLowerCase().trim();
            var visible = 0;
            allButtons.forEach(function(b) {
                var match = !needle || b.dataset.searchText.includes(needle);
                b.style.display = match ? '' : 'none';
                if (match) visible++;
            });
            countBadge.textContent = visible + ' record' + (visible !== 1 ? 's' : '');
        });

        bodyEl.innerHTML = '';
        bodyEl.appendChild(searchWrap);
        bodyEl.appendChild(listWrap);
        setTimeout(function() { searchInp.focus(); }, 60);
    }

    /* ── Phase 2: detail view for one record ── */
    function _renderDetail(id, cachedList) {
        titleEl.textContent = '\u23F3 Loading DPCR #' + id + '\u2026';
        bodyEl.innerHTML    = '';

        apiFetch('/api/dpcr/' + id).then(function(full) {
            titleEl.textContent = 'DPCR Form #' + full.id + ' \u2014 ' + (full.employee_name || '');

            var wrap = document.createElement('div');

            /* Toolbar */
            var toolbar = document.createElement('div');
            toolbar.style.cssText =
                'display:flex;align-items:center;gap:10px;margin-bottom:14px;'
                + 'padding-bottom:12px;border-bottom:1.5px solid #dde3ef;flex-wrap:wrap;';

            var backBtn = document.createElement('button');
            backBtn.type      = 'button';
            backBtn.innerHTML = '\u2190 Back to list';
            backBtn.style.cssText =
                'background:#fff;border:1.5px solid #b0c0dc;color:#1a3b6e;border-radius:3px;'
                + 'padding:5px 14px;font-size:10.5px;font-weight:700;cursor:pointer;'
                + 'font-family:Arial,sans-serif;';
            backBtn.addEventListener('click', function() {
                titleEl.textContent = 'Saved DPCR Forms \u2014 Load into SPCR';
                _renderList(cachedList);
            });

            var loadBtn = document.createElement('button');
            loadBtn.type      = 'button';
            loadBtn.innerHTML = '\u2B07 Load into SPCR';
            loadBtn.style.cssText =
                'background:var(--navy,#1a3b6e);color:#fff;border:none;border-radius:3px;'
                + 'padding:5px 18px;font-size:11px;font-weight:700;cursor:pointer;'
                + 'font-family:Arial,sans-serif;letter-spacing:.3px;';
            loadBtn.addEventListener('click', function() {
                _loadDpcrIntoSpcr(full);
            });

            var hint = document.createElement('span');
            hint.style.cssText = 'font-size:9.5px;color:#888;font-style:italic;';
            hint.textContent   = 'Replaces all current SPCR rows with this DPCR\u2019s data.';

            toolbar.appendChild(backBtn);
            toolbar.appendChild(loadBtn);
            toolbar.appendChild(hint);

            /* Detail body */
            var detail = document.createElement('div');
            detail.className = 'view-linked-section';

            var detailTitle = document.createElement('div');
            detailTitle.className = 'view-linked-title';
            detailTitle.style.marginBottom = '10px';
            detailTitle.innerHTML =
                '\uD83D\uDCCB DPCR Form #' + full.id + ' \u2014 ' + esc(full.employee_name || '');

            detail.appendChild(detailTitle);
            detail.innerHTML += _buildDpcrFullViewHtml(full);

            wrap.appendChild(toolbar);
            wrap.appendChild(detail);

            bodyEl.innerHTML = '';
            bodyEl.appendChild(wrap);

        }).catch(function(err) {
            bodyEl.innerHTML =
                '<p style="color:#c00;padding:10px 0;">'
                + '\u26A0 Failed to load DPCR #' + id + ': ' + esc(err.message) + '</p>';
        });
    }

    /* Open modal immediately with loading state, then fetch */
    titleEl.textContent = 'Saved DPCR Forms \u2014 Load into SPCR';
    bodyEl.innerHTML    =
        '<p style="color:#888;font-style:italic;padding:12px 0;">'
        + '\u23F3 Loading saved DPCR forms\u2026</p>';
    modal.classList.add('open');

    try {
        var records = await apiFetch('/api/dpcr');
        _renderList(records);
    } catch (err) {
        bodyEl.innerHTML =
            '<p style="color:#c00;padding:10px 0;">'
            + '\u26A0 Failed to load: ' + esc(err.message) + '</p>';
    }
}

(function _wireLoadDpcrBtn() {
    var btn = document.getElementById('sLoadDpcrBtn');
    if (btn) btn.addEventListener('click', openDpcrSelectModal);
})();