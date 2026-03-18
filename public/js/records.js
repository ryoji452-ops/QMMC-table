/* ═══════════════════════════════════════════
   records.js
   Loads DPCR / SPCR / IPCR records into a
   single flat sortable table.
   Dropdowns FILTER (hide non-matching rows).
   Column headers sort within the filtered set.
   Requires: shared.js (apiFetch, esc, showAlert)
═══════════════════════════════════════════ */

/* ── State ── */
let REC_SPCR = [];
let REC_DPCR = [];
let REC_IPCR = [];

/* Sort state */
let REC_SORT = { col: 'saved_at', dir: 'desc' };

/* Pagination state */
const REC_PAGE_SIZE = 20;
let REC_PAGE = 1;

/* ══════════════════════════════════════════
   LOAD
══════════════════════════════════════════ */
async function loadAllRecords() {
    const container = document.getElementById('rec-container');
    container.innerHTML = '<div class="rec-loading">⏳ Loading records…</div>';
    try {
        // Fetch each endpoint independently so one missing route
        // (e.g. /api/ipcr not yet set up) doesn't break the whole page
        const safeGet = async (url) => {
            try { return await apiFetch(url); }
            catch (e) { console.warn('Records: could not load ' + url, e.message); return []; }
        };

        const [spcr, dpcr, ipcr] = await Promise.all([
            safeGet('/api/spcr'),         // SPCR forms (new format)
            safeGet('/api/dpcr'),         // DPCR forms
            safeGet('/api/ipcr'),         // IPCR forms (may not exist yet)
        ]);

        REC_SPCR = (Array.isArray(spcr) ? spcr : []).map(r => ({ ...r, _type: 'spcr' }));
        REC_DPCR = (Array.isArray(dpcr) ? dpcr : []).map(r => ({ ...r, _type: 'dpcr' }));
        REC_IPCR = (Array.isArray(ipcr) ? ipcr : []).map(r => ({ ...r, _type: 'ipcr' }));

        populateYearFilter();
        renderRecords();
    } catch (err) {
        container.innerHTML = `<div class="rec-empty">⚠ Failed to load records: ${esc(err.message)}</div>`;
    }
}

/* ══════════════════════════════════════════
   YEAR FILTER POPULATION
══════════════════════════════════════════ */
function populateYearFilter() {
    const sel = document.getElementById('rec-filter-year');
    const currentVal = sel.value;
    const years = new Set();
    [...REC_SPCR, ...REC_DPCR, ...REC_IPCR].forEach(r => { if (r.year) years.add(Number(r.year)); });
    [...sel.options].forEach(o => { if (o.value) years.add(Number(o.value)); });
    while (sel.options.length > 1) sel.remove(1);
    [...years].sort((a, b) => b - a).forEach(y => {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        sel.appendChild(opt);
    });
    sel.value = currentVal;
}

/* ══════════════════════════════════════════
   FILTERS + SEARCH
══════════════════════════════════════════ */
function getFilters() {
    return {
        year:   document.getElementById('rec-filter-year').value,
        sem:    document.getElementById('rec-filter-sem').value,
        type:   document.getElementById('rec-filter-type').value,
        search: (document.getElementById('rec-search').value || '').toLowerCase().trim(),
    };
}

function matchesSearch(r, search) {
    if (!search) return true;
    const fields = [
        r.employee_name, r.employee_title, r.employee_position, r.employee_unit,
        r.prepared_by, r.prepared_by_title, r.reviewed_by, r.approved_by,
        r.division, r.supervisor, r.period,
        String(r.year || ''), r.semester,
    ];
    return fields.some(f => f && String(f).toLowerCase().includes(search));
}

/* Normalise into a flat display row */
function normaliseRecord(r) {
    const type = r._type;
    return {
        id:         r.id,
        _type:      type,
        _raw:       r,
        type_label: type === 'dpcr' ? 'DPCR' : type === 'spcr' ? 'SPCR' : 'IPCR',
        name:       r.employee_name || r.prepared_by || '—',
        title:      r.employee_title || r.employee_position || r.prepared_by_title || '—',
        division:   r.division || r.employee_unit || '—',
        year:       r.year || '—',
        semester:   r.semester || '—',
        approved:   r.approved_by || '—',
        saved_at:   r.created_at || '',
        items:      Array.isArray(r.items) ? r.items.length : 0,
    };
}

