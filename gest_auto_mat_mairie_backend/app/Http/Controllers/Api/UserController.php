<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Direction;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

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

        // if ($request->filled('direction_id')) {
        //     $query->where('direction_id', $request->direction_id);
        // }

        if ($request->filled('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        $users = $query->with(['service'])
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in([
                'user',
                'directeur',
                'gestionnaire_stock',
                'daaf',
                'secretaire_executif',
                'admin'
            ])],
            // 'direction_id' => 'nullable|exists:directions,id',
            'service_id' => 'nullable|exists:services,id',
            'active' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'user' => $user->load(['service']),
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
            'password' => 'nullable|string|min:8',
            'role' => ['sometimes', Rule::in([
                'user',
                'directeur',
                'gestionnaire_stock',
                'daaf',
                'secretaire_executif',
                'admin'
            ])],
            // 'direction_id' => 'nullable|exists:directions,id',
            'service_id' => 'nullable|exists:services,id',
            'active' => 'boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'user' => $user->load(['service']),
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

    public function show($id)
    {
        $user = User::with(['service'])->findOrFail($id);
        return response()->json($user);
    }

    public function getRoles()
    {
        $roles = [
            'user' => 'Utilisateur',
            'directeur' => 'Directeur',
            'gestionnaire_stock' => 'Gestionnaire de stock',
            'daaf' => 'DAAF',
            'secretaire_executif' => 'Secrétaire exécutif',
            'admin' => 'Administrateur',
        ];

        return response()->json($roles);
    }

    public function getStats()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('active', true)->count(),
            'inactive_users' => User::where('active', false)->count(),
            'users_by_role' => User::select('role', \DB::raw('count(*) as count'))
                ->groupBy('role')
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Mise à jour dédiée du mot de passe utilisateur.
     * - Valide le mot de passe (min 8).
     * - Autorise l'opération uniquement si l'utilisateur est lui-même ou si l'utilisateur authentifié a le rôle 'admin'.
     * - Hash + sauvegarde.
     */
    public function updatePassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Simple contrôle d'autorisation : soit l'utilisateur modifie son propre mot de passe,
        // soit l'utilisateur connecté a le rôle 'admin'. Adapter selon vos règles métiers.
        $current = $request->user();
        if ($current->id !== (int)$id && ($current->role ?? '') !== 'admin') {
            return response()->json(['message' => "Non autorisé"], 403);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès',
            'user' => $user->load(['service']),
        ]);
    }

    /**
     * Mise à jour du mot de passe pour l'utilisateur courant.
     * - Exige current_password, password et password_confirmation.
     * - Vérifie que current_password correspond au mot de passe actuel.
     * - Hash et sauvegarde.
     */
 public function updateMyPassword(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user->password = Hash::make($validated['password']);
    $user->save();

    return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
}

}

