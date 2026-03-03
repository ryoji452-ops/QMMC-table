<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SPCRController;

Route::get('/', [SPCRController::class, 'index'])->name('sprc.index');
Route::post('/sprc', [SPCRController::class, 'store'])->name('sprc.store');