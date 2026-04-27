{{-- resources/views/qmmc/index.blade.php --}}
@extends('layouts.app')

@section('title', 'QMMC – DPCR | SPCR | IPCR')

@section('content')

    {{-- ══════════════════════════════════════════════════════════
         FORM SELECTOR — shown first, hidden after user chooses
    ══════════════════════════════════════════════════════════ --}}
    <div id="form-selector-screen" class="form-selector-screen">

        <div class="form-selector-header">
            <div class="form-selector-logo-wrap">
                <img src="img/qmmclogo1.png" alt="QMMC Logo" class="form-selector-logo">
            </div>
            <div class="form-selector-title-wrap">
                <div class="form-selector-org">QUIRINO MEMORIAL MEDICAL CENTER</div>
                <div class="form-selector-sub">Performance Management System</div>
            </div>
        </div>

        @if ($employeeFullName)
        <div class="form-selector-employee-badge">
            <span class="form-selector-emp-icon">👤</span>
            <span class="form-selector-emp-name">{{ $employeeFullName }}</span>
            @if ($employeePosition)
                <span class="form-selector-emp-sep">·</span>
                <span class="form-selector-emp-pos">{{ $employeePosition }}</span>
            @endif
            @if ($employeeDivision)
                <span class="form-selector-emp-sep">·</span>
                <span class="form-selector-emp-div">{{ $employeeDivision }}</span>
            @endif
        </div>
        @endif

        <div class="form-selector-prompt">Select the performance form you want to work on:</div>

        <div class="form-selector-cards">

            {{-- DPCR Card --}}
            <div class="form-card" id="card-dpcr" onclick="selectForm('dpcr')">
                <div class="form-card-icon"></div>
                <div class="form-card-acronym">DPCR</div>
                <div class="form-card-name">Division Performance<br>Commitment and Review</div>
                <div class="form-card-desc">
                    Plan and evaluate division-level performance targets and accomplishments.
                </div>
                <div class="form-card-badge form-card-badge--dpcr">DOH – SPMS Form 2</div>
                <button class="form-card-btn form-card-btn--dpcr" type="button">
                    Open DPCR →
                </button>
            </div>

            {{-- SPCR Card --}}
            <div class="form-card" id="card-spcr" onclick="selectForm('spcr')">
                <div class="form-card-icon"></div>
                <div class="form-card-acronym">SPCR</div>
                <div class="form-card-name">Section Performance<br>Commitment and Review</div>
                <div class="form-card-desc">
                    Set and assess section-level performance commitments and targets.
                </div>
                <div class="form-card-badge form-card-badge--spcr">DOH – SPMS Form 3</div>
                <button class="form-card-btn form-card-btn--spcr" type="button">
                    Open SPCR →
                </button>
            </div>

            {{-- IPCR Card --}}
            <div class="form-card" id="card-ipcr" onclick="selectForm('ipcr')">
                <div class="form-card-icon"></div>
                <div class="form-card-acronym">IPCR</div>
                <div class="form-card-name">Individual Performance<br>Commitment and Review</div>
                <div class="form-card-desc">
                    Record and rate individual employee performance indicators and outcomes.
                </div>
                <div class="form-card-badge form-card-badge--ipcr">DOH – SPMS Form 4</div>
                <button class="form-card-btn form-card-btn--ipcr" type="button">
                    Open IPCR →
                </button>
            </div>

        </div>{{-- /.form-selector-cards --}}

        <div class="form-selector-footer">
            <button class="form-selector-records-btn" type="button"
                    onclick="selectForm('records')">
                📁 View All Records
            </button>
            <button class="form-selector-records-btn" type="button"
                    onclick="selectForm('employees')"
                    style="margin-left:10px;">
                👥 Employee Directory
            </button>
        </div>

    </div>{{-- /#form-selector-screen --}}

    {{-- ══════════════════════════════════════════════════════════
         MAIN APP — hidden until form is selected
    ══════════════════════════════════════════════════════════ --}}
    <div id="main-app" style="display:none;">

        {{-- Tab Navigation --}}
        <div class="tab-nav" id="main-tab-nav">
            {{-- Tabs are shown/hidden dynamically by selectForm() --}}
            <button class="tab-btn tab-btn--dpcr"      id="tab-dpcr"      onclick="switchTab('dpcr', this)"      style="display:none;">DPCR</button>
            <button class="tab-btn tab-btn--spcr"      id="tab-spcr"      onclick="switchTab('spcr', this)"      style="display:none;">SPCR</button>
            <button class="tab-btn tab-btn--ipcr"      id="tab-ipcr"      onclick="switchTab('ipcr', this)"      style="display:none;">IPCR</button>
            <button class="tab-btn"                    id="tab-records"   onclick="switchTab('records', this)"    style="display:none;">Records</button>
            <button class="tab-btn"                    id="tab-employees" onclick="switchTab('employees', this)"  style="display:none;">Employees</button>
            <button class="tab-btn tab-btn--back"      id="tab-back"      onclick="returnToSelector()"            style="display:none;">← Change Form</button>
        </div>

        {{-- Rating Matrix Panel — ONE instance, moved by JS on tab switch --}}
        @include('partials.rating_matrix')

        {{-- DPCR, SPCR, IPCR pages --}}
        @include('partials.dpcr', ['sections' => $sections])
        @include('partials.spcr')
        @include('partials.ipcr')

        {{-- Records --}}
        @include('partials.records')

        {{-- Employee Directory --}}
        @include('partials.employees')

    </div>{{-- /#main-app --}}

    {{-- Shared Modals (always present in DOM) --}}
    @include('partials.modals')

@endsection

@push('scripts')
<script>
    // ── App config ────────────────────────────────────────────────────
    window.CSRF_TOKEN       = @json(csrf_token());
    window.SECTIONS         = @json($sections);
    window.EMPID            = @json($empid);

    // ── Database pre-loads ────────────────────────────────────────────
    window.DB_MATRICES      = @json($matricesJson);
    window.DB_LATEST_MATRIX = @json($latestMatrixJson);
    window.DB_LATEST_DPCR   = @json($latestDpcrJson);
    window.DB_LATEST_IPCR   = @json($latestIpcrJson);
    window.DB_LATEST_SPCR   = @json($latestSpcrJson ?? null);

    // ── Employee auto-fill from legacy DB ─────────────────────────────
    window.EMPLOYEE_FULLNAME = @json($employeeFullName ?? null);
    window.EMPLOYEE_ROLE     = @json($employeeDivision ?? null);
    window.EMPLOYEE_POSITION = @json($employeePosition ?? null);
    window.EMPLOYEE_SECTION  = @json($employeeSection  ?? null);

    // ── RBAC Form Selector ───────────────────────────────────────────
    /**
     * Which form the user selected from the landing screen.
     * Valid values: 'dpcr' | 'spcr' | 'ipcr' | 'records' | 'employees'
     */
    window.SELECTED_FORM = null;

    /**
     * Tabs that are allowed to show alongside the primary selected form.
     * Records and Employees are always available as supplementary tabs.
     */
    var FORM_SUPPLEMENTARY_TABS = ['records', 'employees'];

    /**
     * Called when user clicks a form card on the selector screen.
     * Shows the main app shell, activates only the relevant tab.
     */
    function selectForm(formKey) {
        window.SELECTED_FORM = formKey;

        // Hide selector, show main app
        document.getElementById('form-selector-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';

        // Determine which tabs to expose
        var tabsToShow = [];
        if (formKey === 'dpcr' || formKey === 'spcr' || formKey === 'ipcr') {
            tabsToShow = [formKey, 'records', 'employees'];
        } else {
            // records or employees — show both utility tabs
            tabsToShow = ['records', 'employees'];
        }

        // Show/hide tab buttons
        ['dpcr', 'spcr', 'ipcr', 'records', 'employees'].forEach(function(key) {
            var btn = document.getElementById('tab-' + key);
            if (btn) btn.style.display = tabsToShow.indexOf(key) !== -1 ? '' : 'none';
        });

        // Always show the "← Change Form" back button
        var backBtn = document.getElementById('tab-back');
        if (backBtn) backBtn.style.display = '';

        // Activate the chosen tab
        switchTab(formKey, document.getElementById('tab-' + formKey));

        // Persist selection in sessionStorage so a page refresh
        // (e.g. after a Laravel redirect) keeps the user on their form.
        try { sessionStorage.setItem('qmmc_selected_form', formKey); } catch(e) {}
    }

    /**
     * Return to the landing selector screen.
     */
    function returnToSelector() {
        window.SELECTED_FORM = null;

        // Deactivate all pages/tabs
        document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });

        // Hide all tab buttons
        ['dpcr', 'spcr', 'ipcr', 'records', 'employees', 'back'].forEach(function(key) {
            var btn = document.getElementById('tab-' + key);
            if (btn) btn.style.display = 'none';
        });

        // Show selector, hide main app
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('form-selector-screen').style.display = '';

        try { sessionStorage.removeItem('qmmc_selected_form'); } catch(e) {}
    }

    // ── Restore selection from sessionStorage on reload ───────────────
    document.addEventListener('DOMContentLoaded', function() {
        try {
            var saved = sessionStorage.getItem('qmmc_selected_form');
            if (saved && ['dpcr','spcr','ipcr','records','employees'].indexOf(saved) !== -1) {
                // Small delay so all JS (dpcr.js, spcr.js, ipcr.js) has initialised
                setTimeout(function() { selectForm(saved); }, 120);
            }
        } catch(e) {}
    });
</script>
@endpush