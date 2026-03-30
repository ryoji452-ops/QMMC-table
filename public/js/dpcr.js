/* ═══════════════════════════════════════════
   dpcr.js  (DIFF: computeDpcrFuncSummary row builder updated)
   All other functions are unchanged from original.
   Paste this file over the existing dpcr.js entirely.
═══════════════════════════════════════════ */

/* ── FUNCTION TYPE SECTION CONFIG ── */
const DPCR_FUNC_SECTIONS = [
    { label: 'STRATEGIC FUNCTIONS',  type: 'Strategic',},
    { label: 'CORE FUNCTIONS',        type: 'Core', },
    { label: 'SUPPORT FUNCTIONS',     type: 'Support', },
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

    tr.appendChild(makeDragHandle());

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
    inp.className = 'section-label-input screen-only';
    inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:10px;outline:none;vertical-align:middle;min-width:180px;';
    inp.dataset.key   = 'section_label';
    inp.value         = label;

    var printSpan = document.createElement('span');
    printSpan.className = 'section-label-print';
    printSpan.style.cssText = 'font-weight:700;font-size:10px;vertical-align:middle;letter-spacing:.3px;';
    printSpan.textContent = label;

    inp.addEventListener('input', function() {
        _styleSection(tr, inp.value);
        printSpan.textContent = inp.value;
    });

    var del = document.createElement('button');
    del.type      = 'button';
    del.className = 'remove-btn no-print';
    del.innerHTML = '&times;';
    del.style.marginLeft    = '8px';
    del.style.verticalAlign = 'middle';
    del.onclick = function() { tr.remove(); computeDpcrFuncSummary(); };

    td.appendChild(btnBar);
    td.appendChild(inp);
    td.appendChild(printSpan);
    td.appendChild(del);
    tr.appendChild(td);

    var tdTrail = document.createElement('td');
    tdTrail.className = 'no-print';
    tdTrail.style.cssText = 'border:none;background:transparent;padding:0;width:0;';
    tr.appendChild(tdTrail);

    if (label) _styleSection(tr, label);
    return tr;
}

