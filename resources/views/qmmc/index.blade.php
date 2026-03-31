{{-- resources/views/qmmc/index.blade.php --}}
@extends('layouts.app')

@section('title', 'QMMC – DPCR | SPCR | IPCR')

@section('content')

    {{-- Tab Navigation — DPCR is the root entry point; Rating Matrix is embedded per-page --}}
    <div class="tab-nav">
        <button class="tab-btn active" onclick="switchTab('dpcr', this)">DPCR</button>
        <button class="tab-btn"        onclick="switchTab('spcr', this)">SPCR</button>
        <button class="tab-btn"        onclick="switchTab('ipcr', this)">IPCR</button>
        <button class="tab-btn"        onclick="switchTab('records', this)">Records</button>
    </div>

    {{-- ═══════════════════════════════════════════════════════════════
         Rating Matrix Panel — ONE instance in the DOM.
         JS moves #rm-panel into the active tab's .rm-embed-slot
         on every tab switch. All ID bindings remain intact.
    ═══════════════════════════════════════════════════════════════ --}}
    @include('partials.rating_matrix')

    {{-- DPCR, SPCR, IPCR — each contains a .rm-embed-slot at the bottom --}}
    @include('partials.dpcr', ['sections' => $sections])
    @include('partials.spcr')
    @include('partials.ipcr')

    {{-- Records --}}
    @include('partials.records')

    {{-- Shared Modals --}}
    @include('partials.modals')

@endsection

@push('scripts')
<script>
    // ── App config ───────────────────────────────────────────────────
    window.CSRF_TOKEN       = @json(csrf_token());
    window.SECTIONS         = @json($sections);

    // ── Database pre-loads ──────────────────────────────────────────
    window.DB_MATRICES      = @json($matricesJson);
    window.DB_LATEST_MATRIX = @json($latestMatrixJson);
    window.DB_LATEST_DPCR   = @json($latestDpcrJson);
    window.DB_LATEST_IPCR   = @json($latestIpcrJson);
    window.DB_LATEST_SPCR   = @json($latestSpcrJson ?? null);

    // ── Employee auto-fill (from legacy DB via LegacyUser model) ────
    //
    // shared.js _prefillEmployeeInfo() reads:
    //   window.EMPLOYEE_FULLNAME  → fills "Name of Employee" inputs on all tabs
    //   window.EMPLOYEE_ROLE      → fills "Position / Division" inputs on all tabs
    //   window.EMPLOYEE_SECTION   → available for future use (not yet consumed by JS)
    //
    // The controller builds EMPLOYEE_FULLNAME from l_name + f_name + m_name
    // ("LASTNAME, Firstname M.") and EMPLOYEE_ROLE from the division column.
    // ────────────────────────────────────────────────────────────────
    window.EMPLOYEE_FULLNAME = @json($employeeFullName ?? null);
    window.EMPLOYEE_ROLE     = @json($employeeDivision ?? null);
    window.EMPLOYEE_SECTION  = @json($employeeSection  ?? null);
</script>
@endpush