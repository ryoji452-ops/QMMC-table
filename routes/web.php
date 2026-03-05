<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SPCRController;
use App\Http\Controllers\SPCRRatingMatrixController;

Route::get('/', [SPCRController::class, 'index'])->name('sprc.index');
Route::post('/sprc', [SPCRController::class, 'store'])->name('sprc.store');
Route::get('/spcr/matrix',            [SPCRRatingMatrixController::class, 'index'])->name('spcr.matrix.index');
Route::post('/spcr/matrix',           [SPCRRatingMatrixController::class, 'store'])->name('spcr.matrix.store');
Route::get('/spcr/matrix/{matrix}',   [SPCRRatingMatrixController::class, 'show'])->name('spcr.matrix.show');
Route::delete('/spcr/matrix/{matrix}',[SPCRRatingMatrixController::class, 'destroy'])->name('spcr.matrix.destroy');