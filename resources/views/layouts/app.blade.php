<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'QMMC – DPCR | SPCR | IPCR')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/shared.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dpcr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/spcr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/ipcr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/records.css') }}">
    <link rel="stylesheet" href="{{ asset('css/rating_matrix.css') }}">
    {{-- Print target / actual modes --}}
    <link rel="stylesheet" href="{{ asset('css/print_modes.css') }}">
    @stack('styles')
</head>
<body>

    @yield('content')

    @stack('scripts')
    <script src="{{ asset('js/shared.js') }}"></script>
    <script src="{{ asset('js/dpcr.js') }}"></script>
    <script src="{{ asset('js/spcr.js') }}"></script>
    <script src="{{ asset('js/ipcr.js') }}"></script>
    <script src="{{ asset('js/records.js') }}"></script>
    {{-- Rating Matrix loads after row factories --}}
    <script src="{{ asset('js/rating_matrix.js') }}"></script>
    {{-- Print mode controller — must load LAST (uses all row factories) --}}
    <script src="{{ asset('js/print_modes.js') }}"></script>

</body>
</html>