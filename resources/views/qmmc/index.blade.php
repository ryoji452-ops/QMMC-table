{{-- resources/views/qmmc/index.blade.php --}}
@extends('layouts.app')
@section('title', 'QMMC – DPCR | SPCR | IPCR')

@section('content')

    {{-- Tab Navigation — DPCR first --}}
    <div class="tab-nav">
        <button class="tab-btn active" onclick="switchTab('dpcr', this)">📄 DPCR</button>
        <button class="tab-btn"        onclick="switchTab('spcr', this)">📋 SPCR</button>
        <button class="tab-btn"        onclick="switchTab('ipcr', this)">👤 IPCR</button>
    </div>

    {{-- DPCR Page (active first) --}}
    @include('partials.dpcr', ['sections' => $sections])

    {{-- SPCR Page --}}
    @include('partials.spcr')

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
    window.DB_LATEST_IPCR   = @json($latestIpcrJson);
</script>
@endpush