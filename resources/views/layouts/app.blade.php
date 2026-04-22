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
    <link rel="stylesheet" href="{{ asset('css/print_modes.css') }}">

    @stack('styles')
</head>
<body>

    @yield('content')

    <script>
        window.APP_BASE = @json(rtrim(request()->getBaseUrl(), '/'));
    </script>

    <script>
        (function () {
            function patchChosen(lib) {
                if (lib && lib.fn && !lib.fn.chosen) {
                    lib.fn.chosen = function () { return this; };
                }
            }

            function isApiUrl(url) {
                var base = (typeof window.APP_BASE === 'string') ? window.APP_BASE : '';
                var paths = ['/api/'];
                if (base) paths.unshift(base.replace(/\/$/, '') + '/api/');
                for (var i = 0; i < paths.length; i++) {
                    if (url.indexOf(paths[i]) === 0 || url.indexOf(window.location.origin + paths[i]) === 0) {
                        return true;
                    }
                }
                return false;
            }

            function patchFetch() {
                if (!window.fetch || window.fetch._qmmcPatched) return;
                var origFetch = window.fetch.bind(window);
                var csrfMeta = document.querySelector('meta[name="csrf-token"]');
                var csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

                window.fetch = function (input, init) {
                    try {
                        var url = (typeof input === 'string') ? input : ((input && input.url) || '');
                        if (isApiUrl(url)) {
                            init = init || {};
                            init.headers = new Headers(init.headers || (input && input.headers) || {});
                            if (!init.headers.has('X-CSRF-TOKEN') && csrfToken) {
                                init.headers.set('X-CSRF-TOKEN', csrfToken);
                            }
                        }
                    } catch (e) {}
                    return origFetch(input, init);
                };
                window.fetch._qmmcPatched = true;
            }

            function patchXhr() {
                if (!window.XMLHttpRequest || window.XMLHttpRequest.prototype._qmmcPatched) return;
                var origOpen = XMLHttpRequest.prototype.open;
                var origSend = XMLHttpRequest.prototype.send;
                var csrfMeta = document.querySelector('meta[name="csrf-token"]');
                var csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

                XMLHttpRequest.prototype.open = function (method, url) {
                    this._qmmcMethod = method;
                    this._qmmcUrl = url;
                    return origOpen.apply(this, arguments);
                };

                XMLHttpRequest.prototype.send = function (body) {
                    try {
                        var url = String(this._qmmcUrl || '');
                        if (isApiUrl(url) && csrfToken) {
                            this.setRequestHeader('X-CSRF-TOKEN', csrfToken);
                        }
                    } catch (e) {}
                    return origSend.apply(this, arguments);
                };

                XMLHttpRequest.prototype._qmmcPatched = true;
            }

            if (window.jQuery) patchChosen(window.jQuery);
            if (window.$ && window.$ !== window.jQuery) patchChosen(window.$);

            try {
                Object.defineProperty(window, 'jQuery', {
                    configurable: true,
                    get: function () { return this._qmmcJQuery; },
                    set: function (lib) {
                        this._qmmcJQuery = lib;
                        patchChosen(lib);
                    }
                });
                Object.defineProperty(window, '$', {
                    configurable: true,
                    get: function () { return this._qmmcDollar; },
                    set: function (lib) {
                        this._qmmcDollar = lib;
                        patchChosen(lib);
                    }
                });
            } catch (e) {
                // If the properties are not configurable, fall back to direct patching.
            }

            patchFetch();
            patchXhr();
        })();
    </script>

    @stack('scripts')

    <script src="{{ asset('js/shared.js') }}"></script>
    <script src="{{ asset('js/dpcr.js') }}"></script>
    <script src="{{ asset('js/spcr.js') }}"></script>
    <script src="{{ asset('js/ipcr.js') }}"></script>
    <script src="{{ asset('js/records.js') }}"></script>
    <script src="{{ asset('js/rating_matrix.js') }}"></script>
    <script src="{{ asset('js/employees.js') }}"></script>
    <script src="{{ asset('js/print_modes.js') }}"></script>

</body>
</html>
