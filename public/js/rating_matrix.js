/* ═══════════════════════════════════════════════════════════════════
   rating_matrix.js
   ─────────────────────────────────────────────────────────────────
   Each of DPCR / SPCR / IPCR owns its own, fully independent
   Rating Matrix instance.  There is no shared panel, no DOM
   movement, and no cross-tab coupling whatsoever.

   Architecture
   ────────────
   createRatingMatrix(tabKey, containerEl)
     → builds a complete, self-contained Rating Matrix inside containerEl.
     → manages its own rows, state, save button, and Q/E/T badge sync.
     → push button is scoped: DPCR instance only has [→ DPCR], etc.

   Instantiated three times at the bottom (DOMContentLoaded):
     RM_DPCR = createRatingMatrix('dpcr', #rm-body-dpcr)
     RM_SPCR = createRatingMatrix('spcr', #rm-body-spcr)
     RM_IPCR = createRatingMatrix('ipcr', #rm-body-ipcr)

   COLUMN MAP  (0-based <td> verified against each row factory)
   ─────────────────────────────────────────────────────────────
   DPCR: 0=drag|1=actions|2=goal|3=indicator|4=target%|5=budget|
         6=section|7=actual|8=rate|9=Q|10=E|11=T|12=A|13=remarks|14=del

   SPCR: 0=drag|1=actions|2=goal|3=indicator|4=budget|5=person|
         6=actual|7=rate|8=Q|9=E|10=T|11=A|12=remarks|13=del

   IPCR: 0=drag|1=actions|2=goal|3=indicator|4=actual|5=rate|
         6=Q|7=E|8=T|9=A|10=remarks|11=del

   Load AFTER: shared.js, dpcr.js, spcr.js, ipcr.js
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────
   COLUMN INDICES
───────────────────────────────────────────────────────────────── */
const RM_COL = {
    dpcr: { Q: 9,  E: 10, T: 11 },
    spcr: { Q: 8,  E: 9,  T: 10 },
    ipcr: { Q: 6,  E: 7,  T: 8  },
};

/* ─────────────────────────────────────────────────────────────────
   PURE HELPERS
───────────────────────────────────────────────────────────────── */
function _rmHasContent(val) {
    return typeof val === 'string' && val.trim().length > 0;
}

function _rmSetCell(cell, hasContent) {
    if (!cell) return;
    /* Legacy badge cleanup — remove old ✔ / N/A spans if present */
    cell.querySelectorAll('.rm-rating-check, .rm-rating-na').forEach(el => el.remove());
    const numInp = cell.querySelector('input[type="number"]');
    if (numInp) numInp.style.display = 'none';
    /* Visual badge still shown in the cell so the RM column shows current status */
    const badge = document.createElement('span');
    badge.className   = hasContent ? 'rm-rating-check' : 'rm-rating-na';
    badge.textContent = hasContent ? '✔' : 'N/A';
    badge.title = hasContent
        ? 'Criterion defined in Rating Matrix — checkbox enabled in form row'
        : 'No criterion defined — checkbox disabled in form row';
    cell.style.textAlign     = 'center';
    cell.style.verticalAlign = 'middle';
    cell.appendChild(badge);
}

/**
 * Apply QET state from rating matrix to a linked form row.
 * Instead of replacing cell content with badges, this function
 * drives the _ratingWidget checkboxes:
 *   – If the RM has content for Q/E/T → check that criterion ON  (and show its number input)
 *   – If the RM has NO content        → uncheck (and hide number input, clear value)
 * The _ratingWidget then recomputes A(4) automatically.
 */
