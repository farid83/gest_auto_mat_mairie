<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);
if (Auth::attempt($credentials)) {
    $user = Auth::user();
    $token = $user->createToken('API Token')->plainTextToken;
    

  return response()->json([
    'message'     => 'Connexion réussie',
    'session_id'  => $token, // 🔹 nouveau nom
    'user'        => [
        'id'    => $user->id,
        'name'  => $user->name,
        'email' => $user->email,
        'role'  => $user->role, // ajouter le rôle ici
        'token' => $token
    ]
]);
}
    }}