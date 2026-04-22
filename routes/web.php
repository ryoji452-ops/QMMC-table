<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QmmcController;
use App\Http\Controllers\LegacyUserController;

/*
|--------------------------------------------------------------------------
| Helper: register all app routes under an optional subdirectory prefix.
|
| APP_URL = "http://190.190.0.64/ipcr"  → subdir = "ipcr"
| APP_URL = "http://host"               → subdir = ""  (no prefix)
|
| This makes every API route respond correctly whether the web server
| strips the subdirectory prefix before hitting Laravel or not.
|--------------------------------------------------------------------------
*/
$appPath = rtrim(parse_url(config('app.url'), PHP_URL_PATH) ?? '', '/');
// $appPath is e.g. "/ipcr" or ""
// Strip the leading slash for Route::prefix (it adds its own)
$subdir = ltrim($appPath, '/'); // e.g. "ipcr" or ""

/*
|--------------------------------------------------------------------------
| Route factory — registers all routes, optionally under $prefix.
| Called twice: once bare (for servers that strip the subdir) and
| once with the prefix (for servers that don't).
|--------------------------------------------------------------------------
*/
$registerRoutes = function () use (&$registerRoutes) {

    /*
    |--------------------------------------------------------------------------
    | 1. Landing Page
    |--------------------------------------------------------------------------
    */
    Route::get('/', [QmmcController::class, 'index'])->name('home');

    /*
    |--------------------------------------------------------------------------
    | 2. Catch-All Route (Employee ID)
    |--------------------------------------------------------------------------
    */
    Route::match(['get', 'post'], '/{empid}', [QmmcController::class, 'index'])
        ->where('empid', '[0-9]+');
};

/*
|--------------------------------------------------------------------------
| Register routes at the root level (for servers that strip the subdir,
| e.g. Apache mod_rewrite / Nginx with correct config).
|--------------------------------------------------------------------------
*/
$registerRoutes();

/*
|--------------------------------------------------------------------------
| ALSO register routes under the subdirectory prefix (for servers that
| do NOT strip the prefix, passing the full path to Laravel).
| This is the common case when using Apache with a simple Alias directive
| or a basic Nginx location block without path rewriting.
|--------------------------------------------------------------------------
*/
if ($subdir !== '') {
    Route::prefix($subdir)->group($registerRoutes);
}
