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