function _rmApplyQET(formRow, tabKey, qet) {
    const col   = RM_COL[tabKey];
    const cells = formRow.querySelectorAll('td');

    /* Drive _ratingWidget if it exists on the form row (new implementation) */
    const rw = formRow._ratingWidget;
    if (rw) {
        /* alwaysOpen rows (SPCR) — inputs stay visible/editable at all times.
           When RM pushes a criterion, clear the DPCR pre-fill so the rater
           enters a score based on the RM criterion, not the old DPCR value.
           When RM has NO criterion for a dimension, clear the value too so
           the placeholder "N/A" shows — signalling that dimension is not rated. */
        if (rw.alwaysOpen) {
            [
                { key: 'q', colKey: 'Q', hasContent: _rmHasContent(qet.q) },
                { key: 'e', colKey: 'E', hasContent: _rmHasContent(qet.e) },
                { key: 't', colKey: 'T', hasContent: _rmHasContent(qet.t) },
            ].forEach(function(item) {
                var colIndex = col[item.colKey];
                var td  = cells[colIndex];
                if (!td) return;
                var inp = td.querySelector('input.rating-num');
                if (!inp) return;
                /* Always clear the old value — user must enter a fresh RM-based score */
                inp.value = '';
                /* Update the saved-val so future re-links don't restore the old DPCR value */
                inp.dataset.savedVal = '';
                /* Placeholder: blank-able "N/A" when no RM criterion, empty when there is one */
                inp.placeholder = item.hasContent ? '—' : 'N/A';
                inp.disabled = false;  /* always editable */
            });
            if (typeof rw.computeA === 'function') rw.computeA();
            return;
        }

        /* Locked-mode rows (DPCR / IPCR) — RM controls visibility of each cell */
        [
            { key: 'q', hasContent: _rmHasContent(qet.q) },
            { key: 'e', hasContent: _rmHasContent(qet.e) },
            { key: 't', hasContent: _rmHasContent(qet.t) },
        ].forEach(function(item) {
            var colIndex = col[item.key.toUpperCase()];
            var td = cells[colIndex];
            if (!td) return;
            var chk        = td.querySelector('input.rating-chk');
            var inp        = td.querySelector('input.rating-num');
            var lockBadge  = td.querySelector('.qet-lock-badge');
            if (!chk) return;

            chk.checked = item.hasContent;
            chk.disabled = true;
            chk.title = item.hasContent
                ? 'Enabled — criterion defined in Rating Matrix'
                : 'Disabled — no criterion in Rating Matrix for this row';

            if (inp) {
                if (item.hasContent) {
                    inp.style.display = 'block';
                    inp.disabled      = false;
                    inp.style.cursor  = 'text';
                    inp.style.color   = '';
                    if (!inp.value && inp.dataset.savedVal) {
                        inp.value = inp.dataset.savedVal;
                    }
                } else {
                    inp.style.display = 'none';
                    inp.disabled      = true;
                    inp.value         = '';
                }
            }
            if (lockBadge) {
                lockBadge.style.display = item.hasContent ? 'none' : 'inline-block';
            }
        });

        if (typeof rw.computeA === 'function') rw.computeA();
        return;
    }

    /* Fallback for rows without _ratingWidget (legacy / plain badge mode) */
    _rmSetCell(cells[col.Q], _rmHasContent(qet.q));
    _rmSetCell(cells[col.E], _rmHasContent(qet.e));
    _rmSetCell(cells[col.T], _rmHasContent(qet.t));
}

function _rmGetFormPiTA(formRow) {
    return formRow.querySelector('textarea.pi-custom')
        || formRow.querySelector('textarea[data-key="performance_indicator"]')
        || null;
}

