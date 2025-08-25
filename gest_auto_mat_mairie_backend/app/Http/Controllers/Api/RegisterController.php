<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Service;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        try {
            // Validation des données
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'service_id' => 'nullable|exists:services,id',
            ]);

            // Hash du mot de passe
            $validated['password'] = Hash::make($validated['password']);

            // Création de l'utilisateur
            $user = User::create($validated);

            // Réponse JSON
            return response()->json([
                'user' => $user,
                'message' => 'Enregistrement du user réussi.'
            ], 201);

        } catch (ValidationException $e) {
            // Gestion des erreurs de validation
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Gestion des autres erreurs éventuelles
            return response()->json([
                'message' => 'Une erreur est survenue.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
