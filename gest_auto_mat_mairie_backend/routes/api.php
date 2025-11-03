<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MaterielController;
use App\Http\Controllers\Api\DirectionController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\DemandeMaterielController;
use App\Http\Controllers\Api\MouvementStockController;
use App\Http\Controllers\Api\PingController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\EnsureUserIsDirector;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Service;


Route::get('/ping', [PingController::class, 'ping']);

Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    $token = $user->createToken('API Token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user'  => $user
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('directions', DirectionController::class);
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('demandes', DemandeController::class);
    
    Route::apiResource('mouvements-stock', MouvementStockController::class);

    Route::get('dashboard/stats', [DashboardController::class, 'getStats']);

    Route::post('/me/password', [UserController::class, 'updateMyPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::get('/users/roles', [UserController::class, 'getRoles']);
    Route::get('/users/stats', [UserController::class, 'getStats']);
    Route::post('/users/{id}/password', [UserController::class, 'updatePassword']);
});

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});


Route::middleware('auth:sanctum')->get('/auth/user', function (Request $request) {
    return response()->json($request->user());
});

Route::middleware('auth:sanctum')->post('/auth/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Déconnecté avec succès']);
});

Route::get('/services', function () {
    return Service::all();
});

Route::post('register', [RegisterController::class, 'register']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/materiels', [MaterielController::class, 'index']);
    Route::post('/materiels', [MaterielController::class, 'store']);
    Route::put('/materiels/{materiel}', [MaterielController::class, 'update']);
    Route::delete('/materiels/{materiel}', [MaterielController::class, 'destroy']);
});

Route::post('/materiels/{materiel}/sortie', [MaterielController::class, 'sortirStock']);
Route::post('/materiels/{materiel}/entree', [MaterielController::class, 'entrerStock']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/demandes', [DemandeController::class, 'store']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/demande_materiels', [DemandeMaterielController::class, 'index']);
    Route::get('/demande_materiels/all', [DemandeMaterielController::class, 'getAllRequests']);
    Route::get('/demande-materiels/validation', [DemandeMaterielController::class, 'getRequestsForValidation']);
    Route::post('/demande-materiels/{id}/validate', [DemandeMaterielController::class, 'validateRequest']);
    Route::post('/demande-materiels/{id}/materiels/{materielId}/validate', [DemandeMaterielController::class, 'validateMateriel']);
    Route::post('/demande-materiels/{id}/materiels/{materielId}/daaf-validate', [DemandeMaterielController::class, 'validateMaterielByDaaf']);
    Route::post('/demande-materiels/{id}/materiels/{materielId}/secretaire-validate', [DemandeMaterielController::class, 'validateMaterielBySecretaire']);
    Route::post('/demande-materiels/{id}/stock-action', [DemandeMaterielController::class, 'validateRequest']);
    Route::post('/demande-materiels/{demandeId}/materiels/batch-validate', [DemandeMaterielController::class, 'batchValidateMateriels']);
    
    Route::post('/demande-materiels/{id}/secretaire-executif-validate', [DemandeMaterielController::class, 'validateBySecretaireExecutif']);
});

Route::middleware(['auth:sanctum', EnsureUserIsDirector::class])->group(function () {
    Route::get('/directeur-only', function () {
        return response()->json(['message' => 'Accès autorisé au directeur uniquement']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/services/direction/{directionId}', [ServiceController::class, 'getByDirection']);
});
