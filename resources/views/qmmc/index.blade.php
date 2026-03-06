{{-- resources/views/qmmc/index.blade.php --}}
@extends('layouts.app')

@section('title', 'QMMC – SPCR Matrix & DPCR')

@section('content')

    {{-- Tab Navigation --}}
    <div class="tab-nav">
        <button class="tab-btn active" onclick="switchTab('spcr')">📋 SPCR Rating Matrix</button>
        <button class="tab-btn"        onclick="switchTab('dpcr')">📄 DPCR</button>
    </div>

    {{-- SPCR Page --}}
    @include('partials.spcr')

    {{-- DPCR Page --}}
    @include('partials.dpcr', ['sections' => $sections])

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
</script>
@endpush