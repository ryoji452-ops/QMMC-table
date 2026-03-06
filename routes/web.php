<?php

// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QmmcController;
use App\Http\Controllers\SPCRRatingMatrixController;
use App\Http\Controllers\SPCRController;

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
    Route::get('/',  [SPCRController::class, 'index'])->name('index');
    Route::post('/', [SPCRController::class, 'store'])->name('store');
});