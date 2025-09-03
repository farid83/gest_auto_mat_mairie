<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Demande;
use App\Models\DemandeMateriel;
use App\Models\User;
use App\Notifications\NewDemandeNotification;

class DemandeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request)
{
    // Récupérer uniquement les demandes de l'utilisateur connecté
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    $demandes = Demande::with('materiels.materiel')
                      ->where('user_id', $user->id)
                      ->get();

    // Reformater pour le frontend
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



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    // Validation uniquement des champs nécessaires côté front
    $validatedData = $request->validate([
        'justification' => 'nullable|string|max:1000',
        'materiels' => 'required|array|min:1',
        'materiels.*.materiel_id' => 'required|integer|exists:materiels,id',
        'materiels.*.quantite' => 'required|integer|min:1',
        'materiels.*.justification' => 'nullable|string|max:1000',
    ]);

    // Récupérer le directeur du service
    $directeur = \App\Models\User::where('service_id', $user->service_id)
        ->where('role', 'directeur')
        ->first();

    if (!$directeur) {
        return response()->json(['message' => 'Aucun directeur trouvé pour ce service'], 404);
    }

    // Créer la demande
    $demande = Demande::create([
        'user_id' => $user->id,
        'service_id' => $user->service_id,
        'directeur_id' => $directeur->id,
        'status' => 'en_attente',
        'justification' => $validatedData['justification'] ?? null,
    ]);

    // Enregistrer les matériels
    foreach ($validatedData['materiels'] as $mat) {
        DemandeMateriel::create([
            'demande_id' => $demande->id,
            'materiel_id' => $mat['materiel_id'],
            'quantite_demandee' => $mat['quantite'],
            'justification' => $mat['justification'] ?? '', // ✅ jamais null
        ]);
    }

    // Retourner la demande complète avec ses matériels
    $demande = Demande::with('materiels.materiel')->find($demande->id);

    // Envoyer une notification au directeur
    if ($directeur) {
        $directeur->notify(new NewDemandeNotification($demande, $user->name));
    }

    return response()->json([
        'message' => 'Demande reçue avec succès',
        'demande' => $demande
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        $demande = Demande::with('materiels.materiel')->findOrFail($id);
        return response()->json($demande, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $demande = Demande::findOrFail($id);
        $demande->delete();

        return response()->json([
            'message' => 'Demande supprimée avec succès'
        ], 200);
    }
}