/* ══════════════════════════════════════════
   COLUMN SORT
══════════════════════════════════════════ */
function sortRecords(rows) {
    const { col, dir } = REC_SORT;
    return [...rows].sort((a, b) => {
        let va = a[col] ?? '', vb = b[col] ?? '';
        if (col === 'id' || col === 'year' || col === 'items') {
            va = Number(va) || 0; vb = Number(vb) || 0;
            return dir === 'asc' ? va - vb : vb - va;
        }
        if (col === 'saved_at') {
            va = va ? new Date(va).getTime() : 0;
            vb = vb ? new Date(vb).getTime() : 0;
            return dir === 'asc' ? va - vb : vb - va;
        }
        va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
        if (va < vb) return dir === 'asc' ? -1 :  1;
        if (va > vb) return dir === 'asc' ?  1 : -1;
        return 0;
    });
}

function setSort(col) {
    if (REC_SORT.col === col) {
        REC_SORT.dir = REC_SORT.dir === 'asc' ? 'desc' : 'asc';
    } else {
        REC_SORT.col = col;
        REC_SORT.dir = col === 'saved_at' ? 'desc' : 'asc';
    }
    REC_PAGE = 1;
    renderRecords();
}

function sortIcon(col) {
    if (REC_SORT.col !== col) return '<span class="rec-sort-icon rec-sort-none">⇅</span>';
    return REC_SORT.dir === 'asc'
        ? '<span class="rec-sort-icon rec-sort-active">▲</span>'
        : '<span class="rec-sort-icon rec-sort-active">▼</span>';
}

/* ══════════════════════════════════════════
   RENDER — dropdowns hard-filter rows,
   column headers sort within the result
══════════════════════════════════════════ */
let _lastFilterKey = '';

function renderRecords() {
    const { year, sem, type, search } = getFilters();
    const filterKey = year + '|' + sem + '|' + type + '|' + search;
    if (filterKey !== _lastFilterKey) {
        REC_PAGE = 1;
        _lastFilterKey = filterKey;
    }
    const container = document.getElementById('rec-container');

    const allRaw = [...REC_DPCR, ...REC_SPCR, ...REC_IPCR];

    const filtered = allRaw
        .filter(r => {
            if (type && r._type !== type)                   return false;
            if (year && Number(r.year) !== Number(year))    return false;
            if (sem  && r.semester !== sem)                 return false;
            if (!matchesSearch(r, search))                  return false;
            return true;
        })
        .map(normaliseRecord);

    const sorted = sortRecords(filtered);

    /* Stats */
    const dpcrCount = sorted.filter(r => r._type === 'dpcr').length;
    const spcrCount = sorted.filter(r => r._type === 'spcr').length;
    const ipcrCount = sorted.filter(r => r._type === 'ipcr').length;

    const statsHtml = `
        <div class="rec-stats-row">
            <div class="rec-stat-card">
                <div class="rec-stat-num">${sorted.length}</div>
                <div class="rec-stat-lbl">Total Records</div>
            </div>
            <div class="rec-stat-card">
                <div class="rec-stat-num">${dpcrCount}</div>
                <div class="rec-stat-lbl">DPCR Forms</div>
            </div>
            <div class="rec-stat-card">
                <div class="rec-stat-num">${spcrCount}</div>
                <div class="rec-stat-lbl">SPCR Matrices</div>
            </div>
            <div class="rec-stat-card">
                <div class="rec-stat-num">${ipcrCount}</div>
                <div class="rec-stat-lbl">IPCR Forms</div>
            </div>
        </div>`;

    if (sorted.length === 0) {
        container.innerHTML = statsHtml + '<div class="rec-empty">No records match your filters.</div>';
        return;
    }

    /* Pagination */
    const totalPages = Math.ceil(sorted.length / REC_PAGE_SIZE);
    if (REC_PAGE > totalPages) REC_PAGE = totalPages;
    if (REC_PAGE < 1) REC_PAGE = 1;
    const pageStart = (REC_PAGE - 1) * REC_PAGE_SIZE;
    const pageEnd   = Math.min(pageStart + REC_PAGE_SIZE, sorted.length);
    const paginated = sorted.slice(pageStart, pageEnd);

    const th = (col, label, extra = '') =>
        `<th class="rec-th-sortable${REC_SORT.col === col ? ' rec-th-active' : ''}"
             onclick="setSort('${col}')" ${extra}>
            ${label} ${sortIcon(col)}
        </th>`;

    const tableHtml = `
        <table class="rec-table rec-flat-table" id="recFlatTable">
            <thead>
                <tr>
                    ${th('id',        '#',         'style="width:44px;"')}
                    ${th('type_label','Type',      'style="width:70px;"')}
                    ${th('name',      'Name / Prepared By')}
                    ${th('title',     'Position / Title')}
                    ${th('division',  'Division / Unit')}
                    ${th('year',      'Year',      'style="width:55px;"')}
                    ${th('semester',  'Semester',  'style="width:90px;"')}
                    ${th('approved',  'Approved By')}
                    ${th('items',     'Items',     'style="width:50px;"')}
                    ${th('saved_at',  'Saved At',  'style="width:130px;"')}
                    <th style="width:130px;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${paginated.map(r => buildFlatRow(r)).join('')}
            </tbody>
        </table>`;

    /* Pagination controls */
    const paginationHtml = buildPagination(REC_PAGE, totalPages, sorted.length, pageStart, pageEnd);

    container.innerHTML = statsHtml + tableHtml + paginationHtml;
}