/* ─────────────────────────────────────────────────────────────────
   FACTORY  — one call per tab produces one isolated instance
───────────────────────────────────────────────────────────────── */
function createRatingMatrix(tabKey, containerEl) {

    /* ── Per-instance state ─────────────────────────────────────── */
    const _pushed   = new WeakMap();   // rmRowEl → [formRowEl, …]
    const pfx       = 'rm_' + tabKey + '_';   // ID prefix, e.g. "rm_dpcr_"
    const formBodyId = { dpcr: 'dpcrBody', spcr: 'spcrBody', ipcr: 'ipcrBody' }[tabKey];

    /* ── DOM shortcuts ──────────────────────────────────────────── */
    const _q    = sel => containerEl.querySelector(sel);
    const _body = ()  => _q('#' + pfx + 'body');
    const _eid  = sfx => _q('#' + pfx + sfx);

    /* ── Q/E/T reader ───────────────────────────────────────────── */
    function _readQET(rmRow) {
        return {
            q: rmRow.querySelector('textarea[data-key="quality"]')?.value.trim()    || '',
            e: rmRow.querySelector('textarea[data-key="efficiency"]')?.value.trim() || '',
            t: rmRow.querySelector('textarea[data-key="timeliness"]')?.value.trim() || '',
        };
    }

    /* ── Refresh badges + PM→PI sync for all pushed rows ───────── */
    function _refreshPushed(rmRow) {
        const list = _pushed.get(rmRow);
        if (!list || !list.length) return;
        const qet   = _readQET(rmRow);
        const pmTA  = rmRow.querySelector('textarea[data-key="performance_measure"]');
        const pmVal = pmTA ? pmTA.value : '';
        list.forEach(formRow => {
            _rmApplyQET(formRow, tabKey, qet);
            if (!formRow.isConnected) return;
            const piTA = _rmGetFormPiTA(formRow);
            if (piTA && piTA.value !== pmVal) { piTA.value = pmVal; autoExpand(piTA); }
        });
    }

    /* ── PI → RM auto-generation ────────────────────────────────── */
    function _ensureLinkedRow(formRow, piTA) {
        if (formRow._rmSourceRow) {
            if (!formRow._rmSourceRow._formRow) formRow._rmSourceRow._formRow = formRow;
            /* Apply current QET state from the already-linked RM row */
            _rmApplyQET(formRow, tabKey, _readQET(formRow._rmSourceRow));
            return;
        }
        if (formRow._rmAutoRow) {
            const pmTA = formRow._rmAutoRow.querySelector('textarea[data-key="performance_measure"]');
            if (pmTA && pmTA.value !== piTA.value) { pmTA.value = piTA.value; autoExpand(pmTA); }
            /* Apply current QET state from the already-linked RM row */
            _rmApplyQET(formRow, tabKey, _readQET(formRow._rmAutoRow));
            return;
        }

        const tbody = _body();
        if (!tbody) return;

        const piVal = piTA.value.trim();
        let rmRow = null;
        if (piVal) {
            tbody.querySelectorAll('tr:not(.rm-section-row)').forEach(r => {
                if (rmRow || r._formRow) return;
                const pmTA2 = r.querySelector('textarea[data-key="performance_measure"]');
                if (pmTA2 && pmTA2.value.trim() === piVal) rmRow = r;
            });
        }

        if (!rmRow) {
            rmRow = _createDataRow({ performanceMeasure: piTA.value });
            tbody.appendChild(rmRow);
            rmRow.querySelectorAll('textarea').forEach(autoExpand);
            rmRow.classList.add('row-highlight');
            setTimeout(() => rmRow.classList.remove('row-highlight'), 2000);
        }

        formRow._rmAutoRow = rmRow;
        rmRow._formRow     = formRow;
        if (!_pushed.has(rmRow)) _pushed.set(rmRow, []);

        /* Apply initial QET state (new row = all empty → all unchecked) */
        _rmApplyQET(formRow, tabKey, _readQET(rmRow));

        const pmTA = rmRow.querySelector('textarea[data-key="performance_measure"]');
        if (pmTA) {
            piTA.addEventListener('input', () => {
                if (!pmTA.isConnected) return;
                if (pmTA.value !== piTA.value) { pmTA.value = piTA.value; autoExpand(pmTA); }
            });
            pmTA.addEventListener('input', () => {
                if (!piTA.isConnected) return;
                if (piTA.value !== pmTA.value) { piTA.value = pmTA.value; autoExpand(piTA); }
            });
        }
    }

    /* Register this instance's _ensureLinkedRow so the global shim can route to it */
    window['_rmEnsureLinkedRow_' + tabKey] = _ensureLinkedRow;

    /* ── Push RM row → form table ───────────────────────────────── */
    function _pushRow(rmRow) {
        const pmTA = rmRow.querySelector('textarea[data-key="performance_measure"]');
        const odTA = rmRow.querySelector('textarea[data-key="operational_definition"]');
        const pm   = pmTA?.value.trim() || '';
        const od   = odTA?.value.trim() || '';

        if (!pm && !od) {
            alert('Please fill in the Performance Measure before pushing.');
            return;
        }

        const qet      = _readQET(rmRow);
        const formBody = document.getElementById(formBodyId);
        let   newRow;

        const linked = rmRow._formRow;
        if (linked && linked.isConnected && linked.closest('#' + formBodyId)) {
            newRow = linked;
            const piTA2   = _rmGetFormPiTA(newRow);
            const goalTA2 = newRow.querySelector('textarea[data-key="strategic_goal"]')
                         || newRow.querySelector('td:nth-child(3) textarea');
            if (piTA2   && piTA2.value   !== pm) { piTA2.value   = pm; autoExpand(piTA2);   }
            if (goalTA2 && od && goalTA2.value !== od) { goalTA2.value = od; autoExpand(goalTA2); }
        } else {
            if (!formBody) return;
            if      (tabKey === 'dpcr') newRow = createDpcrRow({ strategic_goal: od, performance_indicator: pm });
            else if (tabKey === 'spcr') newRow = createSpcrRow({ strategic_goal: od, performance_indicator: pm });
            else                        newRow = createIpcrRow({ strategic_goal: od, performance_indicator: pm });
            formBody.appendChild(newRow);
            newRow.querySelectorAll('textarea').forEach(autoExpand);
        }

        _rmApplyQET(newRow, tabKey, qet);

        if (!_pushed.has(rmRow)) _pushed.set(rmRow, []);
        const list = _pushed.get(rmRow);
        if (!list.includes(newRow)) list.push(newRow);

        const piTA = _rmGetFormPiTA(newRow);
        if (piTA && pmTA && !newRow._rmSourceRow) {
            newRow._rmSourceRow = rmRow;
            piTA.addEventListener('input', function _piToRm() {
                if (!pmTA.isConnected) { piTA.removeEventListener('input', _piToRm); return; }
                pmTA.value = piTA.value; autoExpand(pmTA);
            });
        }

        if (!rmRow._formRow) rmRow._formRow = newRow;

        /* Highlight the pushed row in the form (no tab switch — each RM is already on the right tab) */
        setTimeout(() => {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newRow.classList.add('row-highlight');
            setTimeout(() => newRow.classList.remove('row-highlight'), 2000);
        }, 80);

        return newRow;
    }

    /* ── Section row factory ────────────────────────────────────── */
    function _createSectionRow(label) {
        label = label || '';
        const tr = document.createElement('tr');
        tr.className = 'rm-section-row';

        const td = document.createElement('td');
        td.colSpan = 8;

        const btnBar = document.createElement('div');
        btnBar.className = 'no-print';
        btnBar.style.cssText = 'display:inline-flex;gap:4px;margin-right:10px;vertical-align:middle;';
        [
            { label: 'STRATEGIC FUNCTION', color: '#1a3b6e', bg: '#dce4f0' },
            { label: 'CORE FUNCTION',      color: '#1e6e3a', bg: '#d4edda' },
            { label: 'SUPPORT FUNCTION',   color: '#7a4f00', bg: '#fff3cd' },
        ].forEach(f => {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = f.label;
            b.style.cssText = `font-size:8.5px;font-family:Arial,sans-serif;font-weight:700;
                padding:2px 7px;border:1.5px solid ${f.color};border-radius:3px;cursor:pointer;
                background:${f.bg};color:${f.color};`;
            b.onclick = () => { inp.value = f.label; _styleSec(tr, f.color, f.bg); };
            btnBar.appendChild(b);
        });

        const inp = document.createElement('input');
        inp.type = 'text'; inp.placeholder = 'Section name…'; inp.value = label;
        inp.dataset.key = 'section_label';
        inp.style.cssText = 'border:none;background:transparent;font-weight:700;font-size:10px;outline:none;vertical-align:middle;min-width:160px;';
        inp.addEventListener('input', () => {
            const up = inp.value.toUpperCase();
            if      (up.includes('CORE'))  _styleSec(tr, '#1e6e3a', '#d4edda');
            else if (up.includes('SUPP'))  _styleSec(tr, '#7a4f00', '#fff3cd');
            else                           _styleSec(tr, '#1a3b6e', '#dce4f0');
        });

        const del = document.createElement('button');
        del.type = 'button'; del.className = 'remove-btn no-print';
        del.innerHTML = '&times;'; del.style.marginLeft = '10px';
        del.onclick = () => tr.remove();

        td.appendChild(btnBar); td.appendChild(inp); td.appendChild(del);
        tr.appendChild(td);

        if (label) {
            const up = label.toUpperCase();
            if      (up.includes('CORE'))  _styleSec(tr, '#1e6e3a', '#d4edda');
            else if (up.includes('SUPP'))  _styleSec(tr, '#7a4f00', '#fff3cd');
            else                           _styleSec(tr, '#1a3b6e', '#dce4f0');
        }
        return tr;
    }

    function _styleSec(tr, color, bg) {
        const td = tr.querySelector('td');
        if (!td) return;
        td.style.background = bg;
        td.style.color      = color;
        td.style.borderLeft = `4px solid ${color}`;
    }

    /* ── Data row factory ───────────────────────────────────────── */
    function _createDataRow(data) {
        data = data || {};
        const tr = document.createElement('tr');

        /* Performance Measure */
        const tdPm = document.createElement('td');
        const pmTA = document.createElement('textarea');
        pmTA.placeholder = 'Performance Measure…';
        pmTA.dataset.key = 'performance_measure';
        pmTA.value = data.performanceMeasure || '';
        pmTA.addEventListener('input', () => { autoExpand(pmTA); _refreshPushed(tr); });
        tdPm.appendChild(pmTA); tr.appendChild(tdPm);

        /* Operational Definition */
        const tdOd = document.createElement('td');
        const odTA = document.createElement('textarea');
        odTA.placeholder = 'Operational definition…';
        odTA.dataset.key = 'operational_definition';
        odTA.value = data.operationalDefinition || '';
        odTA.addEventListener('input', () => autoExpand(odTA));
        tdOd.appendChild(odTA); tr.appendChild(tdOd);

        /* Quality (Q) */
        const tdQ = document.createElement('td'); tdQ.className = 'rm-td-q';
        const qTA = document.createElement('textarea');
        qTA.placeholder = 'Quality target / criteria…';
        qTA.dataset.key = 'quality';
        qTA.value = data.quality || '';
        qTA.addEventListener('input', () => { autoExpand(qTA); _refreshPushed(tr); });
        tdQ.appendChild(qTA); tr.appendChild(tdQ);

        /* Efficiency (E) */
        const tdE = document.createElement('td'); tdE.className = 'rm-td-e';
        const eTA = document.createElement('textarea');
        eTA.placeholder = 'Efficiency target / criteria…';
        eTA.dataset.key = 'efficiency';
        eTA.value = data.efficiency || '';
        eTA.addEventListener('input', () => { autoExpand(eTA); _refreshPushed(tr); });
        tdE.appendChild(eTA); tr.appendChild(tdE);

        /* Timeliness (T) */
        const tdT = document.createElement('td'); tdT.className = 'rm-td-t';
        const tTA = document.createElement('textarea');
        tTA.placeholder = 'Timeliness target / criteria…';
        tTA.dataset.key = 'timeliness';
        tTA.value = data.timeliness || '';
        tTA.addEventListener('input', () => { autoExpand(tTA); _refreshPushed(tr); });
        tdT.appendChild(tTA); tr.appendChild(tdT);

        /* Source of Data / Monitoring Tool */
        const tdSrc = document.createElement('td');
        const srcTA = document.createElement('textarea');
        srcTA.placeholder = 'Source of data / monitoring tool…';
        srcTA.dataset.key = 'source_monitoring';
        srcTA.value = data.sourceOfMonitoring || '';
        srcTA.addEventListener('input', () => autoExpand(srcTA));
        tdSrc.appendChild(srcTA); tr.appendChild(tdSrc);

        /* Push button — ONE button, scoped to this tab only */
        const tdPush = document.createElement('td');
        tdPush.className = 'rm-push-cell no-print';

        const sentTo  = new Set(data.sentTo || []);
        const pushBtn = document.createElement('button');
        pushBtn.type        = 'button';
        pushBtn.className   = `rm-push-btn ${tabKey}`;
        pushBtn.dataset.form = tabKey;

        function _refreshPushBtn() {
            const label = tabKey.toUpperCase();
            if (sentTo.has(tabKey)) {
                pushBtn.textContent = `✔ ${label}`;
                pushBtn.classList.add('sent');
                pushBtn.title = `Already pushed to ${label} — click to push again`;
            } else {
                pushBtn.textContent = `→ ${label}`;
                pushBtn.classList.remove('sent');
                pushBtn.title = `Push this row to ${label}`;
            }
        }
        _refreshPushBtn();

        pushBtn.onclick = () => {
            _pushRow(tr);
            sentTo.add(tabKey);
            _refreshPushBtn();
        };
        tdPush.appendChild(pushBtn);
        tr.appendChild(tdPush);

        /* Delete */
        const tdDel = document.createElement('td');
        tdDel.className = 'no-print';
        tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
        const dBtn = document.createElement('button');
        dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
        dBtn.onclick = () => tr.remove();
        tdDel.appendChild(dBtn); tr.appendChild(tdDel);

        return tr;
    }

    /* ── Read form (for save) ───────────────────────────────────── */
    function _readForm() {
        const items = [];
        const tbody = _body();
        if (tbody) {
            tbody.querySelectorAll('tr').forEach(tr => {
                if (tr.classList.contains('rm-section-row')) {
                    const inp = tr.querySelector('input[data-key="section_label"]');
                    items.push({ is_section: true, section_label: inp?.value.trim() || '' });
                    return;
                }
                const pmTA = tr.querySelector('textarea[data-key="performance_measure"]');
                if (!pmTA) return;
                items.push({
                    is_section:             false,
                    performance_measure:    pmTA.value.trim(),
                    operational_definition: tr.querySelector('textarea[data-key="operational_definition"]')?.value.trim() || '',
                    quality:                tr.querySelector('textarea[data-key="quality"]')?.value.trim()                || '',
                    efficiency:             tr.querySelector('textarea[data-key="efficiency"]')?.value.trim()             || '',
                    timeliness:             tr.querySelector('textarea[data-key="timeliness"]')?.value.trim()             || '',
                    source_monitoring:      tr.querySelector('textarea[data-key="source_monitoring"]')?.value.trim()      || '',
                });
            });
        }
        const sv = sfx => (_eid(sfx)?.value.trim() || '');
        return {
            prepared_by:       sv('prepared_by'),
            prepared_by_title: sv('prepared_by_title'),
            reviewed_by:       sv('reviewed_by'),
            reviewed_by_title: sv('reviewed_by_title'),
            approved_by:       sv('approved_by'),
            approved_by_title: sv('approved_by_title'),
            prepared_date:     _eid('prepared_date')?.value || null,
            reviewed_date:     _eid('reviewed_date')?.value || null,
            approved_date:     _eid('approved_date')?.value || null,
            items,
        };
    }

    /* ── Hydrate from DB record ─────────────────────────────────── */
    function _hydrate(matrix) {
        if (!matrix) return;
        const sv = (sfx, val) => { const el = _eid(sfx); if (el) el.value = val || ''; };
        sv('prepared_by',       matrix.prepared_by       || '');
        sv('prepared_by_title', matrix.prepared_by_title || '');
        sv('reviewed_by',       matrix.reviewed_by       || '');
        sv('reviewed_by_title', matrix.reviewed_by_title || '');
        sv('approved_by',       matrix.approved_by       || '');
        sv('approved_by_title', matrix.approved_by_title || '');
        sv('prepared_date',     matrix.prepared_date     || '');
        sv('reviewed_date',     matrix.reviewed_date     || '');
        sv('approved_date',     matrix.approved_date     || '');

        const tbody = _body();
        if (!tbody) return;
        tbody.innerHTML = '';

        (matrix.items || []).forEach(item => {
            if (item.is_section) {
                tbody.appendChild(_createSectionRow(item.section_label || ''));
            } else {
                const tr = _createDataRow({
                    performanceMeasure:    item.performance_measure    || '',
                    operationalDefinition: item.operational_definition || '',
                    quality:               item.quality                || '',
                    efficiency:            item.efficiency             || '',
                    timeliness:            item.timeliness             || '',
                    sourceOfMonitoring:    item.source_monitoring      || '',
                });
                tbody.appendChild(tr);
                tr.querySelectorAll('textarea').forEach(autoExpand);
            }
        });
    }

    /* ── Scoped alert ───────────────────────────────────────────── */
    function _showAlert(sfx, type, msg) {
        const el = _eid(sfx);
        if (!el) return;
        el.className = type === 'ok' ? 'alert-ok' : type === 'info' ? 'alert-info' : 'alert-err';
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 4500);
    }

    /* ── Build the panel HTML ───────────────────────────────────── */
    const tabLabel = { dpcr: 'DPCR', spcr: 'SPCR', ipcr: 'IPCR' }[tabKey];

    containerEl.innerHTML = `
<div class="rm-panel-inner">

  <div id="${pfx}alertOk"   class="alert-ok"></div>
  <div id="${pfx}alertErr"  class="alert-err"></div>
  <div id="${pfx}alertInfo" class="alert-info"></div>

  <div class="form-ref">PMT – ${tabLabel} Rating Matrix Rev 0 01 March 2024</div>

  <div class="doc-header">
    <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
    <div class="header-text">
      <div class="org-name">PANG-ALAALANG SENTRONG MEDIKAL QUIRINO</div>
      <div class="org-sub">(Quirino Memorial Medical Center)</div>
      <div class="form-title">HOSPITAL OPERATION AND PATIENT SUPPORT SERVICE</div>
      <div style="font-size:12px;font-weight:700;color:#111;margin-top:3px;letter-spacing:.5px;">RATING MATRIX</div>
    </div>
  </div>

  <div class="rm-sig-block">
    <div class="rm-sig-col">
      <div class="rm-sig-label">Prepared By:</div>
      <input type="text" id="${pfx}prepared_by" class="rm-sig-input" placeholder="Full name">
      <input type="text" id="${pfx}prepared_by_title" class="rm-sig-sub" placeholder="Position / Title">
      <div class="rm-sig-date-row"><strong>Date:</strong>
        <input type="date" id="${pfx}prepared_date" class="rm-date-inp">
      </div>
    </div>
    <div class="rm-sig-col">
      <div class="rm-sig-label">Reviewed By:</div>
      <input type="text" id="${pfx}reviewed_by" class="rm-sig-input" placeholder="Full name">
      <input type="text" id="${pfx}reviewed_by_title" class="rm-sig-sub" placeholder="Chairperson / Position">
      <div class="rm-sig-date-row"><strong>Date:</strong>
        <input type="date" id="${pfx}reviewed_date" class="rm-date-inp">
      </div>
    </div>
    <div class="rm-sig-col">
      <div class="rm-sig-label">Approved By:</div>
      <input type="text" id="${pfx}approved_by" class="rm-sig-input" placeholder="Full name">
      <input type="text" id="${pfx}approved_by_title" class="rm-sig-sub" placeholder="Medical Center Chief II">
      <div class="rm-sig-date-row"><strong>Date:</strong>
        <input type="date" id="${pfx}approved_date" class="rm-date-inp">
      </div>
    </div>
  </div>

  <table class="rm-table" id="${pfx}table">
    <thead>
      <tr>
        <th class="rm-th-pm">PERFORMANCE MEASURE</th>
        <th class="rm-th-od">OPERATIONAL DEFINITION</th>
        <th class="rm-th-q">QUALITY<br><span class="rm-th-sub">(Q)</span></th>
        <th class="rm-th-e">EFFICIENCY<br><span class="rm-th-sub">(E)</span></th>
        <th class="rm-th-t">TIMELINESS<br><span class="rm-th-sub">(T)</span></th>
        <th class="rm-th-src">SOURCE OF DATA /<br>MONITORING TOOL</th>
        <th class="rm-th-push no-print">PUSH TO</th>
        <th class="rm-th-del  no-print"></th>
      </tr>
    </thead>
    <tbody id="${pfx}body"></tbody>
  </table>

  <div class="action-bar no-print" style="margin-top:14px;">
    <button type="button" class="btn-action btn-navy"   id="${pfx}addRowBtn">+ Add Row</button>
    <button type="button" class="btn-action btn-slate"  id="${pfx}addSectionBtn">+ Add Section</button>
    <button type="button" class="btn-action btn-orange" id="${pfx}clearBtn">Clear Matrix</button>
    <button type="button" class="btn-action btn-green"  id="${pfx}saveBtn" style="margin-left:auto;">💾 Save Matrix</button>
    <button type="button" class="btn-action btn-navy"   id="${pfx}printBtn">🖨 Print</button>
  </div>

</div>`;

    /* ── Wire event listeners ───────────────────────────────────── */
    _eid('addRowBtn').addEventListener('click', () => {
        const tbody = _body();
        if (!tbody) return;
        const tr = _createDataRow();
        tbody.appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
        tr.querySelector('textarea').focus();
    });

    _eid('addSectionBtn').addEventListener('click', () => {
        const tbody = _body();
        if (!tbody) return;
        const tr = _createSectionRow('STRATEGIC FUNCTION');
        tbody.appendChild(tr);
        tr.querySelector('input').focus();
    });

    _eid('clearBtn').addEventListener('click', () => {
        if (!confirm('Clear all Rating Matrix rows and signature fields?')) return;
        const tbody = _body();
        if (tbody) tbody.innerHTML = '';
        ['prepared_by','prepared_by_title','reviewed_by','reviewed_by_title',
         'approved_by','approved_by_title','prepared_date','reviewed_date','approved_date']
            .forEach(sfx => { const el = _eid(sfx); if (el) el.value = ''; });
        _showAlert('alertInfo', 'info', 'Rating Matrix cleared.');
    });

    _eid('saveBtn').addEventListener('click', async () => {
        const data     = _readForm();
        const dataRows = data.items.filter(i => !i.is_section);
        if (!dataRows.length) {
            _showAlert('alertErr', 'err', 'Please add at least one row before saving.');
            return;
        }
        if (!data.prepared_by) {
            _showAlert('alertErr', 'err', 'Please fill in the Prepared By field.');
            return;
        }
        try {
            await apiFetch('/api/spcr-matrix', 'POST', {
                prepared_by:       data.prepared_by,
                prepared_by_title: data.prepared_by_title || null,
                reviewed_by:       data.reviewed_by       || null,
                reviewed_by_title: data.reviewed_by_title || null,
                approved_by:       data.approved_by       || null,
                approved_by_title: data.approved_by_title || null,
                prepared_date:     data.prepared_date     || null,
                reviewed_date:     data.reviewed_date     || null,
                approved_date:     data.approved_date     || null,
                items: data.items.map(item => ({
                    is_section:             item.is_section             || false,
                    section_label:          item.section_label          || null,
                    performance_measure:    item.performance_measure    || null,
                    operational_definition: item.operational_definition || null,
                    quality:                item.quality                || null,
                    efficiency:             item.efficiency             || null,
                    timeliness:             item.timeliness             || null,
                    source_monitoring:      item.source_monitoring      || null,
                })),
            });
            _showAlert('alertOk', 'ok', '✔ Rating Matrix saved to database.');
        } catch (err) {
            _showAlert('alertErr', 'err', 'Save failed: ' + err.message);
        }
    });

    _eid('printBtn').addEventListener('click', () => printRatingMatrixOnly());

    /* ── Init rows ──────────────────────────────────────────────── */
    const dbKey = {
        dpcr: 'DB_LATEST_DPCR_MATRIX',
        spcr: 'DB_LATEST_SPCR_MATRIX',
        ipcr: 'DB_LATEST_IPCR_MATRIX',
    }[tabKey];

    if (window[dbKey]) {
        _hydrate(window[dbKey]);
    } else if (tabKey === 'dpcr' && window.DB_LATEST_MATRIX) {
        /* backward-compat: old single-matrix window key still seeds DPCR */
        _hydrate(window.DB_LATEST_MATRIX);
    } else {
        const tbody = _body();
        if (tbody) {
            tbody.appendChild(_createSectionRow('STRATEGIC FUNCTION'));
            const firstRow = _createDataRow();
            tbody.appendChild(firstRow);
            firstRow.querySelectorAll('textarea').forEach(autoExpand);
        }
    }

    /* Public API */
    return { tabKey, hydrate: _hydrate, readForm: _readForm, ensureLinkedRow: _ensureLinkedRow };
}

