<div class="page" id="page-employees">

    <div class="rec-page-header">
        <div class="rec-page-title">
            <span class="rec-icon"></span>
            Employee Directory
        </div>
        <div class="rec-page-subtitle">
            Live from 190.190.0.55 — bvflh_users table
        </div>
    </div>

    <!-- Toolbar -->
    <div class="rec-toolbar">
        <div class="rec-toolbar-left">
            <label class="rec-filter-label">Division</label>
            <select id="emp-filter-division" class="rec-select" onchange="loadEmployees()">
                <option value="">All Divisions</option>
            </select>
        </div>
        <div class="rec-toolbar-right">
            <input type="text" id="emp-search" class="rec-search-input"
                   placeholder="🔍  Search by name, position, section…"
                   oninput="debounceEmpSearch()">
            <button class="rec-refresh-btn" onclick="loadEmployees()">⟳ Refresh</button>
        </div>
    </div>

    <!-- Stats -->
    <div id="emp-stats" style="margin-bottom:12px;font-size:10.5px;color:#555;"></div>

    <!-- Alert -->
    <div id="emp-alert" style="display:none;" class="alert-err"></div>

    <!-- Table -->
    <div id="emp-container">
        <div class="rec-loading">Click the Employees tab to load the directory.</div>
    </div>

    <!-- Pagination -->
    <div id="emp-pagination" style="margin-top:12px;"></div>

</div>