function buildPagination(currentPage, totalPages, totalItems, pageStart, pageEnd) {
    if (totalPages <= 1) return '';

    const btn = (page, label, disabled, active = false) =>
        `<button class="rec-page-btn${active ? ' active' : ''}${disabled ? ' disabled' : ''}"
            ${disabled ? 'disabled' : `onclick="recGoToPage(${page})"`}>
            ${label}
        </button>`;

    /* Build page number buttons — show up to 7, with ellipsis */
    let pageButtons = '';
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
        range.push(i);
    }

    if (range[0] > 1) {
        pageButtons += btn(1, '1', false, currentPage === 1);
        if (range[0] > 2) pageButtons += '<span class="rec-page-ellipsis">…</span>';
    }
    range.forEach(p => { pageButtons += btn(p, p, false, p === currentPage); });
    if (range[range.length - 1] < totalPages) {
        if (range[range.length - 1] < totalPages - 1) pageButtons += '<span class="rec-page-ellipsis">…</span>';
        pageButtons += btn(totalPages, totalPages, false, currentPage === totalPages);
    }

    return `
        <div class="rec-pagination">
            <div class="rec-page-info">
                Showing <strong>${pageStart + 1}–${pageEnd}</strong> of <strong>${totalItems}</strong> records
            </div>
            <div class="rec-page-controls">
                ${btn(1,           '«', currentPage === 1)}
                ${btn(currentPage - 1, '‹', currentPage === 1)}
                ${pageButtons}
                ${btn(currentPage + 1, '›', currentPage === totalPages)}
                ${btn(totalPages,  '»', currentPage === totalPages)}
            </div>
        </div>`;
}

