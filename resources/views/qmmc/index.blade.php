{{-- resources/views/qmmc/index.blade.php --}}
@extends('layouts.app')

@section('title', 'QMMC – Rating Matrix | DPCR | SPCR | IPCR')

@section('content')

    {{-- Tab Navigation — Rating Matrix is first / root --}}
    <div class="tab-nav">
        <button class="tab-btn active" onclick="switchTab('rating-matrix', this)"> Rating Matrix</button>
        <button class="tab-btn"        onclick="switchTab('dpcr', this)"> DPCR</button>
        <button class="tab-btn"        onclick="switchTab('spcr', this)"> SPCR</button>
        <button class="tab-btn"        onclick="switchTab('ipcr', this)"> IPCR</button>
        <button class="tab-btn"        onclick="switchTab('records', this)"> Records</button>
    </div>

    {{-- Rating Matrix (active first — it is the root source) --}}
    @include('partials.rating_matrix')

    {{-- DPCR, SPCR, IPCR receive pushed rows from Rating Matrix --}}
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
    window.CSRF_TOKEN       = @json(csrf_token());
    window.SECTIONS         = @json($sections);
    window.DB_MATRICES      = @json($matricesJson);
    window.DB_LATEST_MATRIX = @json($latestMatrixJson);
    window.DB_LATEST_DPCR   = @json($latestDpcrJson);
    window.DB_LATEST_IPCR   = @json($latestIpcrJson);
    window.DB_LATEST_SPCR   = @json($latestSpcrJson ?? null);
</script>
@endpush