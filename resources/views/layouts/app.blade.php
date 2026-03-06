<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'QMMC – SPCR Matrix & DPCR')</title>

    {{-- Application Stylesheet --}}
    <link rel="stylesheet" href="{{ asset('css/qmmc.css') }}">

    @stack('styles')
</head>
<body>

    @yield('content')

    {{-- Application Script --}}
    <script src="{{ asset('js/qmmc.js') }}"></script>

    @stack('scripts')
</body>
</html>