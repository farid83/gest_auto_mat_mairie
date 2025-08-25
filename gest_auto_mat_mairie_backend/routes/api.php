<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MaterielController;
use App\Http\Controllers\Api\DirectionController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\DemandeMaterielController;
use App\Http\Controllers\Api\LivraisonController;
use App\Http\Controllers\Api\MouvementStockController;
use App\Http\Controllers\Api\PingController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Service;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::get('/ping', [PingController::class, 'ping']);

// Authentification
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    // Création du token Sanctum
    $token = $user->createToken('API Token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user'  => $user
    ]);
});

// Route::post('/register', [RegisterController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Routes protégées Sanctum
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    // Route::apiResource('materiels', MaterielController::class);
    Route::apiResource('directions', DirectionController::class);
    Route::apiResource('demandes', DemandeController::class);
    Route::apiResource('demande-materiels', DemandeMaterielController::class);
    Route::apiResource('livraisons', LivraisonController::class);
    Route::apiResource('mouvements-stock', MouvementStockController::class);

    // Tableau de bord
    Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});


// Route::middleware('auth:sanctum')->get('/auth/user', function (Request $request) {
//     return $request->user();
// });

Route::middleware('auth:sanctum')->get('/auth/user', function (Request $request) {
    return response()->json($request->user());
});

Route::middleware('auth:sanctum')->post('/auth/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete(); // ou Auth::logout() selon ta config
    return response()->json(['message' => 'Déconnecté avec succès']);
});

Route::get('/services', function() {
    return Service::all();
});

Route::post('register', [RegisterController::class, 'register']);

// Route::resource('materiels', MaterielController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/materiels', [MaterielController::class, 'index']);
    Route::post('/materiels', [MaterielController::class, 'store']);
    Route::put('/materiels/{materiel}', [MaterielController::class, 'update']);
    Route::delete('/materiels/{materiel}', [MaterielController::class, 'destroy']);
});

Route::post('/materiels/{materiel}/sortie', [MaterielController::class, 'sortirStock']);
Route::post('/materiels/{materiel}/entree', [MaterielController::class, 'entrerStock']);

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/mouvements-stock', [MouvementController::class, 'index']);
// });


