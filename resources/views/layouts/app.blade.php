<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'QMMC – SPCR Matrix & DPCR')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/qmmc.css') }}">
    @stack('styles')
</head>
<body>

    @yield('content')

    {{-- Bootstrap data FIRST, then the app script --}}
    @stack('scripts')
    <script src="{{ asset('js/qmmc.js') }}"></script>

</body>
</html>