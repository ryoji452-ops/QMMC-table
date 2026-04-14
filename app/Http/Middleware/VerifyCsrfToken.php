<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * All /api/* routes are called via fetch() from the same-origin
     * browser page.  Excluding them here is the standard Laravel
     * pattern for same-site AJAX endpoints defined in web.php.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*',
    ];
}