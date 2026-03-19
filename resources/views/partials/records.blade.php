{{-- resources/views/partials/records.blade.php --}}

<div class="page" id="page-records">

    {{-- Page Header --}}
    <div class="rec-page-header">
        <div class="rec-page-title">
            <span class="rec-icon"></span>
            Records
        </div>
        <div class="rec-page-subtitle">All saved DPCR, SPCR, and IPCR records — click any column header to sort</div>
    </div>

    {{-- Filter / Search Bar --}}
    <div class="rec-toolbar">
        <div class="rec-toolbar-left">
            <label class="rec-filter-label">Year</label>
            <select id="rec-filter-year" class="rec-select" onchange="renderRecords()">
                <option value="">All Years</option>
                @php $currentYear = (int) date('Y'); @endphp
                @for ($y = $currentYear; $y >= $currentYear - 6; $y--)
                    <option value="{{ $y }}">{{ $y }}</option>
                @endfor
            </select>

            <label class="rec-filter-label" style="margin-left:14px;">Semester</label>
            <select id="rec-filter-sem" class="rec-select" onchange="renderRecords()">
                <option value="">All Semesters</option>
                <option value="1st">1st Semester (Jan – Jun)</option>
                <option value="2nd">2nd Semester (Jul – Dec)</option>
            </select>

            <label class="rec-filter-label" style="margin-left:14px;">Type</label>
            <select id="rec-filter-type" class="rec-select" onchange="renderRecords()">
                <option value="">All Types</option>
                <option value="dpcr">DPCR Form</option>
                <option value="spcr">SPCR Matrix</option>
                <option value="ipcr">IPCR Form</option>
            </select>
        </div>
        <div class="rec-toolbar-right">
            <input type="text" id="rec-search" class="rec-search-input"
                   placeholder="🔍  Search by name, division, …"
                   oninput="renderRecords()">
            <button class="rec-refresh-btn" onclick="loadAllRecords()" title="Refresh">⟳ Refresh</button>
        </div>
    </div>

    {{-- Bulk Action Bar (shown only when rows are checked) --}}
    <div id="rec-bulk-bar" class="rec-bulk-bar" style="display:none;">
        <span id="rec-bulk-count" class="rec-bulk-count">0 records selected</span>
        <button type="button" class="rec-bulk-del-btn"
                onclick="recBulkDeleteSelected()"
                title="Delete all selected records">
            Delete Selected
        </button>
        <button type="button" class="rec-bulk-clear-btn"
                onclick="REC_SELECTED.clear(); renderRecords(); _updateBulkBar();"
                title="Clear selection">
            Clear Selection
        </button>
    </div>

    {{-- Alert --}}
    <div id="rec-alert" style="display:none;" class="alert-info"></div>

    {{-- Records Container --}}
    <div id="rec-container">
        <div class="rec-loading">⏳ Click the Records tab to load records.</div>
    </div>

    {{-- ═══════════════════════════════════════════════════════
         BULK DELETE CONFIRMATION MODAL
    ═══════════════════════════════════════════════════════ --}}
    <div class="rec-bulk-modal-overlay" id="rec-bulk-confirm-modal"
         onclick="if(event.target===this) recCloseBulkConfirm()">
        <div class="rec-bulk-modal-box">
            <button class="rec-bulk-modal-close" onclick="recCloseBulkConfirm()" title="Cancel">&times;</button>

            <div class="rec-bulk-modal-header">
                <span class="rec-bulk-modal-title">Confirm Bulk Delete</span>
            </div>

            <div class="rec-bulk-modal-warn">
                You are about to permanently delete
                <strong id="rec-bulk-confirm-count">0 records</strong>.
                This action <strong>cannot be undone</strong>.
                Please review the list below before confirming.
            </div>

            <div id="rec-bulk-confirm-list" class="rec-bulk-confirm-list">
                {{-- Populated by JS --}}
            </div>

            <div class="rec-bulk-modal-footer">
                <button type="button" class="rec-bulk-confirm-cancel"
                        onclick="recCloseBulkConfirm()">
                    Cancel
                </button>
                <button type="button" class="rec-bulk-confirm-del"
                        onclick="recConfirmBulkDelete()">
                    Yes, Delete All
                </button>
            </div>
        </div>
    </div>

</div>{{-- /page-records --}}