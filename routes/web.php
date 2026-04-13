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
| 1. Landing Page
|--------------------------------------------------------------------------
| Instead of the default 'welcome' view, we now point to your Controller.
| Note: If your index method requires an ID, you may need to adjust the 
| controller logic to handle a null ID or redirect to a login/search page.
*/
Route::get('/', [QmmcController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| 2. Legacy Users API (read-only)
|--------------------------------------------------------------------------
*/
Route::prefix('api/legacy-users')->name('legacy.users.')->group(function () {
    Route::get('/divisions', [LegacyUserController::class, 'divisions'])->name('divisions');
    Route::get('/',          [LegacyUserController::class, 'index'])    ->name('index');
    Route::get('/{id}',      [LegacyUserController::class, 'show'])     ->name('show');
});

/*
|--------------------------------------------------------------------------
| 3. SPCR Rating Matrix API
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
| 4. DPCR API
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
| 5. SPCR Form API
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
| 6. IPCR Form API
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
| 7. Catch-All Route (Employee ID)
|--------------------------------------------------------------------------
| This matches numeric IDs (e.g., http://190.190.0.64:8000/12345).
*/
Route::match(['get', 'post'], '/{empid}', [QmmcController::class, 'index'])
    ->name('qmmc.index')
    ->where('empid', '[0-9]+');