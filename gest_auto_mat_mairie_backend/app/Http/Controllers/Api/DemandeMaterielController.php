<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DemandeMateriel;
use App\Models\Demande;


class DemandeMaterielController extends Controller
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