/* ══════════════════════════════════════════════════════════════
   MULTI-SELECT SECTION-ACCOUNTABLE WIDGET
══════════════════════════════════════════════════════════════ */
function _createSectionMultiSelect(initialValues) {
    var startVals = (initialValues && initialValues.length > 0)
        ? initialValues.filter(Boolean)
        : [];

    var allActive = startVals.indexOf('ALL SECTIONS') !== -1;
    var selected = new Set(allActive ? SECTS : startVals);

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

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'sec-multisel-allbtn';
    clearBtn.textContent = 'Clear All';
    clearBtn.onclick = function(e) {
        e.stopPropagation();
        allActive = false;
        selected.clear();
        _refresh();
    };

    panelTop.appendChild(clearBtn);
    panel.appendChild(panelTop);

    var checkList = document.createElement('div');
    checkList.className = 'sec-multisel-list';

    var allLbl = document.createElement('label');
    allLbl.className = 'sec-multisel-item sec-multisel-all-item';
    allLbl.style.cssText = 'font-weight:700;border-bottom:1px solid #ddd;margin-bottom:4px;padding-bottom:4px;';

    var allChk = document.createElement('input');
    allChk.type    = 'checkbox';
    allChk.value   = 'ALL SECTIONS';
    allChk.checked = allActive;
    allChk.addEventListener('change', function() {
        allActive = allChk.checked;
        if (allActive) {
            SECTS.forEach(function(s) { if (s !== 'ALL SECTIONS') selected.add(s); });
            selected.add('ALL SECTIONS');
        } else {
            selected.clear();
        }
        _refresh();
    });

    allLbl.appendChild(allChk);
    allLbl.appendChild(document.createTextNode('\u00a0ALL SECTIONS'));
    checkList.appendChild(allLbl);

    var itemCheckboxes = [];
    SECTS.forEach(function(s) {
        if (s === 'ALL SECTIONS') return;

        var lbl = document.createElement('label');
        lbl.className = 'sec-multisel-item';

        var chk = document.createElement('input');
        chk.type    = 'checkbox';
        chk.value   = s;
        chk.checked = selected.has(s);
        chk.disabled = allActive;
        if (allActive) {
            lbl.style.opacity = '0.45';
            lbl.style.cursor  = 'not-allowed';
        }

        chk.addEventListener('change', function() {
            if (chk.checked) selected.add(s); else selected.delete(s);
            _refresh();
        });

        lbl.appendChild(chk);
        lbl.appendChild(document.createTextNode('\u00a0' + s));
        checkList.appendChild(lbl);
        itemCheckboxes.push({ chk: chk, lbl: lbl });
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
        allChk.checked = allActive;

        itemCheckboxes.forEach(function(item) {
            item.chk.checked  = allActive || selected.has(item.chk.value);
            item.chk.disabled = allActive;
            item.lbl.style.opacity    = allActive ? '0.45' : '1';
            item.lbl.style.cursor     = allActive ? 'not-allowed' : '';
            item.lbl.style.pointerEvents = allActive ? 'none' : '';
        });

        tagArea.innerHTML = '';

        if (selected.size === 0 && !allActive) {
            var ph = document.createElement('span');
            ph.className = 'sec-multisel-placeholder';
            ph.textContent = 'None selected';
            tagArea.appendChild(ph);
            return;
        }

        if (allActive) {
            var allChip = document.createElement('span');
            allChip.className = 'sec-multisel-chip no-print';
            allChip.style.cssText = 'background:#1a3b6e;color:#fff;';
            var allRm = document.createElement('button');
            allRm.type = 'button'; allRm.className = 'sec-multisel-chip-rm';
            allRm.innerHTML = '&times;'; allRm.title = 'Remove ALL SECTIONS';
            allRm.onclick = function(e) {
                e.stopPropagation();
                allActive = false;
                selected.clear();
                _refresh();
            };
            allChip.appendChild(document.createTextNode('ALL SECTIONS\u00a0'));
            allChip.appendChild(allRm);
            tagArea.appendChild(allChip);

            var allPrint = document.createElement('span');
            allPrint.className   = 'sec-multisel-chip-print print-only';
            allPrint.textContent = 'ALL SECTIONS';
            tagArea.appendChild(allPrint);
            return;
        }

        selected.forEach(function(s) {
            if (s === 'ALL SECTIONS') return;
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
        getValues: function() {
            if (allActive) return ['ALL SECTIONS'];
            return Array.from(selected).filter(function(s) { return s !== 'ALL SECTIONS'; });
        },
        setValues: function(vals) {
            selected.clear();
            allActive = false;
            if (vals && vals.indexOf('ALL SECTIONS') !== -1) {
                allActive = true;
                SECTS.forEach(function(s) { selected.add(s); });
            } else {
                (vals || []).forEach(function(v) { if (v) selected.add(v); });
            }
            _refresh();
        },
    };
}

/* ══════════════════════════════════════════════════════════════
   VIEW-LINKED MODAL
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

    tr.appendChild(makeDragHandle());

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

    var guideBtn = document.createElement('button');
    guideBtn.type      = 'button';
    guideBtn.className = 'row-action-btn no-print';
    guideBtn.title     = 'How is this row computed?';
    guideBtn.textContent = '? Guide';
    guideBtn.style.cssText = 'color:#6a3e9e;font-size:9px;';

    tdAct.appendChild(piPushBtn);
    tdAct.appendChild(viewLinkedBtn);
    tdAct.appendChild(guideBtn);
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
    piTA.dataset.key = 'performance_indicator';
    piTA.value = data.performance_indicator || '';
    piTA.style.cssText = 'width:100%;border:none;background:transparent;font-size:10px;font-family:Arial,sans-serif;outline:none;resize:none;overflow:hidden;min-height:36px;';
    piTA.addEventListener('input', function() {
        autoExpand(piTA);
        if (typeof _rmEnsureLinkedRow === 'function') _rmEnsureLinkedRow(tr, piTA);
    });
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

    var rawSection = data.section_accountable || '';
    var initSections;
    if (rawSection === 'ALL SECTIONS') {
        initSections = ['ALL SECTIONS'];
    } else if (!rawSection) {
        initSections = [];
    } else {
        initSections = rawSection
            .split(',')
            .map(function(s) { return s.trim(); })
            .filter(function(s) { return s && SECTS.indexOf(s) !== -1; });
    }

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
    var ratingWidget = _buildQETACells({
        rating_q: data.rating_q,
        rating_e: data.rating_e,
        rating_t: data.rating_t,
        rating_a: data.rating_a,
        check_q:  data.check_q  !== undefined ? data.check_q  : false,
        check_e:  data.check_e  !== undefined ? data.check_e  : false,
        check_t:  data.check_t  !== undefined ? data.check_t  : false,
    }, function() { computeDpcrFuncSummary(); });
    ratingWidget.cells.forEach(function(td) { tr.appendChild(td); });
    tr._ratingWidget = ratingWidget;

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
    dBtn.onclick = function() { tr.remove(); computeDpcrFuncSummary(); };
    tdDel.appendChild(dBtn); tr.appendChild(tdDel);

    /* Wire action buttons */
    piPushBtn.onclick = function() {
        var detail = piTA.value.trim(), goal = goalTA.value.trim();
        if (!detail && !goal) {
            alert('Please fill in the Strategic Goal and Performance Indicator before pushing to SPCR.');
            return;
        }
        var sections = secMultiSel.getValues();
        var _rw = tr._ratingWidget;
        var newSpcrRow = createSpcrRow({
            strategic_goal:        goal,
            performance_indicator: detail,
            person_accountable:    sections.join(', '),
            rating_q:              _rw ? _rw.getQ() : null,
            rating_e:              _rw ? _rw.getE() : null,
            rating_t:              _rw ? _rw.getT() : null,
            rating_a:              _rw ? _rw.getA() : null,
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

    guideBtn.onclick = function() {
        _openViewModal('\u2139\uFE0F Computation Guide', '', _ratingComputeGuideHtml());
    };

    return tr;
}

/* ── COLLECT SPCR ROWS ── */
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

/* ── READ FORM ── */
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
        if (tr.classList.contains('dpcr-func-summary-row') || tr.classList.contains('dpcr-avg-row')) return;
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

        var sectionAccountable = '';
        if (tr._secMultiSel) {
            var vals = tr._secMultiSel.getValues();
            if (vals.length === 1 && vals[0] === 'ALL SECTIONS') {
                sectionAccountable = 'ALL SECTIONS';
            } else {
                sectionAccountable = vals.filter(function(v) { return v && v !== 'ALL SECTIONS'; }).join(', ');
            }
        } else {
            var secSel = cells[6] ? cells[6].querySelector('select') : null;
            if (secSel) sectionAccountable = secSel.value || '';
        }

        var rw = tr._ratingWidget;
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
            check_q:  rw ? rw.getCheckQ() : true,
            check_e:  rw ? rw.getCheckE() : true,
            check_t:  rw ? rw.getCheckT() : true,
            rating_q: rw ? rw.getQ()      : null,
            rating_e: rw ? rw.getE()      : null,
            rating_t: rw ? rw.getT()      : null,
            rating_a: rw ? rw.getA()      : null,
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

    /* Reset the DPCR Rating Matrix so stale rows don't accumulate when a
       new record is loaded.  Must happen BEFORE dpcrBody is rebuilt so
       the _rmAutoRow / _rmSourceRow scrub can still walk the old rows. */
    if (window.RM_DPCR && typeof window.RM_DPCR.reset === 'function') {
        window.RM_DPCR.reset();
    }

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
            check_q:               item.check_q,
            check_e:               item.check_e,
            check_t:               item.check_t,
            rating_q:              item.rating_q,
            rating_e:              item.rating_e,
            rating_t:              item.rating_t,
            rating_a:              item.rating_a,
            remarks:               item.remarks,
        });
        document.getElementById('dpcrBody').appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
        (function(row) {
            var piTA = row.querySelector('textarea.pi-custom');
            if (piTA && piTA.value.trim() && typeof _rmEnsureLinkedRow === 'function') {
                _rmEnsureLinkedRow(row, piTA);
            }
        })(tr);
    });

    if (typeof rebuildSpcrSectionFilter === 'function') rebuildSpcrSectionFilter();
    computeDpcrFuncSummary();
}

