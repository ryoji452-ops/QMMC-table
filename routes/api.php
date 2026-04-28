<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LegacyUserController;
use App\Http\Controllers\IPCRController;
use App\Http\Controllers\SPCRController;
use App\Http\Controllers\SPCRFormController;
use App\Http\Controllers\SPCRRatingMatrixController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Loaded under the `api` middleware group, but with an empty API prefix so
| we can keep supporting both `/api/...` and `/ipcr/api/...` URLs.
|--------------------------------------------------------------------------
*/
$appPath = rtrim(parse_url(config('app.url'), PHP_URL_PATH) ?? '', '/');
$subdir = ltrim($appPath, '/');

$registerRoutes = function () {
    /*
    |--------------------------------------------------------------------------
    | Session Sync — called by JS on page load to ensure session('current_empid')
    | is set correctly from window.EMPID (survives page refreshes without empid
    | in the URL).
    |
    | The empid in the POST body (window.EMPID, injected from the URL /{empid})
    | is the authoritative source.  It always overwrites whatever the session
    | currently holds so that a stale "first-user" session is immediately
    | corrected on the very first API call after a page load.
    |--------------------------------------------------------------------------
    */
    Route::post('api/sync-session', function (\Illuminate\Http\Request $request) {
        // Accept empid from the POST body OR from the X-Employee-Id header.
        $empid = $request->input('empid') ?? $request->header('X-Employee-Id');

        if ($empid && is_numeric($empid)) {
            $empid = (int) $empid;
            // Always overwrite — this call is the authoritative "this is who I am"
            // signal from the JS side and must correct any wrong session value.
            session(['current_empid' => $empid]);
            return response()->json(['ok' => true, 'empid' => $empid]);
        }
        return response()->json(['ok' => false, 'message' => 'Invalid empid'], 422);
    });

    // GET variant — lets JS verify what the server thinks the current empid is.
    Route::get('api/sync-session', function () {
        return response()->json([
            'ok'    => true,
            'empid' => session('current_empid'),
        ]);
    });

    Route::prefix('api/legacy-users')->group(function () {
        Route::get('/divisions', [LegacyUserController::class, 'divisions']);
        Route::get('/',          [LegacyUserController::class, 'index']);
        Route::get('/{id}',      [LegacyUserController::class, 'show']);
    });

    Route::prefix('api/spcr-matrix')->group(function () {
        Route::get('/',            [SPCRRatingMatrixController::class, 'index']);
        Route::post('/',           [SPCRRatingMatrixController::class, 'store']);
        Route::get('/{matrix}',    [SPCRRatingMatrixController::class, 'show']);
        Route::delete('/{matrix}', [SPCRRatingMatrixController::class, 'destroy']);
    });

    Route::prefix('api/dpcr')->group(function () {
        Route::get('/',          [SPCRController::class, 'index']);
        Route::post('/',         [SPCRController::class, 'store']);
        Route::get('/{form}',    [SPCRController::class, 'show']);
        Route::put('/{form}',    [SPCRController::class, 'update']);
        Route::delete('/{form}', [SPCRController::class, 'destroy']);
    });

    Route::prefix('api/spcr')->group(function () {
        Route::get('/',          [SPCRFormController::class, 'index']);
        Route::post('/',         [SPCRFormController::class, 'store']);
        Route::get('/{form}',    [SPCRFormController::class, 'show']);
        Route::put('/{form}',    [SPCRFormController::class, 'update']);
        Route::delete('/{form}', [SPCRFormController::class, 'destroy']);
    });

    Route::prefix('api/ipcr')->group(function () {
        Route::get('/',          [IPCRController::class, 'index']);
        Route::post('/',         [IPCRController::class, 'store']);
        Route::get('/{form}',    [IPCRController::class, 'show']);
        Route::put('/{form}',    [IPCRController::class, 'update']);
        Route::delete('/{form}', [IPCRController::class, 'destroy']);
    });
};

$registerRoutes();

if ($subdir !== '') {
    Route::prefix($subdir)->group($registerRoutes);
}