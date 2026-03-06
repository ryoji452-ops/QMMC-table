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
    @include('partials.dpcr')

    {{-- Shared Modals --}}
    @include('partials.modals')

@endsection