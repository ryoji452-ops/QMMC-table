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
                   placeholder="🔍  Search by name, division, area…"
                   oninput="renderRecords()">
            <button class="rec-refresh-btn" onclick="loadAllRecords()" title="Refresh">⟳ Refresh</button>
        </div>
    </div>

    {{-- Alert --}}
    <div id="rec-alert" style="display:none;" class="alert-info"></div>

    {{-- Records Container --}}
    <div id="rec-container">
        <div class="rec-loading">records.</div>
    </div>

</div>{{-- /page-records --}}