/* ═══════════════════════════════════════════
   dpcr.js
   DPCR row factory, read, hydrate,
   and all DPCR event listeners.
   Requires: shared.js, spcr.js (for createSpcrRow)

   TABLE COLUMNS (0-based td index):
     0  drag-handle  (no-print, 18px)
     1  row-actions  (no-print, 54px) ← push + view-links buttons
     2  Strategic Goal
     3  Performance Indicator
     4  Target %
     5  Allotted Budget
     6  Section Accountable  (multi-select widget)
     7  Actual Accomplishment (textarea + actual%)
     8  Accomplishment Rate   (computed display)
     9  Q  10 E  11 T  12 A  (rating cells)
    13  Remarks
    14  Delete (no-print)
═══════════════════════════════════════════ */

/* ── FUNCTION TYPE SECTION CONFIG ── */
const DPCR_FUNC_SECTIONS = [
    { label: 'STRATEGIC FUNCTIONS',  type: 'Strategic', color: '#1a3b6e', bg: '#dce4f0' },
    { label: 'CORE FUNCTIONS',        type: 'Core',      color: '#1e6e3a', bg: '#d4edda' },
    { label: 'SUPPORT FUNCTIONS',     type: 'Support',   color: '#7a4f00', bg: '#fff3cd' },
];

function _funcTypeFromLabel(label) {
    var up = (label || '').toUpperCase();
    if (up.includes('CORE'))     return 'Core';
    if (up.includes('SUPPORT'))  return 'Support';
    return 'Strategic';
}

function _styleSection(tr, label) {
    var cfg = DPCR_FUNC_SECTIONS.filter(function(f) { return f.type === _funcTypeFromLabel(label); })[0]
           || DPCR_FUNC_SECTIONS[0];
    /* col 0 = drag, col 1 = section content td */
    var tds = tr.querySelectorAll('td');
    var td  = tds[1] || tds[0];
    if (!td) return;
    td.style.background  = cfg.bg;
    td.style.color       = cfg.color;
    td.style.fontWeight  = '700';
    td.style.borderLeft  = '4px solid ' + cfg.color;
}

/* ── SECTION ROW FACTORY ── */
function createDpcrSectionRow(label) {
    label = label || '';
    var tr = document.createElement('tr');
    tr.className = 'section-header';

    /* col 0: drag handle */
    tr.appendChild(makeDragHandle());

    /* col 1: section content — colspan covers all remaining data cols (13) */
    var td = document.createElement('td');
    td.colSpan = 13;

    var btnBar = document.createElement('div');
    btnBar.className = 'no-print';
    btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
    DPCR_FUNC_SECTIONS.forEach(function(f) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = f.label;
        b.style.cssText = 'font-size:9px;font-family:Arial,sans-serif;font-weight:700;padding:2px 8px;'
            + 'border:1.5px solid ' + f.color + ';border-radius:3px;cursor:pointer;'
            + 'background:' + f.bg + ';color:' + f.color + ';transition:opacity .12s;';
        b.onclick = function() { inp.value = f.label; _styleSection(tr, f.label); };
        btnBar.appendChild(b);
    });

    var inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Section name…';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:10px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key   = 'section_label';
    inp.value         = label;
    inp.addEventListener('input', function() { _styleSection(tr, inp.value); });

    var del = document.createElement('button');
    del.type      = 'button';
    del.className = 'remove-btn no-print';
    del.innerHTML = '&times;';
    del.style.marginLeft    = '8px';
    del.style.verticalAlign = 'middle';
    del.onclick = function() { tr.remove(); };

    td.appendChild(btnBar);
    td.appendChild(inp);
    td.appendChild(del);
    tr.appendChild(td);

    if (label) _styleSection(tr, label);
    return tr;
}