/* ── PUSH DPCR ITEMS → SPCR ── */
function pushDpcrToSpcr(dpcrData) {
    var body = document.getElementById('spcrBody');
    if (!body) return;

    /* Reset the SPCR Rating Matrix so stale rows don't accumulate when
       a new DPCR record is pushed into SPCR. */
    if (window.RM_SPCR && typeof window.RM_SPCR.reset === 'function') {
        window.RM_SPCR.reset();
    }

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
        }
    });
    var setVal = function(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('s_emp_name',     dpcrData.employee_name);
    setVal('s_emp_position', dpcrData.employee_title);
    setVal('s_approved_by',  dpcrData.approved_by);
    var disp = document.getElementById('s_disp_name');
    if (disp && dpcrData.employee_name) disp.textContent = dpcrData.employee_name;

    if (typeof rebuildSpcrSectionFilter === 'function') rebuildSpcrSectionFilter();
}

/* ══════════════════════════════════════════════════════════════
   DPCR FUNCTION SUMMARY — UPDATED to match reference image format.
   New columns: Remarks (editable) | Average Rating (Support)
   All original computation logic is preserved exactly.
══════════════════════════════════════════════════════════════ */

var _dpcrPctOverrides = {};

function computeDpcrFuncSummary() {
    var sums      = { Strategic: 0, Core: 0, Support: 0 };
    var counts    = { Strategic: 0, Core: 0, Support: 0 };
    var currentType = 'Strategic';
    var activeFunctions = [];

    document.querySelectorAll('#dpcrBody tr').forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            currentType = _funcTypeFromLabel(label);
            return;
        }
        if (tr.classList.contains('dpcr-avg-row')) return;
        if (activeFunctions.indexOf(currentType) === -1) activeFunctions.push(currentType);
        var rw = tr._ratingWidget;
        if (!rw) return;
        var aVal = rw.getA();
        if (aVal !== null && !isNaN(aVal)) {
            sums[currentType]   += aVal;
            counts[currentType] += 1;
        }
    });

    var tbody = document.getElementById('dpcrFuncSummaryBody');
    if (!tbody) return;
    var totalFinal = 0;
    var totalPct   = 0;

    /* Smart update: rebuild rows only when the function set changes */
    var existingFtKeys = Array.from(tbody.querySelectorAll('tr[data-ft]')).map(function(r) { return r.dataset.ft; });
    var needsRebuild = activeFunctions.join(',') !== existingFtKeys.join(',');
    if (needsRebuild) { tbody.innerHTML = ''; }

    activeFunctions.forEach(function(ft) {
        var defaultPct = activeFunctions.length > 0 ? (100 / activeFunctions.length) : 0;
        var pct = (_dpcrPctOverrides[ft] !== undefined)
            ? _dpcrPctOverrides[ft]
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
                _dpcrPctOverrides[ft] = isNaN(v) ? 0 : v;
                computeDpcrFuncSummary();
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

            /* col 5: Final Average Rating — spans 2 rows via rowspan on first ft row,
               OR leave as individual cells per row (image shows per-row cells filled only
               once in the footer). We use individual cells; the tfoot shows the final total. */
            var tdFinalAvg = document.createElement('td');
            tdFinalAvg.className = 'func-td-final-avg';
            /* Leave blank per-row; tfoot shows computed total */
            row.appendChild(tdFinalAvg);

            /* col 6: Adjectival Rating (per row — blank; overall in tfoot) */
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
        var tdAvg = row.querySelector('.func-td-avg');
        var tdFin = row.querySelector('.func-td-fin');
        var tdFinalAvg = row.querySelector('.func-td-final-avg');
        var tdAdj      = row.querySelector('.func-td-adj');

        if (tdAvg) tdAvg.textContent = avg !== null ? avg.toFixed(2) : '—';
        if (tdFin) tdFin.textContent = final !== null ? final.toFixed(4) : '—';
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
    var warn = document.getElementById('dpcr_pct_warning');
    if (warn) {
        var diff = Math.round((totalPct - 100) * 10) / 10;
        if (activeFunctions.length > 0 && Math.abs(totalPct - 100) > 0.05) {
            warn.textContent = '⚠ Percentages total ' + Math.round(totalPct * 10) / 10 + '% — must equal 100%';
            warn.style.display = 'inline-block';
            totalFinal = 0;
        } else {
            warn.style.display = 'none';
        }
    }

    /* Update tfoot final avg and adjectival */
    var elFinal = document.getElementById('dpcr_final_avg');
    var elAdj   = document.getElementById('dpcr_adjectival');
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

    /* Rebuild inline average rows inside dpcrBody */
    _rebuildDpcrAvgRows();
}

/* ══════════════════════════════════════════════════════════════
   DPCR INLINE AVERAGE ROW — factory + rebuild (unchanged)
══════════════════════════════════════════════════════════════ */
function createDpcrAvgRow(funcType, avgValue) {
    var cfgMap = {
        Strategic: { color: '#000000', bg: '#ffffff' },
        Core:      { color: '#000000', bg: '#ffffff' },
        Support:   { color: '#000000', bg: '#ffffff' },
    };
    var cfg = cfgMap[funcType] || { color: '#333', bg: '#f5f5f5' };
    var printExact = '-webkit-print-color-adjust:exact;print-color-adjust:exact;';

    var tr = document.createElement('tr');
    tr.className = 'dpcr-avg-row';
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
    tdLabel.colSpan = 7;
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
    tdVal.className = 'dpcr-avg-val';
    tdVal.style.cssText = 'background:' + cfg.bg + ';color:' + cfg.color
        + ';font-weight:700;font-size:11px;text-align:center;padding:4px 6px;'
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

function _rebuildDpcrAvgRows() {
    var body = document.getElementById('dpcrBody');
    if (!body) return;

    body.querySelectorAll('.dpcr-avg-row').forEach(function(r) { r.remove(); });

    var groups      = [];
    var currentType = 'Strategic';
    var lastDataRow = null;

    Array.from(body.querySelectorAll('tr')).forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
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
            currentType = _funcTypeFromLabel(label);
            return;
        }
        if (tr.classList.contains('dpcr-avg-row')) return;
        lastDataRow = tr;
    });
    if (lastDataRow !== null) {
        groups.push({ type: currentType, lastDataRow: lastDataRow });
    }

    var sums   = { Strategic: 0, Core: 0, Support: 0 };
    var counts = { Strategic: 0, Core: 0, Support: 0 };
    var curType = 'Strategic';

    Array.from(body.querySelectorAll('tr')).forEach(function(tr) {
        if (tr.classList.contains('section-header')) {
            var inp   = tr.querySelector('input[data-key="section_label"]');
            var label = inp ? inp.value.trim() : '';
            if (!label) {
                var tdC = tr.querySelector('td[colspan]');
                label = tdC ? tdC.textContent.trim() : '';
            }
            curType = _funcTypeFromLabel(label);
            return;
        }
        if (tr.classList.contains('dpcr-avg-row')) return;
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
        var avgRow = createDpcrAvgRow(g.type, avg);
        var next   = g.lastDataRow.nextSibling;
        next ? body.insertBefore(avgRow, next) : body.appendChild(avgRow);
    });
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
        showAlert('d-alertOk', 'ok',
            '\u2714 DPCR for \u201c' + data.employee_name
            + '\u201d saved. Use \u201cLoad from DPCR\u201d in the SPCR tab to transfer data.');
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('dpcr', saved.form || saved);
        _persistClear(PERSIST_KEY_DPCR);
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

