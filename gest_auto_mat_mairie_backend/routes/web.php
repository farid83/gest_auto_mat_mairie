<?php
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Models\User;


Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show'])->name('sanctum.csrf-cookie');

Route::get('/token-test', function () {
    $user = User::first();
    return $user->createToken('TestToken')->plainTextToken;
});

Route::get('/sanctum/csrf-cookie', function () {
    return response()->noContent();
})->middleware('web');

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show'])
    ->middleware('web')
    ->name('sanctum.csrf-cookie');