/* ══════════════════════════════════════════════════════════════
   MULTI-SELECT SECTION-ACCOUNTABLE WIDGET
   Tag-chip UI with dropdown. Selected values stored as a Set.
   .getValues() → string[]   .setValues(string[]) → void
══════════════════════════════════════════════════════════════ */
function _createSectionMultiSelect(initialValues) {
    var selected = new Set((initialValues || []).filter(Boolean));

    var wrapper  = document.createElement('div');
    wrapper.className = 'sec-multisel-wrap';

    var tagArea = document.createElement('div');
    tagArea.className = 'sec-multisel-tags';

    var toggle = document.createElement('button');
    toggle.type      = 'button';
    toggle.className = 'sec-multisel-toggle no-print';
    toggle.title     = 'Select sections';
    toggle.textContent = '▾';

    var panel = document.createElement('div');
    panel.className = 'sec-multisel-panel no-print';
    panel.style.display = 'none';

    var panelTop = document.createElement('div');
    panelTop.className = 'sec-multisel-panel-top';

    var allBtn = document.createElement('button');
    allBtn.type = 'button'; allBtn.className = 'sec-multisel-allbtn'; allBtn.textContent = 'Select All';
    allBtn.onclick = function(e) {
        e.stopPropagation();
        SECTS.forEach(function(s) { selected.add(s); });
        _refresh();
    };

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button'; clearBtn.className = 'sec-multisel-allbtn'; clearBtn.textContent = 'Clear';
    clearBtn.onclick = function(e) {
        e.stopPropagation();
        selected.clear();
        _refresh();
    };

    panelTop.appendChild(allBtn);
    panelTop.appendChild(clearBtn);
    panel.appendChild(panelTop);

    var checkList = document.createElement('div');
    checkList.className = 'sec-multisel-list';
    SECTS.forEach(function(s) {
        var lbl = document.createElement('label');
        lbl.className = 'sec-multisel-item';
        var chk = document.createElement('input');
        chk.type = 'checkbox'; chk.value = s; chk.checked = selected.has(s);
        chk.addEventListener('change', function() {
            if (chk.checked) selected.add(s); else selected.delete(s);
            _refresh();
        });
        lbl.appendChild(chk);
        lbl.appendChild(document.createTextNode('\u00a0' + s));
        checkList.appendChild(lbl);
    });
    panel.appendChild(checkList);

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : 'block';
        toggle.textContent  = isOpen ? '▾' : '▴';
    });

    document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
            panel.style.display = 'none';
            toggle.textContent  = '▾';
        }
    });

    function _refresh() {
        tagArea.innerHTML = '';
        checkList.querySelectorAll('input[type="checkbox"]').forEach(function(c) {
            c.checked = selected.has(c.value);
        });
        if (selected.size === 0) {
            var ph = document.createElement('span');
            ph.className = 'sec-multisel-placeholder'; ph.textContent = 'None selected';
            tagArea.appendChild(ph);
            return;
        }
        selected.forEach(function(s) {
            var chip = document.createElement('span');
            chip.className = 'sec-multisel-chip no-print';
            var rm = document.createElement('button');
            rm.type = 'button'; rm.className = 'sec-multisel-chip-rm';
            rm.innerHTML = '&times;'; rm.title = 'Remove ' + s;
            rm.onclick = function(e) { e.stopPropagation(); selected.delete(s); _refresh(); };
            chip.appendChild(document.createTextNode(s + '\u00a0'));
            chip.appendChild(rm);
            tagArea.appendChild(chip);

            var chipPrint = document.createElement('span');
            chipPrint.className   = 'sec-multisel-chip-print print-only';
            chipPrint.textContent = s + '; ';
            tagArea.appendChild(chipPrint);
        });
    }

    _refresh();
    wrapper.appendChild(tagArea);
    wrapper.appendChild(toggle);
    wrapper.appendChild(panel);

    return {
        wrapper:   wrapper,
        getValues: function() { return Array.from(selected); },
        setValues: function(vals) {
            selected.clear();
            (vals || []).forEach(function(v) { if (v) selected.add(v); });
            _refresh();
        },
    };
}

