<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QmmcController;
use App\Http\Controllers\SPCRRatingMatrixController;
use App\Http\Controllers\SPCRController;
use App\Http\Controllers\SPCRFormController;
use App\Http\Controllers\IPCRController;
use App\Http\Controllers\LegacyUserController;

/*
|--------------------------------------------------------------------------
| ALL API routes must be declared BEFORE the /{empid} catch-all.
| Otherwise Laravel matches /api/... against /{empid} and returns 404.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Legacy Users API  (read-only — live from 190.190.0.55 / bvflh_users)
|--------------------------------------------------------------------------
*/
Route::prefix('api/legacy-users')->name('legacy.users.')->group(function () {
    Route::get('/divisions', [LegacyUserController::class, 'divisions'])->name('divisions');
    Route::get('/',          [LegacyUserController::class, 'index'])    ->name('index');
    Route::get('/{id}',      [LegacyUserController::class, 'show'])     ->name('show');
});

/*
|--------------------------------------------------------------------------
| SPCR Rating Matrix API
|--------------------------------------------------------------------------
*/
Route::prefix('api/spcr-matrix')->name('spcr.matrix.')->group(function () {
    Route::get('/',            [SPCRRatingMatrixController::class, 'index'])   ->name('index');
    Route::post('/',           [SPCRRatingMatrixController::class, 'store'])   ->name('store');
    Route::get('/{matrix}',    [SPCRRatingMatrixController::class, 'show'])    ->name('show');
    Route::delete('/{matrix}', [SPCRRatingMatrixController::class, 'destroy']) ->name('destroy');
});

/*
|--------------------------------------------------------------------------
| DPCR API
|--------------------------------------------------------------------------
*/
Route::prefix('api/dpcr')->name('dpcr.')->group(function () {
    Route::get('/',          [SPCRController::class, 'index'])  ->name('index');
    Route::post('/',         [SPCRController::class, 'store'])  ->name('store');
    Route::get('/{form}',    [SPCRController::class, 'show'])   ->name('show');
    Route::put('/{form}',    [SPCRController::class, 'update']) ->name('update');
    Route::delete('/{form}', [SPCRController::class, 'destroy'])->name('destroy');
});

/*
|--------------------------------------------------------------------------
| SPCR Form API
|--------------------------------------------------------------------------
*/
Route::prefix('api/spcr')->name('spcr.form.')->group(function () {
    Route::get('/',          [SPCRFormController::class, 'index'])  ->name('index');
    Route::post('/',         [SPCRFormController::class, 'store'])  ->name('store');
    Route::get('/{form}',    [SPCRFormController::class, 'show'])   ->name('show');
    Route::put('/{form}',    [SPCRFormController::class, 'update']) ->name('update');
    Route::delete('/{form}', [SPCRFormController::class, 'destroy'])->name('destroy');
});

/*
|--------------------------------------------------------------------------
| IPCR Form API
|--------------------------------------------------------------------------
*/
Route::prefix('api/ipcr')->name('ipcr.form.')->group(function () {
    Route::get('/',          [IPCRController::class, 'index'])  ->name('index');
    Route::post('/',         [IPCRController::class, 'store'])  ->name('store');
    Route::get('/{form}',    [IPCRController::class, 'show'])   ->name('show');
    Route::put('/{form}',    [IPCRController::class, 'update']) ->name('update');
    Route::delete('/{form}', [IPCRController::class, 'destroy'])->name('destroy');
});

/*
|--------------------------------------------------------------------------
| Main page — QMMC PCR Application
| MUST be declared LAST — it is a catch-all for numeric segments.
|--------------------------------------------------------------------------
*/
Route::get('/{empid}', [QmmcController::class, 'index'])
    ->name('qmmc.index')
    ->where('empid', '[0-9]+');

    