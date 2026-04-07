{{-- resources/views/qmmc/index.blade.php --}}
@extends('layouts.app')

@section('title', 'QMMC – DPCR | SPCR | IPCR')

@section('content')

    {{-- Tab Navigation --}}
    <div class="tab-nav">
        <button class="tab-btn active" onclick="switchTab('dpcr', this)">DPCR</button>
        <button class="tab-btn"        onclick="switchTab('spcr', this)">SPCR</button>
        <button class="tab-btn"        onclick="switchTab('ipcr', this)">IPCR</button>
        <button class="tab-btn"        onclick="switchTab('records', this)">Records</button>
        <button class="tab-btn"        onclick="switchTab('employees', this)">👥 Employees</button>
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

    {{-- Shared Modals --}}
    @include('partials.modals')

@endsection

@push('scripts')
<script>
    // ── App config ────────────────────────────────────────────────────
    window.CSRF_TOKEN       = @json(csrf_token());
    window.SECTIONS         = @json($sections);

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
</script>
@endpush