/* ══════════════════════════════════════════════════════════════
   VIEW-LINKED MODAL — build linked SPCR + IPCR rows HTML
   NOTE: SPCR now has col layout 0=drag,1=actions,2=goal,3=ind,
   4=bud,5=person,6=actual,7=rate
══════════════════════════════════════════════════════════════ */
function _buildDpcrLinkedViewHtml(dpcrPiText) {
    var needle = (dpcrPiText || '').trim().toLowerCase();

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
                goal:    goalTA ? goalTA.value.trim() : '—',
                pi:      piVal,
                person:  (tr.querySelector('input[data-key="person_accountable"]') || {}).value || '—',
                actual:  cells[6] ? ((cells[6].querySelector('textarea') || {}).value || '—') : '—',
                rate:    cells[7] ? ((cells[7].querySelector('input')    || {}).value || '—') : '—',
                remarks: cells[12]? ((cells[12].querySelector('textarea')|| {}).value || '—') : '—',
            });
        }
    });

    var ipcrRows = [];
    document.querySelectorAll('#ipcrBody tr:not(.section-header)').forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        if (cells.length < 4) return;
        /* ipcr col: 0=drag,1=actions,2=goal,3=indicator */
        var goalTA = cells[2] ? cells[2].querySelector('textarea') : null;
        var indTA  = cells[3] ? cells[3].querySelector('textarea') : null;
        if (!indTA) return;
        var piVal = indTA.value.trim();
        if (!piVal) return;
        if (!needle || piVal.toLowerCase().includes(needle)) {
            ipcrRows.push({
                goal:    goalTA ? goalTA.value.trim() : '—',
                pi:      piVal,
                actual:  cells[4]  ? ((cells[4].querySelector('textarea') || {}).value || '—') : '—',
                rate:    cells[5]  ? ((cells[5].querySelector('input')    || {}).value || '—') : '—',
                remarks: cells[10] ? ((cells[10].querySelector('textarea')|| {}).value || '—') : '—',
            });
        }
    });

    var html = '';

    html += '<div class="view-linked-section">';
    html += '<div class="view-linked-title">\uD83D\uDD35 Linked SPCR Rows <span class="view-linked-count">(' + spcrRows.length + ')</span></div>';
    if (!spcrRows.length) {
        html += '<p class="view-linked-empty">No matching SPCR rows found in the current session.</p>';
    } else {
        html += '<table class="view-tbl"><thead><tr>'
            + '<th>Strategic Goal</th><th>Performance Indicator</th>'
            + '<th>Person Accountable</th><th>Actual Accomplishment</th>'
            + '<th>Rate</th><th>Remarks</th>'
            + '</tr></thead><tbody>';
        spcrRows.forEach(function(r) {
            html += '<tr><td>' + esc(r.goal) + '</td><td>' + esc(r.pi) + '</td>'
                + '<td>' + esc(r.person) + '</td><td>' + esc(r.actual) + '</td>'
                + '<td>' + esc(r.rate)   + '</td><td>' + esc(r.remarks) + '</td></tr>';
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
function createDpcrRow(data) {
    data = data || {};
    var tr = document.createElement('tr');

    /* col 0: drag handle */
    tr.appendChild(makeDragHandle());

    /* col 1: row actions column — push to SPCR + view links */
    var tdAct = document.createElement('td');
    tdAct.className = 'spcr-row-actions no-print';

    var piPushBtn = document.createElement('button');
    piPushBtn.type      = 'button';
    piPushBtn.className = 'row-action-btn';
    piPushBtn.title     = 'Push this row to SPCR';
    piPushBtn.textContent = '→ SPCR';
    piPushBtn.style.color = '#1a3b6e';

    var viewLinkedBtn = document.createElement('button');
    viewLinkedBtn.type      = 'button';
    viewLinkedBtn.className = 'row-action-btn';
    viewLinkedBtn.title     = 'View linked SPCR & IPCR rows';
    viewLinkedBtn.textContent = '👁 Links';
    viewLinkedBtn.style.color = '#555';

    tdAct.appendChild(piPushBtn);
    tdAct.appendChild(viewLinkedBtn);
    tr.appendChild(tdAct);

    /* col 2: Strategic Goal */
    var tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
    var goalTA = document.createElement('textarea');
    goalTA.placeholder = 'Strategic goal…'; goalTA.value = data.strategic_goal || '';
    goalTA.addEventListener('input', function() { autoExpand(goalTA); });
    tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

    /* col 3: Performance / Success Indicator */
    var tdInd = document.createElement('td');
    tdInd.style.cssText = 'vertical-align:top;padding:4px 5px;';
    var piTA = document.createElement('textarea');
    piTA.className = 'pi-custom';
    piTA.placeholder = 'Performance / Success Indicator…';
    piTA.value = data.performance_indicator || '';
    piTA.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;resize:none;overflow:hidden;min-height:36px;';
    piTA.addEventListener('input', function() { autoExpand(piTA); });
    tdInd.appendChild(piTA); tr.appendChild(tdInd);

    /* col 4: Target % */
    var tdTarget = document.createElement('td');
    tdTarget.style.cssText = 'text-align:center;vertical-align:middle;';
    var targetIn = document.createElement('input');
    targetIn.type = 'number'; targetIn.className = 'dpcr-target-input';
    targetIn.placeholder = '0'; targetIn.min = '0'; targetIn.max = '100'; targetIn.step = '1';
    targetIn.value = data.target_pct != null ? data.target_pct : '';
    targetIn.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;text-align:center;';
    var targetLabel = document.createElement('div');
    targetLabel.style.cssText = 'font-size:8px;color:#888;margin-top:1px;';
    targetLabel.textContent = 'Target %';
    tdTarget.appendChild(targetIn); tdTarget.appendChild(targetLabel); tr.appendChild(tdTarget);

    /* col 5: Budget */
    var tdB = document.createElement('td');
    var bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—';
    bIn.value = data.allotted_budget || '';
    tdB.appendChild(bIn); tr.appendChild(tdB);

    /* col 6: Section Accountable (multi-select) */
    var tdS = document.createElement('td');
    tdS.style.cssText = 'vertical-align:top;padding:3px 4px;position:relative;';

    var initSections = (data.section_accountable || '')
        .split(',')
        .map(function(s) { return s.trim(); })
        .filter(function(s) { return s && s !== 'ALL SECTIONS' && SECTS.indexOf(s) !== -1; });

    var secMultiSel = _createSectionMultiSelect(initSections);
    tdS.appendChild(secMultiSel.wrapper);
    tr._secMultiSel = secMultiSel;
    tr.appendChild(tdS);

    /* col 7: Actual Accomplishment */
    var tdA = document.createElement('td');
    tdA.style.cssText = 'vertical-align:top;padding:4px 5px;';
    var aTA = document.createElement('textarea');
    aTA.placeholder = 'Actual accomplishment…'; aTA.value = data.actual_accomplishment || '';
    aTA.addEventListener('input', function() { autoExpand(aTA); });
    var actualIn = document.createElement('input');
    actualIn.type = 'number'; actualIn.className = 'dpcr-actual-input';
    actualIn.placeholder = '0'; actualIn.min = '0'; actualIn.max = '100'; actualIn.step = '1';
    actualIn.value = data.actual_pct != null ? data.actual_pct : '';
    actualIn.style.cssText = 'width:100%;border:none;border-top:1px solid #e0e0e0;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;text-align:center;margin-top:3px;padding-top:2px;';
    var actualLabel = document.createElement('div');
    actualLabel.style.cssText = 'font-size:8px;color:#888;';
    actualLabel.textContent = 'Actual %';
    tdA.appendChild(aTA); tdA.appendChild(actualIn); tdA.appendChild(actualLabel); tr.appendChild(tdA);

    /* col 8: Accomplishment Rate (computed) */
    var tdR = document.createElement('td');
    tdR.style.cssText = 'text-align:center;vertical-align:middle;';
    var rateDisplay = document.createElement('div');
    rateDisplay.className = 'dpcr-rate-display';
    rateDisplay.style.cssText = 'font-weight:700;font-size:10px;color:var(--navy);';
    var rateHidden = document.createElement('input');
    rateHidden.type = 'hidden'; rateHidden.className = 'dpcr-rate-hidden';
    tdR.appendChild(rateDisplay); tdR.appendChild(rateHidden); tr.appendChild(tdR);

    function computeRate() {
        var t = parseFloat(targetIn.value), a = parseFloat(actualIn.value);
        if (!isNaN(t) && t > 0 && !isNaN(a)) {
            var rate = (a / t * 100).toFixed(2);
            rateDisplay.textContent = rate + '%'; rateHidden.value = rate + '%';
            rateDisplay.style.color = parseFloat(rate) >= 100 ? '#1e6e3a' : parseFloat(rate) >= 75 ? '#7a4f00' : '#b00020';
        } else {
            rateDisplay.textContent = '—'; rateHidden.value = ''; rateDisplay.style.color = '#888';
        }
    }
    targetIn.addEventListener('input', computeRate);
    actualIn.addEventListener('input', computeRate);
    if (data.accomplishment_rate) {
        rateDisplay.textContent = data.accomplishment_rate; rateHidden.value = data.accomplishment_rate;
        var rv = parseFloat(data.accomplishment_rate);
        if (!isNaN(rv)) rateDisplay.style.color = rv >= 100 ? '#1e6e3a' : rv >= 75 ? '#7a4f00' : '#b00020';
    } else { computeRate(); }

    /* cols 9–12: Q E T A rating cells */
    ['q','e','t','a'].forEach(function() {
        var td = document.createElement('td'); td.className = 'rating-cell';
        tr.appendChild(td);
    });

    /* col 13: Remarks */
    var tdRem = document.createElement('td');
    var remTA = document.createElement('textarea');
    remTA.placeholder = '—'; remTA.value = data.remarks || '';
    remTA.addEventListener('input', function() { autoExpand(remTA); });
    tdRem.appendChild(remTA); tr.appendChild(tdRem);

    /* col 14: Delete */
    var tdDel = document.createElement('td');
    tdDel.className = 'no-print';
    tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
    var dBtn = document.createElement('button'); dBtn.type = 'button';
    dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
    dBtn.onclick = function() { tr.remove(); };
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    /* Wire action buttons (need piTA / goalTA / secMultiSel in closure) */
    piPushBtn.onclick = function() {
        var detail = piTA.value.trim(), goal = goalTA.value.trim();
        if (!detail && !goal) {
            alert('Please fill in the Strategic Goal and Performance Indicator before pushing to SPCR.');
            return;
        }
        var sections = secMultiSel.getValues();
        var newSpcrRow = createSpcrRow({
            strategic_goal:        goal,
            performance_indicator: detail,
            person_accountable:    sections.join(', '),
            pushed_from_dpcr:      true,
        });
        document.getElementById('spcrBody').appendChild(newSpcrRow);
        newSpcrRow.querySelectorAll('textarea').forEach(autoExpand);
        piPushBtn.textContent = '✔ sent'; piPushBtn.style.color = '#1e6e3a';
        setTimeout(function() { piPushBtn.textContent = '→ SPCR'; piPushBtn.style.color = '#1a3b6e'; }, 2000);
        switchTab('spcr');
        setTimeout(function() {
            newSpcrRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newSpcrRow.classList.add('row-highlight');
            setTimeout(function() { newSpcrRow.classList.remove('row-highlight'); }, 2000);
        }, 100);
    };

    viewLinkedBtn.onclick = function() {
        var piText = piTA.value.trim(), goalText = goalTA.value.trim();
        var titleStr = piText
            ? 'Linked rows for: \u201c' + piText.substring(0,60) + (piText.length > 60 ? '\u2026' : '') + '\u201d'
            : 'Linked SPCR & IPCR rows';
        var metaHtml = '<div class="view-meta">'
            + '<div><span>DPCR Indicator: </span><strong>' + esc(piText || '(empty)') + '</strong></div>'
            + '<div><span>Strategic Goal: </span><strong>' + esc(goalText || '(empty)') + '</strong></div>'
            + '</div>';
        _openViewModal(titleStr, metaHtml, _buildDpcrLinkedViewHtml(piText));
    };

    return tr;
}

/* ── COLLECT SPCR ROWS (used by IPCR link modal) ── */
function _getAllSpcrRows() {
    var rows = [];
    document.querySelectorAll('#spcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('spcr-section-row') || tr.classList.contains('spcr-avg-row')) return;
        var goalTA = tr.querySelector('textarea[data-key="strategic_goal"]');
        var indTA  = tr.querySelector('textarea.pi-custom');
        rows.push({
            rowEl: tr,
            text:  indTA  ? indTA.value.trim()  : '(empty)',
            label: (indTA ? indTA.value.trim()  : '(empty)')
                 + (goalTA && goalTA.value.trim() ? ' \u2014 ' + goalTA.value.trim().substring(0,40) : ''),
        });
    });
    return rows;
}

/* ── READ FORM ──
   Col indices: 0=drag,1=actions,2=goal,3=ind,4=target,5=budget,
   6=section,7=actual,8=rate,9=Q,10=E,11=T,12=A,13=remarks,14=del */
function readDpcrForm() {
    var items = [];
    var currentFunctionType = 'Strategic';

    document.querySelectorAll('#dpcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
            var inp = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : (tr.querySelector('td') ? tr.querySelector('td').textContent.trim() : '');
            currentFunctionType = _funcTypeFromLabel(label);
            return;
        }
        var cells = tr.querySelectorAll('td');
        if (!cells.length) return;

        var goalTA   = cells[2]  ? cells[2].querySelector('textarea')               : null;
        var indTA    = cells[3]  ? cells[3].querySelector('textarea.pi-custom')      : null;
        var targetIn = cells[4]  ? cells[4].querySelector('input.dpcr-target-input') : null;
        var bIn      = cells[5]  ? cells[5].querySelector('input')                   : null;
        var aTA      = cells[7]  ? cells[7].querySelector('textarea')                : null;
        var actualIn = cells[7]  ? cells[7].querySelector('input.dpcr-actual-input') : null;
        var rateHid  = cells[8]  ? cells[8].querySelector('input.dpcr-rate-hidden')  : null;
        var remTA    = cells[13] ? cells[13].querySelector('textarea')               : null;
        if (!goalTA && !indTA) return;

        /* Section accountable from widget on row */
        var sectionAccountable = 'ALL SECTIONS';
        if (tr._secMultiSel) {
            var vals = tr._secMultiSel.getValues();
            sectionAccountable = vals.length ? vals.join(', ') : 'ALL SECTIONS';
        } else {
            var secSel = cells[6] ? cells[6].querySelector('select') : null;
            if (secSel) sectionAccountable = secSel.value || 'ALL SECTIONS';
        }

        items.push({
            function_type:         currentFunctionType,
            strategic_goal:        goalTA  ? goalTA.value.trim()   : '',
            performance_indicator: indTA   ? indTA.value.trim()    : '',
            target_pct:            (targetIn && targetIn.value !== '') ? parseFloat(targetIn.value) : null,
            allotted_budget:       bIn     ? bIn.value.trim()      : null,
            section_accountable:   sectionAccountable,
            actual_accomplishment: aTA     ? aTA.value.trim()      : null,
            actual_pct:            (actualIn && actualIn.value !== '') ? parseFloat(actualIn.value) : null,
            accomplishment_rate:   rateHid ? rateHid.value         : null,
            rating_q: false, rating_e: false, rating_t: false, rating_a: false,
            remarks:               remTA   ? remTA.value.trim()    : null,
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
        items:          items,
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
    var lastType = null;

    (form.items || []).forEach(function(item) {
        var ft = item.function_type || 'Strategic';
        if (ft !== lastType) {
            var cfg = DPCR_FUNC_SECTIONS.filter(function(f) { return f.type === ft; })[0] || DPCR_FUNC_SECTIONS[0];
            document.getElementById('dpcrBody').appendChild(createDpcrSectionRow(cfg.label));
            lastType = ft;
        }
        var tr = createDpcrRow({
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

    /* After hydrating DPCR, refresh SPCR section filter */
    if (typeof rebuildSpcrSectionFilter === 'function') rebuildSpcrSectionFilter();
}

/* ── PUSH DPCR ITEMS → SPCR ── */
function pushDpcrToSpcr(dpcrData) {
    var body = document.getElementById('spcrBody');
    if (!body) return;
    body.innerHTML = '';
    var lastType = null;
    (dpcrData.items || []).forEach(function(item) {
        var ft = item.function_type || 'Strategic';
        if (ft !== lastType) {
            var cfg = (typeof SPCR_FUNC_SECTIONS !== 'undefined'
                    ? SPCR_FUNC_SECTIONS.filter(function(f) { return f.type === ft; })[0] : null)
                   || { label: ft.toUpperCase() + ' FUNCTIONS', type: ft, color: '#1a3b6e', bg: '#dce4f0' };
            if (typeof createSectionRow === 'function') body.appendChild(createSectionRow(cfg.label));
            lastType = ft;
        }
        if (typeof createSpcrRow === 'function') {
            var tr = createSpcrRow({
                strategic_goal:        item.strategic_goal        || '',
                performance_indicator: item.performance_indicator || '',
                target_pct:            item.target_pct            != null ? item.target_pct : null,
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
    var setVal = function(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('s_emp_name',     dpcrData.employee_name);
    setVal('s_emp_position', dpcrData.employee_title);
    setVal('s_approved_by',  dpcrData.approved_by);
    var disp = document.getElementById('s_disp_name');
    if (disp && dpcrData.employee_name) disp.textContent = dpcrData.employee_name;

    /* Rebuild SPCR section filter after push */
    if (typeof rebuildSpcrSectionFilter === 'function') rebuildSpcrSectionFilter();
}

/* ── PRINT DPCR ONLY ── */
function printDpcr() {
    var allPages = document.querySelectorAll('.page');
    var dpcrPage = document.getElementById('page-dpcr');
    var wasActive = [];
    allPages.forEach(function(p) { wasActive.push(p.classList.contains('active')); p.classList.remove('active'); });
    if (dpcrPage) dpcrPage.classList.add('active');
    window.print();
    allPages.forEach(function(p, i) { if (wasActive[i]) p.classList.add('active'); });
}

/* ── EVENT LISTENERS ── */
document.getElementById('dSaveBtn').addEventListener('click', async function() {
    var data = readDpcrForm();
    if (!data.employee_name) { showAlert('d-alertErr', 'err', 'Please fill in the employee name.'); return; }
    try {
        var saved = await apiFetch('/api/dpcr', 'POST', data);
        showAlert('d-alertOk', 'ok', '\u2714 DPCR for \u201c' + data.employee_name + '\u201d saved \u2014 pushing to SPCR\u2026');
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('dpcr', saved.form || saved);
        pushDpcrToSpcr(data);
        switchTab('spcr');
        setTimeout(function() {
            document.querySelectorAll('#spcrBody tr:not(.spcr-section-row)').forEach(function(tr) {
                tr.classList.add('row-highlight');
                setTimeout(function() { tr.classList.remove('row-highlight'); }, 2000);
            });
        }, 150);
    } catch (err) { showAlert('d-alertErr', 'err', 'Save failed: ' + err.message); }
});

document.getElementById('dAddRowBtn').addEventListener('click', function() {
    var tr = createDpcrRow();
    document.getElementById('dpcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('dAddSectionBtn').addEventListener('click', function() {
    var tr = createDpcrSectionRow('');
    document.getElementById('dpcrBody').appendChild(tr);
    tr.querySelector('input').focus();
});

/* ══════════════════════════════════════════════════════════════
   LOAD / VIEW SAVED DPCR RECORDS
   ──────────────────────────────────────────────────────────────
   "📋 View Saved DPCR" button in the action bar.
   Fetches all saved DPCR forms from /api/dpcr, shows a selection
   list in the linkModal. Picking a record opens the full-table
   view in the viewModal with a "Load into Form" button.
══════════════════════════════════════════════════════════════ */

/**
 * Build a full-detail read-only HTML view of one DPCR record.
 * Shows header meta + a complete items table with coloured
 * function-type section headers (Strategic / Core / Support).
 */
function _buildDpcrRecordViewHtml(record) {
    var semLabel = record.semester === '1st' ? '1st Semester (Jan\u2013Jun)' : '2nd Semester (Jul\u2013Dec)';

    var html = '<div class="view-meta" style="margin-bottom:12px;">'
        + '<div><span>Employee: </span><strong>'      + esc(record.employee_name  || '\u2014') + '</strong></div>'
        + '<div><span>Title / Division: </span><strong>' + esc(record.employee_title || '\u2014') + '</strong></div>'
        + '<div><span>Year: </span><strong>'          + esc(String(record.year  || '\u2014')) + '</strong></div>'
        + '<div><span>Semester: </span><strong>'      + esc(semLabel)                          + '</strong></div>'
        + '<div><span>Approved By: </span><strong>'   + esc(record.approved_by   || '\u2014') + '</strong></div>'
        + '</div>';

    var items = Array.isArray(record.items) ? record.items : [];
    if (!items.length) {
        html += '<p class="view-linked-empty">No items saved in this DPCR record.</p>';
        return html;
    }

    html += '<table class="view-tbl">'
        + '<thead><tr>'
        + '<th>Type</th>'
        + '<th>Strategic Goal</th>'
        + '<th>Performance Indicator</th>'
        + '<th>Target&nbsp;%</th>'
        + '<th>Budget</th>'
        + '<th>Section Accountable</th>'
        + '<th>Actual Accomplishment</th>'
        + '<th>Actual&nbsp;%</th>'
        + '<th>Rate</th>'
        + '<th>Remarks</th>'
        + '</tr></thead><tbody>';

    var lastFt = '';
    var ftCfg  = {
        Strategic: { color: '#1a3b6e', bg: '#dce4f0' },
        Core:      { color: '#1e6e3a', bg: '#d4edda' },
        Support:   { color: '#7a4f00', bg: '#fff3cd' },
    };

    items.forEach(function(i) {
        var ft  = i.function_type || 'Strategic';
        var cfg = ftCfg[ft] || ftCfg.Strategic;

        /* Coloured function-type section header row when type changes */
        if (ft !== lastFt) {
            html += '<tr><td colspan="10" style="'
                + 'background:' + cfg.bg + ';'
                + 'color:'      + cfg.color + ';'
                + 'font-weight:700;'
                + 'border-left:4px solid ' + cfg.color + ';'
                + 'padding:4px 8px;font-size:9.5px;letter-spacing:.3px;">'
                + esc(ft.toUpperCase() + ' FUNCTIONS')
                + '</td></tr>';
            lastFt = ft;
        }

        html += '<tr>'
            + '<td>'                                + esc(ft)                              + '</td>'
            + '<td>'                                + esc(i.strategic_goal        || '\u2014') + '</td>'
            + '<td>'                                + esc(i.performance_indicator || '\u2014') + '</td>'
            + '<td style="text-align:center;">'     + esc(i.target_pct  != null ? i.target_pct  + '%' : '\u2014') + '</td>'
            + '<td>'                                + esc(i.allotted_budget       || '\u2014') + '</td>'
            + '<td>'                                + esc(i.section_accountable   || '\u2014') + '</td>'
            + '<td>'                                + esc(i.actual_accomplishment || '\u2014') + '</td>'
            + '<td style="text-align:center;">'     + esc(i.actual_pct  != null ? i.actual_pct  + '%' : '\u2014') + '</td>'
            + '<td style="text-align:center;font-weight:700;">' + esc(i.accomplishment_rate || '\u2014') + '</td>'
            + '<td>'                                + esc(i.remarks               || '\u2014') + '</td>'
            + '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

/**
 * Load the selected saved DPCR record into the live DPCR form,
 * replacing whatever is currently in it.
 */
function _loadSavedDpcrIntoForm(record) {
    if (!confirm(
        'Load DPCR #' + record.id + ' \u2014 ' + (record.employee_name || '?') + ' into the form?\n'
        + 'This will replace all current DPCR rows.'
    )) return;

    if (typeof closeViewModal === 'function') closeViewModal();

    hydrateDpcrForm(record);

    showAlert('d-alertOk', 'ok',
        '\u2714 DPCR #' + record.id + ' \u2014 \u201c' + (record.employee_name || '') + '\u201d loaded into form.');
}

/**
 * Open the saved-DPCR selection modal.
 * Fetches /api/dpcr, renders a list in linkModal. Clicking a record
 * fetches /api/dpcr/{id} (full detail), then opens viewModal with
 * the full table + a "Load into Form" button.
 */
async function openViewSavedDpcrModal() {
    var listEl  = document.getElementById('linkModalList');
    var titleEl = document.getElementById('linkModalTitle');
    if (!listEl || !titleEl) return;

    titleEl.textContent = 'Select a saved DPCR to view or load';
    listEl.innerHTML = '<p style="color:#888;font-style:italic;padding:10px 0;">'
        + '\u23F3 Loading saved DPCR forms\u2026</p>';
    document.getElementById('linkModal').classList.add('open');

    var records;
    try {
        records = await apiFetch('/api/dpcr');
    } catch (err) {
        listEl.innerHTML = '<p style="color:#c00;padding:10px 0;">'
            + '\u26A0 Failed to load: ' + esc(err.message) + '</p>';
        return;
    }

    if (!Array.isArray(records) || !records.length) {
        listEl.innerHTML = '<p style="color:#888;font-style:italic;padding:10px 0;">'
            + 'No saved DPCR forms found. Save a DPCR first.</p>';
        return;
    }

    listEl.innerHTML = '';
    records.forEach(function(rec) {
        var savedAt = rec.created_at
            ? new Date(rec.created_at).toLocaleString('en-PH', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })
            : '';
        var itemCount = Array.isArray(rec.items) ? rec.items.length : (rec.items_count || '?');

        var btn = document.createElement('button');
        btn.type      = 'button';
        btn.className = 'link-row-btn';
        btn.innerHTML = '<span class="link-row-num">#' + rec.id + '</span>'
            + ' <strong>' + esc(rec.employee_name || '\u2014') + '</strong>'
            + ' <span style="color:#555;font-weight:400;"> \u2014 '
            +   esc(rec.employee_title || '') + '</span>'
            + ' <span style="color:#888;font-size:9px;margin-left:6px;">'
            +   esc(String(rec.year || '')) + ' \u00B7 ' + esc(rec.semester || '')
            +   ' \u00B7 ' + itemCount + ' items'
            +   (savedAt ? ' \u00B7 ' + esc(savedAt) : '')
            + '</span>';

        btn.onclick = function() {
            document.getElementById('linkModal').classList.remove('open');

            /* Fetch full detail then show view modal */
            apiFetch('/api/dpcr/' + rec.id).then(function(full) {

                var loadBtnHtml = '<div style="margin-bottom:12px;display:flex;align-items:center;gap:12px;">'
                    + '<button type="button" id="dpcrLoadIntoFormBtn"'
                    + ' style="background:var(--navy);color:#fff;border:none;border-radius:3px;'
                    +          'padding:6px 18px;font-size:11px;font-weight:700;cursor:pointer;'
                    +          'font-family:Arial,sans-serif;letter-spacing:.3px;">'
                    + '\u2B07 Load into DPCR Form'
                    + '</button>'
                    + '<span style="font-size:9.5px;color:#888;font-style:italic;">'
                    +   'Replaces all current DPCR rows with this record\u2019s data.'
                    + '</span>'
                    + '</div>';

                var bodyHtml = '<div class="view-linked-section">'
                    + '<div class="view-linked-title" style="margin-bottom:10px;">'
                    + '\uD83D\uDCCB DPCR Form #' + full.id
                    + ' \u2014 ' + esc(full.employee_name || '')
                    + '</div>'
                    + _buildDpcrRecordViewHtml(full)
                    + '</div>';

                _openViewModal(
                    'DPCR Form #' + full.id + ' \u2014 ' + esc(full.employee_name || ''),
                    '',
                    loadBtnHtml + bodyHtml
                );

                /* Wire the Load button after modal renders */
                var loadBtn = document.getElementById('dpcrLoadIntoFormBtn');
                if (loadBtn) loadBtn.onclick = function() { _loadSavedDpcrIntoForm(full); };

            }).catch(function(err) {
                _openViewModal('Error',
                    '<p style="color:#c00;">Failed to load DPCR detail: ' + esc(err.message) + '</p>', '');
            });
        };

        listEl.appendChild(btn);
    });
}

/* Wire the "📋 View Saved DPCR" button */
(function _wireDpcrViewSavedBtn() {
    var btn = document.getElementById('dViewSavedBtn');
    if (btn) btn.addEventListener('click', openViewSavedDpcrModal);
})();