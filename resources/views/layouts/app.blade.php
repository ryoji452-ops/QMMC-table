<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'QMMC – SPCR Matrix & DPCR')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/shared.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dpcr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/spcr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/ipcr.css') }}">
    @stack('styles')
</head>
<body>

    @yield('content')

    {{-- Bootstrap data FIRST, then scripts in dependency order --}}
    @stack('scripts')
    <script src="{{ asset('js/shared.js') }}"></script>
    <script src="{{ asset('js/dpcr.js') }}"></script>
    <script src="{{ asset('js/spcr.js') }}"></script>
    <script src="{{ asset('js/ipcr.js') }}"></script>

</body>
</html>