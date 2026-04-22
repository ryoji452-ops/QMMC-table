/* ═══════════════════════════════════════════
   employees.js
   Employee directory — live from 190.190.0.55
   Depends on: shared.js (esc, CSRF, apiFetch, _getAppBase)
   Load AFTER shared.js, BEFORE print_modes.js
═══════════════════════════════════════════ */

var EMP_PAGE        = 1;
var EMP_PER_PAGE    = 50;
var EMP_LOADED      = false;
var _empSearchTimer = null;

/* ── Debounced search ── */
function debounceEmpSearch() {
    clearTimeout(_empSearchTimer);
    _empSearchTimer = setTimeout(function () {
        EMP_PAGE = 1;
        loadEmployees();
    }, 350);
}

/* ── Main loader ── */
async function loadEmployees() {
    var container = document.getElementById('emp-container');
    var statsEl   = document.getElementById('emp-stats');
    var alertEl   = document.getElementById('emp-alert');

    if (!container) return;

    var search   = (document.getElementById('emp-search')          || {}).value || '';
    var division = (document.getElementById('emp-filter-division') || {}).value || '';

    container.innerHTML = '<div class="rec-loading">⏳ Loading from 190.190.0.55…</div>';
    if (statsEl) statsEl.textContent = '';
    if (alertEl) alertEl.style.display = 'none';

    var params = new URLSearchParams({
        page:     EMP_PAGE,
        per_page: EMP_PER_PAGE,
    });
    if (search.trim())   params.set('search',   search.trim());
    if (division.trim()) params.set('division', division.trim());

    var base = (typeof _getAppBase === 'function') ? _getAppBase() : (window.APP_BASE || '');

    try {
        var res = await fetch(base + '/api/legacy-users?' + params.toString(), {
            headers: {
                'Accept':       'application/json',
                'X-CSRF-TOKEN': _getCsrfToken(),
            },
        });

        if (!res.ok) {
            var errBody = await res.json().catch(function () { return {}; });
            throw new Error(errBody.message || ('HTTP ' + res.status));
        }

        var data = await res.json();

        /* Stats */
        if (statsEl && data.total > 0) {
            var from = (data.current_page - 1) * data.per_page + 1;
            var to   = Math.min(data.current_page * data.per_page, data.total);
            statsEl.textContent = 'Showing ' + from + '–' + to + ' of ' + data.total + ' employees';
        } else if (statsEl) {
            statsEl.textContent = 'No employees found.';
        }

        /* Table */
        container.innerHTML = _buildEmpTable(data.data || []);

        /* Pagination */
        _renderEmpPagination(data.current_page, data.last_page);

    } catch (err) {
        container.innerHTML =
            '<div class="rec-empty">⚠ Failed to load employees: ' + esc(err.message) + '</div>';
        if (alertEl) {
            alertEl.textContent   = '⚠ Could not reach 190.190.0.55: ' + err.message;
            alertEl.style.display = 'block';
        }
    }
}