/* ─────────────────────────────────────────────────────────────────
   RM-only printing
   Prints ONLY the Rating Matrix panel content (no DPCR/SPCR/IPCR page tables).
───────────────────────────────────────────────────────────────── */
function printRatingMatrixOnly() {
    document.body.classList.add('print-rm-only-mode');
    try {
        window.print();
    } finally {
        document.body.classList.remove('print-rm-only-mode');
    }
}

/* ─────────────────────────────────────────────────────────────────
   GLOBAL  _rmEnsureLinkedRow  SHIM
   ─────────────────────────────────────────────────────────────────
   Called by dpcr.js / spcr.js / ipcr.js whenever a PI value is
   set on a form row.  If the RM instance for that tab is not yet
   ready (e.g. called from a DOMContentLoaded handler that fires
   before rating_matrix.js finishes), the call is queued and
   replayed automatically once the instance registers itself.
───────────────────────────────────────────────────────────────── */
var _rmPendingQueue = [];

function _rmEnsureLinkedRow(formRow, piTA) {
    var tabKey = null;
    if      (formRow.closest('#dpcrBody')) tabKey = 'dpcr';
    else if (formRow.closest('#spcrBody')) tabKey = 'spcr';
    else if (formRow.closest('#ipcrBody')) tabKey = 'ipcr';
    if (!tabKey) return;

    var fn = window['_rmEnsureLinkedRow_' + tabKey];
    if (typeof fn === 'function') {
        fn(formRow, piTA);
    } else {
        // Instance not ready yet — queue for replay after instantiation
        _rmPendingQueue.push({ tabKey: tabKey, formRow: formRow, piTA: piTA });
    }
}

