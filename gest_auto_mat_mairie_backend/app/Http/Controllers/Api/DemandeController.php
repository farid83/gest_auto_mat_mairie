<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Demande;
use App\Models\DemandeMateriel;
use App\Models\User;

class DemandeController extends Controller
{
   public function index(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    $demandes = Demande::with('materiels.materiel')
                      ->where('user_id', $user->id)
                      ->get();

    $demandes = $demandes->map(function($demande) {
        return [
            'id' => $demande->id,
            'user_id' => $demande->user_id,
            'created_at' => $demande->created_at,
            'status' => $demande->status,
            'materials' => $demande->materiels->map(function($dm) {
                return [
                    'id' => $dm->id,
                    'name' => $dm->materiel->nom ?? 'Nom indisponible',
                    'quantity' => $dm->quantite_demandee,
                    'justification' => $dm->justification ?? 'Aucune justification',
                ];
            }),
        ];
    });

    return response()->json([
        'message' => 'Liste des demandes',
        'demandes' => $demandes
    ]);
}


public function store(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    $validatedData = $request->validate([
        'justification' => 'nullable|string|max:1000',
        'materiels' => 'required|array|min:1',
        'materiels.*.materiel_id' => 'required|integer|exists:materiels,id',
        'materiels.*.quantite' => 'required|integer|min:1',
        'materiels.*.justification' => 'nullable|string|max:1000',
    ]);

    $rolesSpeciaux = ['secretaire_executif', 'daaf', 'directeur'];

    $gestionnaire = User::where('role', 'gestionnaire_stock')->first();
    if (!$gestionnaire) {
        return response()->json(['message' => 'Aucun gestionnaire de stock trouvé'], 404);
    }

    $directeur = User::where('service_id', $user->service_id)
                     ->where('role', 'directeur')
                     ->first();

    if (!$directeur && !in_array($user->role, $rolesSpeciaux)) {
        return response()->json(['message' => 'Aucun directeur trouvé pour ce service'], 404);
    }

    $statusInitial = in_array($user->role, $rolesSpeciaux) ? 'en_attente_stock' : 'en_attente';

    $demande = Demande::create([
        'user_id' => $user->id,
        'service_id' => $user->service_id,
        'directeur_id' => $directeur->id ?? null,
        'gestionnaire_id' => $gestionnaire->id,
        'status' => $statusInitial,
        'justification' => $validatedData['justification'] ?? null,
    ]);

    foreach ($validatedData['materiels'] as $mat) {
        DemandeMateriel::create([
            'demande_id' => $demande->id,
            'materiel_id' => $mat['materiel_id'],
            'quantite_demandee' => $mat['quantite'],
            'justification' => $mat['justification'] ?? '',
        ]);
    }

    $demande = Demande::with('materiels.materiel')->find($demande->id);

    return response()->json([
        'message' => 'Demande reçue avec succès',
        'demande' => $demande
    ], 201);
}

    public function show(string $id)
    {
        $demande = Demande::with('materiels.materiel')->findOrFail($id);
        return response()->json($demande, 200);
    }

    public function update(Request $request, string $id)
    {
        $demande = Demande::findOrFail($id);

        $validatedData = $request->validate([
            'status' => 'required|in:en_attente,validee,rejetee',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        $demande->update([
            'status' => $validatedData['status'],
            'commentaire' => $validatedData['commentaire'] ?? null,
            'date_validation_directeur' => $validatedData['status'] === 'validee' ? now() : null,
        ]);

        return response()->json([
            'message' => 'Demande mise à jour avec succès',
            'demande' => $demande
        ], 200);
    }

    public function destroy(string $id)
    {
        $demande = Demande::findOrFail($id);
        $demande->delete();

        return response()->json([
            'message' => 'Demande supprimée avec succès'
        ], 200);
    }
}