function recGoToPage(page) {
    REC_PAGE = page;
    renderRecords();
    /* Scroll the records container into view */
    document.getElementById('rec-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════
   ROW BUILDER
══════════════════════════════════════════ */
function buildFlatRow(r) {
    const savedAt = r.saved_at
        ? new Date(r.saved_at).toLocaleString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : '—';

    const semLabel = r.semester === '1st' ? '1st (Jan–Jun)'
                   : r.semester === '2nd' ? '2nd (Jul–Dec)'
                   : esc(r.semester);

    const eyeFn  = r._type === 'dpcr' ? `recViewDpcr(${r.id})`
                 : r._type === 'spcr' ? `recViewSpcr(${r.id})`
                 : `recViewIpcr(${r.id})`;
    const editFn = r._type === 'dpcr' ? `recEditDpcr(${r.id})`
                 : r._type === 'spcr' ? `recEditSpcr(${r.id})`
                 : `recEditIpcr(${r.id})`;
    const delFn  = r._type === 'dpcr' ? `recDeleteDpcr(${r.id})`
                 : r._type === 'spcr' ? `recDeleteSpcr(${r.id})`
                 : `recDeleteIpcr(${r.id})`;

    return `<tr class="rec-flat-row">
        <td style="text-align:center;color:var(--muted);">${r.id}</td>
        <td style="text-align:center;"><span class="rec-type-chip ${r._type}">${esc(r.type_label)}</span></td>
        <td><strong>${esc(r.name)}</strong></td>
        <td style="color:var(--muted);font-size:9.5px;">${esc(r.title)}</td>
        <td>${esc(r.division)}</td>
        <td style="text-align:center;font-weight:700;">${esc(String(r.year))}</td>
        <td style="text-align:center;font-size:9.5px;">${semLabel}</td>
        <td style="font-size:9.5px;">${esc(r.approved)}</td>
        <td style="text-align:center;">${r.items}</td>
        <td style="white-space:nowrap;font-size:9.5px;">${esc(savedAt)}</td>
        <td>
            <div class="rec-actions">
                <button class="rec-btn rec-btn-view" onclick="${eyeFn}" title="View record">👁</button>
                <button class="rec-btn rec-btn-edit" onclick="${editFn}" title="Edit record">✏ Edit</button>
                <button class="rec-btn rec-btn-del"  onclick="${delFn}" title="Delete record">✕</button>
            </div>
        </td>
    </tr>`;
}

/* ══════════════════════════════════════════
   VIEW MODAL HELPERS
══════════════════════════════════════════ */
function _openViewModal(title, metaHtml, tableHtml) {
    const modal   = document.getElementById('viewModal');
    const titleEl = document.getElementById('viewModalTitle');
    const bodyEl  = document.getElementById('viewModalContent');
    if (!modal || !titleEl || !bodyEl) return;
    titleEl.textContent = title;
    bodyEl.innerHTML = metaHtml + (tableHtml || '');
    modal.classList.add('open');
}

function recViewSpcr(id) {
    const record = REC_SPCR.find(r => r.id === id); if (!record) return;
    const semLabel = record.semester === '1st' ? '1st Semester (Jan–Jun)' : '2nd Semester (Jul–Dec)';
    const meta = `<div class="view-meta">
        <div><span>Employee: </span><strong>${esc(record.employee_name || '—')}</strong></div>
        <div><span>Position: </span><strong>${esc(record.employee_title || '—')}</strong></div>
        <div><span>Division / Unit: </span><strong>${esc(record.division || '—')}</strong></div>
        <div><span>Year: </span><strong>${esc(String(record.year || '—'))}</strong></div>
        <div><span>Semester: </span><strong>${esc(semLabel)}</strong></div>
        <div><span>Approved By: </span><strong>${esc(record.approved_by || '—')}</strong></div>
    </div>`;
    let tbl = '';
    if (Array.isArray(record.items) && record.items.length) {
        tbl = `<table class="view-tbl"><thead><tr>
            <th>Type</th><th>Strategic Goal</th><th>Performance Indicator</th>
            <th>Budget</th><th>Person Accountable</th>
            <th>Actual Accomplishment</th><th>Rate</th><th>Remarks</th>
        </tr></thead><tbody>`;
        record.items.forEach(i => { tbl += `<tr>
            <td>${esc(i.function_type || '—')}</td>
            <td>${esc(i.strategic_goal || '—')}</td>
            <td>${esc(i.performance_indicator || '—')}</td>
            <td>${esc(i.allotted_budget || '—')}</td>
            <td>${esc(i.section_accountable || '—')}</td>
            <td>${esc(i.actual_accomplishment || '—')}</td>
            <td>${esc(i.accomplishment_rate || '—')}</td>
            <td>${esc(i.remarks || '—')}</td>
        </tr>`; });
        tbl += '</tbody></table>';
    }
    _openViewModal(`SPCR Form #${id} — ${record.employee_name || ''}`, meta, tbl);
}

function recViewDpcr(id) {
    const record = REC_DPCR.find(r => r.id === id); if (!record) return;
    const semLabel = record.semester === '1st' ? '1st Semester (Jan–Jun)' : '2nd Semester (Jul–Dec)';
    const meta = `<div class="view-meta">
        <div><span>Employee: </span><strong>${esc(record.employee_name || '—')}</strong></div>
        <div><span>Title: </span><strong>${esc(record.employee_title || '—')}</strong></div>
        <div><span>Division: </span><strong>${esc(record.division || '—')}</strong></div>
        <div><span>Year: </span><strong>${esc(record.year || '—')}</strong></div>
        <div><span>Semester: </span><strong>${esc(semLabel)}</strong></div>
        <div><span>Approved By: </span><strong>${esc(record.approved_by || '—')}</strong></div>
    </div>`;
    let tbl = '';
    if (Array.isArray(record.items) && record.items.length) {
        tbl = `<table class="view-tbl"><thead><tr>
            <th>Type</th><th>Strategic Goal</th><th>Performance Indicator</th>
            <th>Budget</th><th>Section</th><th>Accomplishment</th><th>Rate</th><th>Remarks</th>
        </tr></thead><tbody>`;
        record.items.forEach(i => { tbl += `<tr>
            <td>${esc(i.function_type || '—')}</td>
            <td>${esc(i.strategic_goal || '—')}</td>
            <td>${esc(i.performance_indicator || '—')}</td>
            <td>${esc(i.allotted_budget || '—')}</td>
            <td>${esc(i.section_accountable || '—')}</td>
            <td>${esc(i.actual_accomplishment || '—')}</td>
            <td>${esc(i.accomplishment_rate || '—')}</td>
            <td>${esc(i.remarks || '—')}</td>
        </tr>`; });
        tbl += '</tbody></table>';
    }
    _openViewModal(`DPCR Form #${id} — ${record.employee_name || ''}`, meta, tbl);
}

function recViewIpcr(id) {
    const record = REC_IPCR.find(r => r.id === id); if (!record) return;
    const semLabel = record.semester === '1st' ? '1st Semester (Jan–Jun)' : '2nd Semester (Jul–Dec)';
    const meta = `<div class="view-meta">
        <div><span>Employee: </span><strong>${esc(record.employee_name || '—')}</strong></div>
        <div><span>Position: </span><strong>${esc(record.employee_position || '—')}</strong></div>
        <div><span>Unit: </span><strong>${esc(record.employee_unit || '—')}</strong></div>
        <div><span>Period: </span><strong>${esc(record.period || '—')}</strong></div>
        <div><span>Year: </span><strong>${esc(record.year || '—')}</strong></div>
        <div><span>Semester: </span><strong>${esc(semLabel)}</strong></div>
        <div><span>Supervisor: </span><strong>${esc(record.supervisor || '—')}</strong></div>
        <div><span>Approved By: </span><strong>${esc(record.approved_by || '—')}</strong></div>
        <div><span>Final Average: </span><strong>${esc(record.final_avg || '—')}</strong></div>
        <div><span>Rating: </span><strong>${esc(record.adjectival_rating || '—')}</strong></div>
    </div>`;
    let tbl = '';
    if (Array.isArray(record.items) && record.items.length) {
        tbl = `<table class="view-tbl"><thead><tr>
            <th>Type</th><th>Strategic Goal</th><th>Performance Indicator</th>
            <th>Accomplishment</th><th>Rate</th>
            <th>Q</th><th>E</th><th>T</th><th>A</th><th>Remarks</th>
        </tr></thead><tbody>`;
        record.items.forEach(i => { tbl += `<tr>
            <td>${esc(i.function_type || '—')}</td>
            <td>${esc(i.strategic_goal || '—')}</td>
            <td>${esc(i.performance_indicator || '—')}</td>
            <td>${esc(i.actual_accomplishment || '—')}</td>
            <td>${esc(i.accomplishment_rate || '—')}</td>
            <td>${esc(i.rating_q ?? '—')}</td>
            <td>${esc(i.rating_e ?? '—')}</td>
            <td>${esc(i.rating_t ?? '—')}</td>
            <td>${esc(i.rating_a ?? '—')}</td>
            <td>${esc(i.remarks || '—')}</td>
        </tr>`; });
        tbl += '</tbody></table>';
    }
    _openViewModal(`IPCR Form #${id} — ${record.employee_name || ''}`, meta, tbl);
}

/* ══════════════════════════════════════════
   EDIT STATE
   Tracks which record is currently being
   edited so the save button does PUT instead
   of POST and the old record is removed.
══════════════════════════════════════════ */
const REC_EDITING = { dpcr: null, spcr: null, ipcr: null };

/* Show / hide the "Editing Record #X" banner on a form page */
function _recSetEditBanner(pageId, type, id) {
    const page = document.getElementById(pageId);
    if (!page) return;

    // Remove any existing banner
    page.querySelectorAll('.rec-edit-banner').forEach(el => el.remove());

    if (!id) return; // clearing — no banner needed

    const banner = document.createElement('div');
    banner.className = 'rec-edit-banner';
    banner.innerHTML = `
        ✏️ <strong>Editing ${type.toUpperCase()} Record #${id}</strong>
        — make your changes and click 💾 Save to update.
        <button type="button" class="rec-edit-cancel-btn"
                onclick="_recCancelEdit('${type}')">✕ Cancel Edit</button>`;
    // Insert as the very first child of the page div
    page.insertBefore(banner, page.firstChild);
}

/* Cancel edit — clear the banner, the editing ID, and reset the form to blank */
function _recCancelEdit(type) {
    REC_EDITING[type] = null;
    const pageMap = { dpcr: 'page-dpcr', spcr: 'page-spcr', ipcr: 'page-ipcr' };
    _recSetEditBanner(pageMap[type], type, null);

    /* Reset the form to a clean state so stale edit data is gone */
    if (type === 'dpcr') {
        ['d_emp_name','d_emp_title','d_approved_by','d_period'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const dDisp = document.getElementById('d_disp_name');
        if (dDisp) dDisp.textContent = '\u00a0';
        const dBody = document.getElementById('dpcrBody');
        if (dBody) {
            dBody.innerHTML = '';
            if (typeof createDpcrSectionRow === 'function') {
                dBody.appendChild(createDpcrSectionRow('STRATEGIC FUNCTIONS'));
            }
        }
    } else if (type === 'spcr') {
        ['s_emp_name','s_emp_position','s_period','s_supervisor','s_approved_by'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const sDisp = document.getElementById('s_disp_name');
        if (sDisp) sDisp.textContent = '\u00a0';
        /* Full SPCR clear via the existing sClearBtn logic */
        const sBody = document.getElementById('spcrBody');
        if (sBody) {
            sBody.innerHTML = '';
            if (typeof createSectionRow === 'function' && typeof createAvgRow === 'function') {
                sBody.appendChild(createSectionRow('STRATEGIC FUNCTIONS :'));
                sBody.appendChild(createAvgRow('Strategic', 'strategic'));
                sBody.appendChild(createSectionRow('CORE FUNCTIONS :'));
                sBody.appendChild(createAvgRow('Core', 'core'));
            }
        }
        if (typeof computeSpcrAverages === 'function') computeSpcrAverages();
        /* Reset section filter */
        const sFilter = document.getElementById('spcr-section-filter');
        if (sFilter) { sFilter.value = ''; if (typeof filterSpcrBySection === 'function') filterSpcrBySection(''); }
    } else if (type === 'ipcr') {
        ['i_emp_name','i_emp_position','i_emp_unit','i_period',
         'i_supervisor','i_approved_by','i_recommending'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        ['i_disp_name','i_disp_name2','i_disp_supervisor','i_disp_approved'].forEach(id => {
            const el = document.getElementById(id); if (el) el.textContent = '\u00a0';
        });
        const iBody = document.getElementById('ipcrBody');
        if (iBody) iBody.innerHTML = '<tr class="section-header"><td colspan="11">CORE FUNCTIONS :</td></tr>';
        ['i_avg_core','i_avg_support'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        if (typeof computeIpcrSummary === 'function') computeIpcrSummary();
        /* Reset IPCR section filter */
        const iFilter = document.getElementById('ipcr-section-filter');
        if (iFilter) { iFilter.value = ''; if (typeof filterIpcrBySection === 'function') filterIpcrBySection(''); }
    }

    const _cancelAlertId = type === 'dpcr' ? 'd-alertInfo' : type === 'spcr' ? 's-alertInfo' : 'i-alertInfo';
    showAlert(_cancelAlertId, 'info', '\u2716 Edit cancelled. Form has been reset.');
}

/* ══════════════════════════════════════════
   EDIT — load into the form tab for editing
══════════════════════════════════════════ */
async function recEditSpcr(id) {
    if (!confirm(`Load SPCR #${id} into the form for editing? This will replace the current form.`)) return;
    try {
        const m = await apiFetch(`/api/spcr/${id}`);
        if (typeof hydrateSpcrForm === 'function') hydrateSpcrForm(m);
        REC_EDITING.spcr = id;
        _recSetEditBanner('page-spcr', 'SPCR', id);
        switchTab('spcr');
    } catch (err) { alert('Edit failed: ' + err.message); }
}

function recEditDpcr(id) {
    if (!confirm(`Load DPCR #${id} into the form for editing? This will replace the current form.`)) return;
    const record = REC_DPCR.find(r => r.id === id); if (!record) return;
    if (typeof hydrateDpcrForm === 'function') hydrateDpcrForm(record);
    REC_EDITING.dpcr = id;
    _recSetEditBanner('page-dpcr', 'DPCR', id);
    switchTab('dpcr');
}

function recEditIpcr(id) {
    if (!confirm(`Load IPCR #${id} into the form for editing? This will replace the current form.`)) return;
    const record = REC_IPCR.find(r => r.id === id); if (!record) return;
    if (typeof hydrateIpcrForm === 'function') hydrateIpcrForm(record);
    REC_EDITING.ipcr = id;
    _recSetEditBanner('page-ipcr', 'IPCR', id);
    switchTab('ipcr');
}

/* ══════════════════════════════════════════
   SAVE INTERCEPT
   Patches each form's save button so that
   when an editingId is set it does PUT and
   removes the old record from the list.
══════════════════════════════════════════ */
(function patchSaveButtons() {
    /* DPCR */
    const dBtn = document.getElementById('dSaveBtn');
    if (dBtn) {
        dBtn.addEventListener('click', async (e) => {
            const editId = REC_EDITING.dpcr;
            if (!editId) return; // no edit in progress — let dpcr.js handle normal POST

            e.stopImmediatePropagation(); // prevent dpcr.js POST listener from also firing

            const data = (typeof readDpcrForm === 'function') ? readDpcrForm() : null;
            if (!data) return;
            if (!data.employee_name) {
                showAlert('d-alertErr', 'err', 'Please fill in the employee name.');
                return;
            }
            try {
                const saved = await apiFetch(`/api/dpcr/${editId}`, 'PUT', data);
                REC_DPCR = REC_DPCR.filter(r => r.id !== editId);
                const updated = { ...(saved.form ?? saved), _type: 'dpcr' };
                REC_DPCR.unshift(updated);
                populateYearFilter(); renderRecords();
                REC_EDITING.dpcr = null;
                _recSetEditBanner('page-dpcr', 'dpcr', null);
                showAlert('d-alertOk', 'ok', `✔ DPCR #${editId} updated successfully.`);
            } catch (err) {
                showAlert('d-alertErr', 'err', 'Update failed: ' + err.message);
            }
        }, true); // capture phase
    }

    const sBtn = document.getElementById('sSaveBtn');
    if (sBtn) {
        sBtn.addEventListener('click', async (e) => {
            const editId = REC_EDITING.spcr;
            if (!editId) return;

            e.stopImmediatePropagation();

            const data = (typeof readSpcrForm === 'function') ? readSpcrForm() : null;
            if (!data) return;
            if (!data.employee_name) {
                showAlert('s-alertErr', 'err', 'Please fill in the employee name.');
                return;
            }
            try {
                const saved = await apiFetch(`/api/spcr/${editId}`, 'PUT', data);
                REC_SPCR = REC_SPCR.filter(r => r.id !== editId);
                const updated = { ...(saved.form ?? saved), _type: 'spcr' };
                REC_SPCR.unshift(updated);
                populateYearFilter(); renderRecords();
                REC_EDITING.spcr = null;
                _recSetEditBanner('page-spcr', 'spcr', null);
                showAlert('s-alertOk', 'ok', `✔ SPCR #${editId} updated successfully.`);
            } catch (err) {
                showAlert('s-alertErr', 'err', 'Update failed: ' + err.message);
            }
        }, true);
    }

    /* IPCR */
    const iBtn = document.getElementById('iSaveBtn');
    if (iBtn) {
        iBtn.addEventListener('click', async (e) => {
            const editId = REC_EDITING.ipcr;
            if (!editId) return;

            e.stopImmediatePropagation();

            const data = (typeof readIpcrForm === 'function') ? readIpcrForm() : null;
            if (!data) return;
            if (!data.employee_name) {
                showAlert('i-alertErr', 'err', 'Please fill in the employee name.');
                return;
            }
            try {
                const saved = await apiFetch(`/api/ipcr/${editId}`, 'PUT', data);
                REC_IPCR = REC_IPCR.filter(r => r.id !== editId);
                const updated = { ...(saved.form ?? saved.ipcr ?? saved), _type: 'ipcr' };
                REC_IPCR.unshift(updated);
                populateYearFilter(); renderRecords();
                REC_EDITING.ipcr = null;
                _recSetEditBanner('page-ipcr', 'ipcr', null);
                showAlert('i-alertOk', 'ok', `✔ IPCR #${editId} updated successfully.`);
            } catch (err) {
                showAlert('i-alertErr', 'err', 'Update failed: ' + err.message);
            }
        }, true);
    }
})();

/* ══════════════════════════════════════════
   DELETE
══════════════════════════════════════════ */
async function recDeleteSpcr(id) {
    if (!confirm(`Delete SPCR Matrix #${id}? This cannot be undone.`)) return;
    try {
        await apiFetch(`/api/spcr/${id}`, 'DELETE');
        REC_SPCR = REC_SPCR.filter(r => r.id !== id);
        if (typeof DB_matrices !== 'undefined') DB_matrices = DB_matrices.filter(r => r.id !== id);
        if (typeof renderMatrixList === 'function') renderMatrixList();
        renderRecords(); populateYearFilter();
    } catch (err) { alert('Delete failed: ' + err.message); }
}

async function recDeleteDpcr(id) {
    if (!confirm(`Delete DPCR Form #${id}? This cannot be undone.`)) return;
    try {
        await apiFetch(`/api/dpcr/${id}`, 'DELETE');
        REC_DPCR = REC_DPCR.filter(r => r.id !== id);
        renderRecords(); populateYearFilter();
    } catch (err) { alert('Delete failed: ' + err.message); }
}

async function recDeleteIpcr(id) {
    if (!confirm(`Delete IPCR Form #${id}? This cannot be undone.`)) return;
    try {
        await apiFetch(`/api/ipcr/${id}`, 'DELETE');
        REC_IPCR = REC_IPCR.filter(r => r.id !== id);
        renderRecords(); populateYearFilter();
    } catch (err) { alert('Delete failed: ' + err.message); }
}

/* ══════════════════════════════════════════
   NOTIFY — called by dpcr/spcr/ipcr save buttons
   to instantly push new record into the table
══════════════════════════════════════════ */
function notifyRecordSaved(type, record) {
    if (!record) return;
    const r = { ...record, _type: type };
    if (type === 'dpcr') {
        REC_DPCR = REC_DPCR.filter(x => x.id !== r.id);
        REC_DPCR.unshift(r);
    } else if (type === 'spcr') {
        REC_SPCR = REC_SPCR.filter(x => x.id !== r.id);
        REC_SPCR.unshift(r);
        if (typeof DB_matrices !== 'undefined') {
            DB_matrices = DB_matrices.filter(x => x.id !== r.id);
            DB_matrices.unshift(r);
        }
    } else if (type === 'ipcr') {
        REC_IPCR = REC_IPCR.filter(x => x.id !== r.id);
        REC_IPCR.unshift(r);
    }
    populateYearFilter();
    if (document.getElementById('page-records')?.classList.contains('active')) {
        renderRecords();
    }
}

/* ══════════════════════════════════════════
   INIT — lazy load on first Records tab visit
══════════════════════════════════════════ */
let REC_LOADED = false;

(function patchSwitchTab() {
    const _orig = window.switchTab;
    window.switchTab = function(tab, btn) {
        _orig(tab, btn);
        if (tab === 'records' && !REC_LOADED) {
            REC_LOADED = true;
            loadAllRecords();
        }
    };
})();