/* Replay queued calls for a newly-instantiated tabKey */
function _rmFlushQueue(tabKey) {
    var fn = window['_rmEnsureLinkedRow_' + tabKey];
    if (typeof fn !== 'function') return;
    var remaining = [];
    _rmPendingQueue.forEach(function(item) {
        if (item.tabKey === tabKey && item.formRow.isConnected) {
            fn(item.formRow, item.piTA);
        } else if (item.tabKey !== tabKey) {
            remaining.push(item);
        }
        // discard entries whose row left the DOM
    });
    _rmPendingQueue = remaining;
}

/* ─────────────────────────────────────────────────────────────────
   INSTANTIATION — three independent Rating Matrix instances
───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
    var elDpcr = document.getElementById('rm-body-dpcr');
    var elSpcr = document.getElementById('rm-body-spcr');
    var elIpcr = document.getElementById('rm-body-ipcr');

    if (elDpcr) { window.RM_DPCR = createRatingMatrix('dpcr', elDpcr); _rmFlushQueue('dpcr'); }
    if (elSpcr) { window.RM_SPCR = createRatingMatrix('spcr', elSpcr); _rmFlushQueue('spcr'); }
    if (elIpcr) { window.RM_IPCR = createRatingMatrix('ipcr', elIpcr); _rmFlushQueue('ipcr'); }
});