/* ── Table builder ── */
function _buildEmpTable(rows) {
    if (!rows || !rows.length) {
        return '<div class="rec-empty">No employees match your search.</div>';
    }

    var html = '<table class="rec-flat-table" style="width:100%;border-collapse:collapse;">'
        + '<thead><tr>'
        + '<th style="width:55px;text-align:center;">ID</th>'
        + '<th>Full Name</th>'
        + '<th>Last Name</th>'
        + '<th>First Name</th>'
        + '<th>Middle Name</th>'
        + '<th>Division</th>'
        + '<th>Position</th>'
        + '<th style="width:80px;text-align:center;" class="no-print">Use</th>'
        + '</tr></thead><tbody>';

    rows.forEach(function (u) {
        html += '<tr>'
            + '<td style="text-align:center;color:#888;font-size:10px;">'
            +   esc(String(u.id || ''))
            + '</td>'
            + '<td><strong>' + esc(u.full_name || '—') + '</strong></td>'
            + '<td>' + esc(u.l_name    || '—') + '</td>'
            + '<td>' + esc(u.f_name    || '—') + '</td>'
            + '<td>' + esc(u.m_name    || '—') + '</td>'
            + '<td>' + esc(u.division  || '—') + '</td>'
            + '<td style="font-size:9.5px;">' + esc(u.position || '—') + '</td>'
            + '<td class="no-print" style="text-align:center;padding:3px;">'
            +   '<button type="button" class="rec-btn rec-btn-view" '
            +           'style="white-space:nowrap;" '
            +           'onclick="loadEmpIntoForms(' + u.id + ')" '
            +           'title="Auto-fill all form tabs with this employee\'s info">'
            +     '✔ Use'
            +   '</button>'
            + '</td>'
            + '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

/* ── Pagination ── */
function _renderEmpPagination(current, total) {
    var el = document.getElementById('emp-pagination');
    if (!el) return;
    if (total <= 1) { el.innerHTML = ''; return; }

    var html = '<div class="rec-pagination"><div class="rec-page-controls">';

    if (current > 1) {
        html += '<button class="rec-page-btn" onclick="empGoTo(' + (current - 1) + ')">‹ Prev</button>';
    }

    var start = Math.max(1, current - 2);
    var end   = Math.min(total, current + 2);
    if (start > 1) html += '<span class="rec-page-ellipsis">…</span>';
    for (var i = start; i <= end; i++) {
        html += '<button class="rec-page-btn' + (i === current ? ' active' : '') + '" '
              + 'onclick="empGoTo(' + i + ')">' + i + '</button>';
    }
    if (end < total) html += '<span class="rec-page-ellipsis">…</span>';

    if (current < total) {
        html += '<button class="rec-page-btn" onclick="empGoTo(' + (current + 1) + ')">Next ›</button>';
    }

    html += '</div></div>';
    el.innerHTML = html;
}

function empGoTo(page) {
    EMP_PAGE = page;
    loadEmployees();
    var pg = document.getElementById('page-employees');
    if (pg) pg.scrollTop = 0;
}

/* ── "Use" button: auto-fill all form tabs ── */
async function loadEmpIntoForms(id) {
    var base = (typeof _getAppBase === 'function') ? _getAppBase() : (window.APP_BASE || '');
    try {
        var res = await fetch(base + '/api/legacy-users/' + id, {
            headers: {
                'Accept':       'application/json',
                'X-CSRF-TOKEN': _getCsrfToken(),
            },
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var u = await res.json();

        var name     = u.full_name      || '';
        var position = u.position       || u.division_label || '';
        var division = u.division       || '';

        function fill(elId, val) {
            var el = document.getElementById(elId);
            if (el && val) el.value = val;
        }
        function fillSpan(elId, val) {
            var el = document.getElementById(elId);
            if (el && val) el.textContent = val;
        }

        /* DPCR */
        fill('d_emp_name',  name);
        fill('d_emp_title', position || division);
        fillSpan('d_disp_name', name);

        /* SPCR */
        fill('s_emp_name',     name);
        fill('s_emp_position', position || division);
        fillSpan('s_disp_name', name);

        /* IPCR */
        fill('i_emp_name',     name);
        fill('i_emp_position', position);
        fill('i_emp_unit',     division);
        fillSpan('i_disp_name',  name);
        fillSpan('i_disp_name2', name);

        /* Visual feedback on the clicked button */
        var btns = document.querySelectorAll(
            '#emp-container button[onclick="loadEmpIntoForms(' + id + ')"]'
        );
        btns.forEach(function (b) {
            b.textContent = '✔ Loaded!';
            b.style.background = '#1e6e3a';
            b.style.color      = '#fff';
            setTimeout(function () {
                b.textContent      = '✔ Use';
                b.style.background = '';
                b.style.color      = '';
            }, 2000);
        });

    } catch (err) {
        alert('⚠ Failed to load employee #' + id + ': ' + err.message);
    }
}

/* ── Load divisions dropdown ── */
async function loadEmpDivisions() {
    var base = (typeof _getAppBase === 'function') ? _getAppBase() : (window.APP_BASE || '');
    try {
        var res = await fetch(base + '/api/legacy-users/divisions', {
            headers: {
                'Accept':       'application/json',
                'X-CSRF-TOKEN': _getCsrfToken(),
            },
        });
        if (!res.ok) return;
        var divs = await res.json();
        var sel  = document.getElementById('emp-filter-division');
        if (!sel || !Array.isArray(divs)) return;
        divs.forEach(function (d) {
            if (!d) return;
            var opt = document.createElement('option');
            opt.value = d; opt.textContent = d;
            sel.appendChild(opt);
        });
    } catch (e) {
        /* silent — filter works without options */
    }
}

/* ══════════════════════════════════════════════════════════════
   TAB INTEGRATION
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    var _prevSwitchTab = window.switchTab;

    window.switchTab = function (tab, btn) {
        if (typeof _prevSwitchTab === 'function') {
            _prevSwitchTab(tab, btn);
        }

        if (tab === 'employees' && !EMP_LOADED) {
            EMP_LOADED = true;
            loadEmpDivisions();
            loadEmployees();
        }
    };
});