/* ── Auto-save DPCR draft to localStorage ── */
(function _wireDpcrPersist() {
    _persistWireBody('dpcrBody', PERSIST_KEY_DPCR, readDpcrForm);
    ['d_emp_name','d_emp_title','d_approved_by','d_period'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', function() {
            _persistSave(PERSIST_KEY_DPCR, readDpcrForm);
        });
    });

    /* Keep DPCR header signature name in sync while typing */
    var dEmpName = document.getElementById('d_emp_name');
    var dDispName = document.getElementById('d_disp_name');
    if (dEmpName && dDispName) {
        dEmpName.addEventListener('input', function() {
            dDispName.textContent = this.value || '\u00a0';
        });
    }
})();

/* ══════════════════════════════════════════════════════════════
   LOAD / VIEW SAVED DPCR RECORDS (unchanged)
══════════════════════════════════════════════════════════════ */

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
        Strategic: { color: '#000000', bg: '#ffffff' },
        Core:      { color: '#000000', bg: '#ffffff' },
        Support:   { color: '#000000', bg: '#ffffff' },
    };

    items.forEach(function(i) {
        var ft  = i.function_type || 'Strategic';
        var cfg = ftCfg[ft] || ftCfg.Strategic;

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

/* ══════════════════════════════════════════════════════════════
   VIEW SAVED DPCR — uses #viewModal exclusively.

   Phase 1 (list): renders a DPCR-only picker inside #viewModal.
                   No #linkModal is touched, so SPCR / IPCR link
                   flows are completely unaffected.
   Phase 2 (detail): clicking a record fetches /api/dpcr/{id}
                     and re-renders the detail + Load button inside
                     the same #viewModal, with a ← Back button that
                     returns to the Phase 1 list without a new fetch.
══════════════════════════════════════════════════════════════ */
async function openViewSavedDpcrModal() {
    var modal   = document.getElementById('viewModal');
    var titleEl = document.getElementById('viewModalTitle');
    var bodyEl  = document.getElementById('viewModalContent');
    if (!modal || !titleEl || !bodyEl) return;

    /* ── Phase 1: show the list ── */
    function _renderList(records) {
        titleEl.textContent = 'Saved DPCR Forms';

        if (!Array.isArray(records) || !records.length) {
            bodyEl.innerHTML = '<p style="color:#888;font-style:italic;padding:12px 0;">'
                + 'No saved DPCR forms found. Save a DPCR first.</p>';
            return;
        }

        /* Search / filter bar */
        var searchWrap = document.createElement('div');
        searchWrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';

        var searchInp = document.createElement('input');
        searchInp.type        = 'text';
        searchInp.placeholder = '\uD83D\uDD0D Search by name, title, year…';
        searchInp.style.cssText =
            'flex:1;border:1px solid #b0c0dc;border-radius:3px;padding:5px 10px;'
            + 'font-size:10.5px;font-family:Arial,sans-serif;outline:none;height:28px;';

        var countBadge = document.createElement('span');
        countBadge.style.cssText = 'font-size:10px;color:#888;white-space:nowrap;';
        countBadge.textContent   = records.length + ' record' + (records.length !== 1 ? 's' : '');

        searchWrap.appendChild(searchInp);
        searchWrap.appendChild(countBadge);

        /* List container */
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
            var semLabel  = rec.semester === '1st' ? '1st Sem (Jan–Jun)'
                          : rec.semester === '2nd' ? '2nd Sem (Jul–Dec)'
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

        /* Live search — filters the visible buttons by searchText */
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

        /* Focus search after render */
        setTimeout(function() { searchInp.focus(); }, 60);
    }

    /* ── Phase 2: show detail for one DPCR record ── */
    function _renderDetail(id, cachedList) {
        titleEl.textContent = '\u23F3 Loading DPCR #' + id + '\u2026';
        bodyEl.innerHTML    = '';

        apiFetch('/api/dpcr/' + id).then(function(full) {
            titleEl.textContent = 'DPCR Form #' + full.id
                + ' \u2014 ' + (full.employee_name || '');

            var wrap = document.createElement('div');

            /* ── Toolbar: Back + Load buttons ── */
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
                titleEl.textContent = 'Saved DPCR Forms';
                _renderList(cachedList);
            });

            var loadBtn = document.createElement('button');
            loadBtn.type      = 'button';
            loadBtn.innerHTML = '\u2B07 Load into DPCR Form';
            loadBtn.style.cssText =
                'background:var(--navy,#1a3b6e);color:#fff;border:none;border-radius:3px;'
                + 'padding:5px 18px;font-size:11px;font-weight:700;cursor:pointer;'
                + 'font-family:Arial,sans-serif;letter-spacing:.3px;';
            loadBtn.addEventListener('click', function() {
                _loadSavedDpcrIntoForm(full);
            });

            var hint = document.createElement('span');
            hint.style.cssText  = 'font-size:9.5px;color:#888;font-style:italic;';
            hint.textContent    = 'Replaces all current DPCR rows with this record\u2019s data.';

            toolbar.appendChild(backBtn);
            toolbar.appendChild(loadBtn);
            toolbar.appendChild(hint);

            /* ── Detail body ── */
            var detail = document.createElement('div');
            detail.className = 'view-linked-section';

            var detailTitle = document.createElement('div');
            detailTitle.className = 'view-linked-title';
            detailTitle.style.marginBottom = '10px';
            detailTitle.innerHTML =
                '\uD83D\uDCCB DPCR Form #' + full.id
                + ' \u2014 ' + esc(full.employee_name || '');

            detail.appendChild(detailTitle);
            detail.innerHTML += _buildDpcrRecordViewHtml(full);

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

    /* ── Open the modal immediately with a loading state, then fetch ── */
    titleEl.textContent = 'Saved DPCR Forms';
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

/* Wire the "View Saved DPCR" button */
(function _wireDpcrViewSavedBtn() {
    var btn = document.getElementById('dViewSavedBtn');
    if (btn) btn.addEventListener('click', openViewSavedDpcrModal);
})();