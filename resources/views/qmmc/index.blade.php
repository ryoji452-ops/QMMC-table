{{-- ══════════════════════════════════════════════════════
     resources/views/qmmc/index.blade.php  — UPDATED
     Added IPCR tab alongside SPCR and DPCR
══════════════════════════════════════════════════════ --}}
@extends('layouts.app')

@section('title', 'QMMC – SPCR Matrix & DPCR & IPCR')

@section('content')

    {{-- Tab Navigation --}}
    <div class="tab-nav">
        <button class="tab-btn active" onclick="switchTab('spcr')">📋 SPCR Rating Matrix</button>
        <button class="tab-btn"        onclick="switchTab('dpcr')">📄 DPCR</button>
        <button class="tab-btn"        onclick="switchTab('ipcr')">👤 IPCR</button>
    </div>

    {{-- SPCR Page --}}
    @include('partials.spcr')

    {{-- DPCR Page --}}
    @include('partials.dpcr', ['sections' => $sections])

    {{-- IPCR Page --}}
    @include('partials.ipcr')

    {{-- Shared Modals --}}
    @include('partials.modals')

@endsection

@push('scripts')
<script>
    window.CSRF_TOKEN       = @json(csrf_token());
    window.SECTIONS         = @json($sections);
    window.DB_MATRICES      = @json($matricesJson);
    window.DB_LATEST_MATRIX = @json($latestMatrixJson);
    window.DB_LATEST_DPCR   = @json($latestDpcrJson);
    window.DB_LATEST_IPCR   = @json($latestIpcrJson);   {{-- NEW --}}
</script>
@endpush
