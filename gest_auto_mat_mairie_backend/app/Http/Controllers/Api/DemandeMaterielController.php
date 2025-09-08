<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DemandeMateriel;
use App\Models\Demande;
use App\Models\User;



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
        $demandes = $demandes->map(function ($demande) {
            return [
                'id' => $demande->id,
                'user_id' => $demande->user_id,
                'created_at' => $demande->created_at,
                'status' => $demande->status,
                'materials' => $demande->materiels->map(function ($dm) {
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
     * Récupérer les demandes à valider par le directeur
     */
   public function getRequestsForValidation(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    $demandes = collect(); // initialisation

    if ($user->role === 'directeur') {
        $demandes = Demande::with(['materiels.materiel', 'user'])
            ->where('directeur_id', $user->id)
            ->where('status', 'en_attente')
            ->orderBy('created_at', 'desc')
            ->get();
    } elseif ($user->role === 'gestionnaire_stock') {
        $demandes = Demande::with(['materiels.materiel', 'user'])
            ->where('gestionnaire_id', $user->id)
            ->where('status', 'en_attente_stock')
            ->orderBy('created_at', 'desc')
            ->get();
    } else {
        return response()->json(['message' => 'Accès non autorisé'], 403);
    }

    // Reformater pour le frontend
    $demandes = $demandes->map(function ($demande) {
        return [
            'id' => $demande->id,
            'user_name' => $demande->user->name ?? 'Utilisateur inconnu',
            'created_at' => $demande->created_at,
            'status' => $demande->status,
            'materials' => $demande->materiels->map(function ($dm) {
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
        'message' => 'Liste des demandes à valider',
        'demandes' => $demandes
    ]);
}



/**
 * Récupérer les demandes à traiter par le gestionnaire de stock
 */
public function getRequestsForStock(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    // Vérifier que l'utilisateur est un gestionnaire de stock
    if ($user->role !== 'gestionnaire_stock') {
        return response()->json(['message' => 'Accès non autorisé - Seuls les gestionnaires de stock peuvent voir ces demandes'], 403);
    }

    $demandes = Demande::with(['materiels.materiel', 'user'])
        ->where('gestionnaire_id', $user->id)
        ->where('status', 'en_attente_stock')
        ->orderBy('created_at', 'desc')
        ->get();

    $demandes = $demandes->map(function($demande) {
        return [
            'id' => $demande->id,
            'user_name' => $demande->user->name ?? 'Utilisateur inconnu',
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
        'message' => 'Liste des demandes à traiter par le gestionnaire de stock',
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
     * Valider une demande par le directeur hiérarchique
     */
public function validateRequest(Request $request, $id)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    if ($user->role !== 'directeur') {
        return response()->json(['message' => 'Accès non autorisé - Seuls les directeurs peuvent valider les demandes'], 403);
    }

    $demande = Demande::with('materiels.materiel')->find($id);
    if (!$demande) {
        return response()->json(['message' => 'Demande non trouvée'], 404);
    }

    if ($demande->directeur_id !== $user->id) {
        return response()->json(['message' => 'Vous ne pouvez valider que les demandes de votre service'], 403);
    }

    $validated = $request->validate([
        'status' => 'required|in:validee,rejetee',
        'commentaire' => 'nullable|string|max:500',
    ]);

    $demande->status = $validated['status'];
    $demande->commentaire = $validated['commentaire'];
    $demande->date_validation_directeur = now();

    if ($validated['status'] === 'validee') {
        // Affecter au gestionnaire stock par défaut
        $gestionnaire = \App\Models\User::where('role', 'gestionnaire_stock')->first();

        if ($gestionnaire) {
            $demande->status = 'en_attente_stock';
            $demande->gestionnaire_id = $gestionnaire->id;
        } else {
            return response()->json([
                'message' => 'Aucun gestionnaire de stock défini dans le système'
            ], 500);
        }

        foreach ($demande->materiels as $demandeMateriel) {
            $demandeMateriel->quantite_validee = $demandeMateriel->quantite_demandee;
            $demandeMateriel->save();
        }
    }

    $demande->save();

    return response()->json([
        'message' => 'Demande validée et envoyée au gestionnaire stock',
        'demande' => $demande->load(['materiels.materiel', 'gestionnaire'])
    ]);
}

    /**
     * Valider un matériel spécifique d'une demande
     */
    public function validateMateriel(Request $request, $id, $materielId)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        // Vérifier que l'utilisateur est un directeur
        if ($user->role !== 'directeur') {
            return response()->json(['message' => 'Accès non autorisé - Seuls les directeurs peuvent valider les matériels'], 403);
        }

        try {
            $demandeMateriel = DemandeMateriel::where('demande_id', $id)
                ->where('materiel_id', $materielId)
                ->firstOrFail();
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Matériel non trouvé dans cette demande'], 404);
        }

        // Vérifier que la demande appartient au service du directeur
        $demande = $demandeMateriel->demande;
        if ($demande->directeur_id !== $user->id) {
            return response()->json(['message' => 'Vous ne pouvez valider que les demandes de votre service'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:validee,rejetee',
            'commentaire' => 'nullable|string|max:500',
        ]);

        $status = $validated['status'];

        if ($status === 'validee') {
            $demandeMateriel->quantite_validee = $demandeMateriel->quantite_demandee;
        } elseif ($status === 'rejetee') {
            $demandeMateriel->quantite_validee = 0;
        }

        $demandeMateriel->commentaire = $validated['commentaire'];
        $demandeMateriel->date_validation_directeur = now();
        $demandeMateriel->save();

        // Vérifier le statut global de la demande
        $allValidated = $demande->demandeMateriels->every(fn($dm) => $dm->quantite_validee !== null && $dm->quantite_validee > 0);
        $allRejected = $demande->demandeMateriels->every(fn($dm) => $dm->quantite_validee === 0);
        $anyValidated = $demande->demandeMateriels->contains(fn($dm) => $dm->quantite_validee > 0);
        $anyRejected = $demande->demandeMateriels->contains(fn($dm) => $dm->quantite_validee === 0);

        if ($allValidated) {
            $demande->status = 'validee';
        } elseif ($allRejected) {
            $demande->status = 'rejetee';
        } elseif ($anyValidated || $anyRejected) {
            $demande->status = 'en_attente'; // statut intermédiaire
        } else {
            $demande->status = 'en_attente'; // aucun matériel encore validé/rejeté
        }

        $demande->save();

        return response()->json([
            'status' => 'success',
            'message' => "Matériel {$status} avec succès",
            'demande' => $demande->load('demandeMateriels.materiel')
        ]);
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
