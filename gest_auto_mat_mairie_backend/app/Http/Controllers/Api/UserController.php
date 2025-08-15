<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Direction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', "%{$request->search}%")
                ->orWhere('email', 'ilike', "%{$request->search}%");
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('active')) {
            $query->where('active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->with('direction')
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'role' => ['required', Rule::in([
                'user',
                'directeur',
                'gestionnaire_stock',
                'daaf',
                'secretaire_executif',
                'admin'
            ])],
            'direction_id' => 'nullable|exists:directions,id',
            'active' => 'boolean',
        ]);

        $user = User::create($validated);

        return response()->json([
            'user' => $user->load('direction'),
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'message' => 'Utilisateur créé avec succès',
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in([
                'agent',
                'directeur',
                'gestionnaire_stock',
                'daaf',
                'secretaire_executif',
                'admin'
            ])],
            'direction_id' => 'nullable|exists:directions,id',
            'active' => 'boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'user' => $user->load('direction'),
            'message' => 'Utilisateur mis à jour avec succès',
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }
    
}


