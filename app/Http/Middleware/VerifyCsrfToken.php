<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * URIs excluded from CSRF verification.
     *
     * Using a wildcard pattern here handles ALL deployment paths:
     *   /api/dpcr
     *   /qmmc_intranet/ipcr/api/dpcr
     *   /anything/api/something
     *
     * Laravel matches these against the full request URI path via Str::is(),
     * which supports leading wildcards.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*',
        '*/api/*',
    ];
}