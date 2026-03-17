<?php

// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QmmcController;
use App\Http\Controllers\SPCRRatingMatrixController;
use App\Http\Controllers\SPCRController;
use App\Http\Controllers\SPCRFormController;
use App\Http\Controllers\IPCRController;

/*
 Main page — loads both SPCR Matrix + DPCR tabs
*/
Route::get('/', [QmmcController::class, 'index'])->name('qmmc.index');

/*
 SPCR Rating Matrix API routes (called by JS fetch)
*/
Route::prefix('api/spcr-matrix')->name('spcr.matrix.')->group(function () {
    Route::get('/',            [SPCRRatingMatrixController::class, 'index'])   ->name('index');
    Route::post('/',           [SPCRRatingMatrixController::class, 'store'])   ->name('store');
    Route::get('/{matrix}',    [SPCRRatingMatrixController::class, 'show'])    ->name('show');
    Route::delete('/{matrix}', [SPCRRatingMatrixController::class, 'destroy']) ->name('destroy');
});

/*
 DPCR (sprc_forms) API routes (called by JS fetch)
*/
Route::prefix('api/dpcr')->name('dpcr.')->group(function () {
    Route::get('/',          [SPCRController::class, 'index'])  ->name('index');
    Route::post('/',         [SPCRController::class, 'store'])  ->name('store');
    Route::get('/{form}',    [SPCRController::class, 'show'])   ->name('show');
    Route::put('/{form}',    [SPCRController::class, 'update']) ->name('update');
    Route::delete('/{form}', [SPCRController::class, 'destroy'])->name('destroy');
});

/*
 SPCR Form API routes (called by JS fetch from the SPCR tab)
*/
Route::prefix('api/spcr')->name('spcr.form.')->group(function () {
    Route::get('/',          [SPCRFormController::class, 'index'])  ->name('index');
    Route::post('/',         [SPCRFormController::class, 'store'])  ->name('store');
    Route::get('/{form}',    [SPCRFormController::class, 'show'])   ->name('show');
    Route::delete('/{form}', [SPCRFormController::class, 'destroy'])->name('destroy');
});

/*
 IPCR Form API routes (called by JS fetch from the IPCR tab)
*/
Route::prefix('api/ipcr')->name('ipcr.form.')->group(function () {
    Route::get('/',          [IPCRController::class, 'index'])  ->name('index');
    Route::post('/',         [IPCRController::class, 'store'])  ->name('store');
    Route::get('/{form}',    [IPCRController::class, 'show'])   ->name('show');
    Route::delete('/{form}', [IPCRController::class, 'destroy'])->name('destroy');
});