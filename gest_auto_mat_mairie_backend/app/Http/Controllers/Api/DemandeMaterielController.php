<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DemandeMateriel;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
// use App\Notifications\DemandeValideeNotification;
// use App\Notifications\LivraisonReadyNotification;

class DemandeMaterielController extends Controller
{
    /**
     * Liste des demandes de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        if ($user->role === 'directeur') {
            $demandes = Demande::with('materiels.materiel')
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->orWhere('service_id', $user->service_id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $demandes = Demande::with('materiels.materiel')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $demandes = $demandes->map(fn($demande) => [
            'id' => $demande->id,
            'user_id' => $demande->user_id,
            'created_at' => $demande->created_at,
            'status' => $demande->status,
            'materials' => $demande->materiels->map(fn($dm) => [
                'id' => $dm->id,
                'materiel_id' => $dm->materiel_id,
                'name' => $dm->materiel->nom ?? 'Nom indisponible',
                'quantity' => $dm->quantite_demandee,
                'justification' => $dm->justification ?? 'Aucune justification',
                'status' => $dm->quantite_validee !== null
                    ? ($dm->quantite_validee > 0 ? 'validee' : 'rejetee')
                    : 'en_attente'
            ])
        ]);

        return response()->json(['message' => 'Liste des demandes', 'demandes' => $demandes]);
    }

    /**
     * Récupérer les demandes à valider selon le rôle
     */
    public function getRequestsForValidation(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $roleStatusMap = [
            'directeur' => ['status' => 'en_attente', 'field' => 'directeur_id'],
            'gestionnaire_stock' => ['status' => 'en_attente_stock', 'field' => 'gestionnaire_id'],
            'daaf' => ['status' => 'en_attente_daaf', 'field' => 'daaf_id'],
            'secretaire_executif' => ['status' => 'en_attente_secretaire', 'field' => 'secretaire_id'],
        ];

        if (!isset($roleStatusMap[$user->role])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        try {
            if ($user->role === 'gestionnaire_stock') {
                $demandes = Demande::with(['materiels.materiel', 'user'])
                    ->where('gestionnaire_id', $user->id)
                    ->where('status', 'en_attente_stock')
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                $status = $roleStatusMap[$user->role]['status'];
                $roleField = $roleStatusMap[$user->role]['field'];

                $demandes = Demande::with(['materiels.materiel', 'user'])
                    ->when($roleField, function ($query) use ($roleField, $user) {
                        $query->where($roleField, $user->id);
                    })
                    ->where('status', $status)
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            $demandes = $demandes->map(function ($demande) {
                return [
                    'id' => $demande->id,
                    'user_name' => $demande->user->name ?? 'Utilisateur inconnu',
                    'created_at' => $demande->created_at,
                    'status' => $demande->status,
                    'materials' => $demande->materiels->map(function ($dm) {
                        return [
                            'id' => $dm->id,
                            'materiel_id' => $dm->materiel_id,
                            'name' => $dm->materiel->nom ?? 'Nom indisponible',
                            'quantity' => $dm->quantite_demandee ?? 0,
                            'quantite_proposee_gestionnaire' => $dm->quantite_proposee_gestionnaire ?? null,
                            'quantite_validee_daaf' => $dm->quantite_validee_daaf ?? null,
                            'justification' => $dm->justification ?? 'Aucune justification',
                            'status' => isset($dm->quantite_validee)
                                ? ($dm->quantite_validee > 0 ? 'validee' : 'rejetee')
                                : 'en_attente'
                        ];
                    })
                ];
            });
        } catch (\Exception $e) {
            \Log::error('Erreur getRequestsForValidation: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur lors de la récupération des demandes'], 500);
        }

        return response()->json([
            'message' => 'Liste des demandes à valider',
            'demandes' => $demandes
        ]);
    }

    /**
     * Validation globale d'une demande
     */
public function validateRequest(Request $request, $id)
{
    $user = $request->user();
    if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

    $demande = Demande::with('materiels.materiel')->find($id);
    if (!$demande) return response()->json(['message' => 'Demande non trouvée'], 404);

    $validated = $request->validate([
        'status' => 'required|in:validee,rejetee',
        'commentaire' => 'nullable|string|max:500',
        'materiel_ids' => 'nullable|array',
        'materiel_ids.*' => 'integer|exists:demande_materiels,materiel_id',
        'quantites' => 'nullable|array',
        'quantites.*' => 'nullable|integer|min:1',
    ]);

    $role = $user->role;

    $commentField = 'commentaire_' . $role;
    if (Schema::hasColumn('demandes', $commentField)) {
        $demande->$commentField = $validated['commentaire'] ?? null;
    }

    $dateField = 'date_validation_' . $role;
    if (Schema::hasColumn('demandes', $dateField)) {
        $demande->$dateField = now();
    }

    if ($validated['status'] === 'validee') {
        $materielIdsValides = $validated['materiel_ids'] ?? [];

        foreach ($demande->materiels as $dm) {
    if (in_array($dm->materiel_id, $materielIdsValides)) {
        // Matériel sélectionné → on garde la logique existante
        if ($role === 'gestionnaire_stock' && isset($validated['quantites'][$dm->materiel_id])) {
            $dm->quantite_proposee_gestionnaire = $validated['quantites'][$dm->materiel_id];
        }

        if ($role === 'daaf' && isset($validated['quantites'][$dm->materiel_id])) {
            $dm->quantite_validee_daaf = $validated['quantites'][$dm->materiel_id];
        }

        $dm->quantite_validee = $role === 'gestionnaire_stock'
            ? $dm->quantite_proposee_gestionnaire
            : $dm->quantite_validee_daaf;
        $dm->status = 'validee';
    } else {
        // Matériel non sélectionné → rejeté automatiquement
        $dm->quantite_validee = 0;
        $dm->status = 'rejetee';
        if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
        if ($role === 'daaf') $dm->quantite_validee_daaf = null;
    }

    $dm->{'date_validation_' . $role} = now();
    $dm->save();
}


        // Vérifier si c'est une validation partielle
        $hasValidatedMateriels = $demande->materiels->some(fn($m) => $m->quantite_validee > 0);
        $hasRejectedMateriels = $demande->materiels->some(fn($m) => $m->quantite_validee === 0);

        switch ($role) {
            case 'directeur':
                $nextRole = 'gestionnaire_stock';
                $demande->status = 'en_attente_stock';
                $nextUser = User::where('role', $nextRole)->first();
                if ($nextUser && Schema::hasColumn('demandes', 'gestionnaire_id')) {
                    $demande->gestionnaire_id = $nextUser->id;
                }
                break;
            case 'gestionnaire_stock':
                $nextRole = 'daaf';
                $demande->status = 'en_attente_daaf';
                $nextUser = User::where('role', $nextRole)->first();
                if ($nextUser && Schema::hasColumn('demandes', $nextRole . '_id')) {
                    $demande->{$nextRole . '_id'} = $nextUser->id;
                }
                break;
            case 'daaf':
                $nextRole = 'secretaire_executif';
                $demande->status = 'en_attente_secretaire';
                $nextUser = User::where('role', $nextRole)->first();
                if ($nextUser && Schema::hasColumn('demandes', 'secretaire_id')) {
                    $demande->secretaire_id = $nextUser->id;
                }
                break;
            case 'secretaire_executif':
                $demande->status = 'validee_finale';
                break;
        }
    } else {
        $demande->status = 'rejetee';
        foreach ($demande->materiels as $dm) {
            $dm->quantite_validee = 0;
            if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
            if ($role === 'daaf') $dm->quantite_validee_daaf = null;
            $dm->save();
        }
    }

    $demande->save();

    // if ($validated['status'] === 'validee') {
    //     $demandeur = $demande->user;
    //     if ($demandeur) {
    //         $demandeur->notify(new DemandeValideeNotification($demande, $user->name, $role));
    //     }
    //     if ($role === 'secretaire_executif') {
    //         $gestionnaireStock = User::where('role', 'gestionnaire_stock')->first();
    //         if ($gestionnaireStock) {
    //             $gestionnaireStock->notify(new LivraisonReadyNotification($demande, $user->name));
    //         }
    //     }
    // }

    return response()->json([
        'message' => "Demande traitée par {$role}",
        'demande' => $demande->load('materiels.materiel')
    ]);
}

    /**
     * Validation par matériel spécifique
     */
    public function validateMateriel(Request $request, $id, $materielId)
    {
        return $this->validateMaterielByRole($request, $id, $materielId, $request->user()->role);
    }

    public function validateMaterielByDaaf(Request $request, $id, $materielId)
    {
        return $this->validateMaterielByRole($request, $id, $materielId, 'daaf');
    }

    public function validateMaterielBySecretaire(Request $request, $id, $materielId)
    {
        return $this->validateMaterielByRole($request, $id, $materielId, 'secretaire_executif');
    }

    /**
     * Validation par matériel selon rôle
     */
    private function validateMaterielByRole(Request $request, $demandeId, $materielId, $role)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $validated = $request->validate([
            'status' => 'required|in:validee,rejetee',
            'commentaire' => 'nullable|string|max:500',
            'quantite_demandee' => 'nullable|integer|min:1'
        ]);

        $demande = Demande::with('materiels.materiel')->find($demandeId);
        if (!$demande) return response()->json(['message' => 'Demande non trouvée'], 404);

        $dm = DemandeMateriel::where('demande_id', $demandeId)
            ->where('materiel_id', $materielId)
            ->first();

        if (!$dm) {
            $dm = DemandeMateriel::create([
                'demande_id' => $demandeId,
                'materiel_id' => $materielId,
                'quantite_demandee' => $validated['quantite_demandee'] ?? 1,
                'justification' => 'Ajout automatique pour validation'
            ]);
        }

        if ($validated['status'] === 'validee') {
            // Si gestionnaire_stock ou daaf, utiliser la quantité envoyée
            if (in_array($role, ['gestionnaire_stock', 'daaf']) && isset($validated['quantites'][$materielId])) {
                $dm->quantite_validee = $validated['quantites'][$materielId];
                if ($role === 'gestionnaire_stock') {
                    $dm->quantite_proposee_gestionnaire = $validated['quantites'][$materielId];
                }
                if ($role === 'daaf') {
                    $dm->quantite_validee_daaf = $validated['quantites'][$materielId];
                }
            } else {
                $dm->quantite_validee = $dm->quantite_demandee;
            }
        } else {
            $dm->quantite_validee = 0;
        }

        // $dm->commentaire = $validated['commentaire'] ?? null;
        $dm->{'date_validation_' . $role} = now();
        $dm->save();

        $demande->load('materiels');
        $allValidated = $demande->materiels->every(fn($m) => $m->quantite_validee > 0);
        $allRejected = $demande->materiels->every(fn($m) => $m->quantite_validee === 0);

        $nextStatusMap = [
            'directeur' => 'en_attente_stock',
            'gestionnaire_stock' => 'en_attente_daaf',
            'daaf' => 'en_attente_secretaire',
            'secretaire_executif' => 'validee_finale'
        ];

        if ($allValidated) {
            // Tous les matériels sont validés -> passer à l'étape suivante
            $demande->status = $nextStatusMap[$role] ?? 'validee';

            // Ajout automatique du daaf_id et secretaire_id si besoin
            if ($role === 'gestionnaire_stock') {
                $daaf = User::where('role', 'daaf')->first();
                if ($daaf) $demande->daaf_id = $daaf->id;
            }
            if ($role === 'daaf') {
                $secretaire = User::where('role', 'secretaire_executif')->first();
                if ($secretaire) $demande->secretaire_id = $secretaire->id;
            }
        } elseif ($allRejected) {
            // Tous les matériels sont rejetés -> rejeter la demande
            $demande->status = 'rejetee';
        } else {
            // Validation partielle : certains matériels sont validés, d'autres rejetés
            // La demande passe à l'étape suivante avec les matériels validés
            $demande->status = $nextStatusMap[$role] ?? 'validee';

            // Ajout automatique du daaf_id et secretaire_id si besoin
            if ($role === 'gestionnaire_stock') {
                $daaf = User::where('role', 'daaf')->first();
                if ($daaf) $demande->daaf_id = $daaf->id;
            }
            if ($role === 'daaf') {
                $secretaire = User::where('role', 'secretaire_executif')->first();
                if ($secretaire) $demande->secretaire_id = $secretaire->id;
            }
        }

        $demande->save();

        // if ($validated['status'] === 'validee') {
        //     $demandeur = $demande->user;
        //     if ($demandeur) {
        //         $demandeur->notify(new DemandeValideeNotification($demande, $user->name, $role));
        //     }
        //     if ($role === 'secretaire_executif') {
        //         $gestionnaireStock = User::where('role', 'gestionnaire_stock')->first();
        //         if ($gestionnaireStock) {
        //             $gestionnaireStock->notify(new LivraisonReadyNotification($demande, $user->name));
        //         }
        //     }
        // }

        return response()->json([
            'status' => 'success',
            'message' => "Matériel {$validated['status']} par {$role}",
            'demande' => $demande->load('materiels.materiel')
        ]);
    }

    /**
     * Validation par matériel en batch
     */
public function batchValidateMateriels(Request $request, $demandeId)
{
    $user = $request->user();
    if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

    $validated = $request->validate([
        'materiel_ids' => 'required|array',
        'materiel_ids.*' => 'exists:demande_materiels,materiel_id',
        'status' => 'required|in:validee,rejetee',
        'quantites' => 'nullable|array',
        'quantites.*' => 'nullable|integer|min:1',
    ]);

    $role = $user->role;
    $demande = Demande::with('materiels')->find($demandeId);
    if (!$demande) return response()->json(['message' => 'Demande non trouvée'], 404);

    $validatedMaterielIds = $validated['materiel_ids'];

    // Parcourir tous les matériels et traiter
    foreach ($demande->materiels as $dm) {
    if (in_array($dm->materiel_id, $validatedMaterielIds)) {
    // Matériel sélectionné → garder la logique existante
    if ($validated['status'] === 'valide') {
        if (in_array($role, ['gestionnaire_stock', 'daaf']) && isset($validated['quantites'][$dm->materiel_id])) {
            $dm->quantite_validee = $validated['quantites'][$dm->materiel_id];
            if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = $validated['quantites'][$dm->materiel_id];
            if ($role === 'daaf') $dm->quantite_validee_daaf = $validated['quantites'][$dm->materiel_id];
        } else {
            $dm->quantite_validee = $dm->quantite_demandee;
        }
        $dm->status = 'valide';
    } else {
        $dm->quantite_validee = 0;
        $dm->status = 'rejete';
    }
} else {
    // Matériel non sélectionné → rejeté automatiquement
    $dm->quantite_validee = 0;
    $dm->status = 'rejete';
    if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
    if ($role === 'daaf') $dm->quantite_validee_daaf = null;
}
$dm->{'date_validation_' . $role} = now();
$dm->save();

    }

    $demande->load('materiels');
    $allValidated = $demande->materiels->every(fn($m) => $m->quantite_validee > 0);
    $allRejected = $demande->materiels->every(fn($m) => $m->quantite_validee === 0);

    $nextStatusMap = [
        'directeur' => 'en_attente_stock',
        'gestionnaire_stock' => 'en_attente_daaf',
        'daaf' => 'en_attente_secretaire',
        'secretaire_executif' => 'validee_finale'
    ];

    if ($allValidated) {
        // Tous les matériels sont validés -> passer à l'étape suivante
        $demande->status = $nextStatusMap[$role] ?? 'validee';

        if ($role === 'gestionnaire_stock') {
            $daaf = User::where('role', 'daaf')->first();
            if ($daaf) $demande->daaf_id = $daaf->id;
        }
        if ($role === 'daaf') {
            $secretaire = User::where('role', 'secretaire_executif')->first();
            if ($secretaire) $demande->secretaire_id = $secretaire->id;
        }
    } elseif ($allRejected) {
        // Tous les matériels sont rejetés -> rejeter la demande
        $demande->status = 'rejetee';
    } else {
        // Validation partielle : certains matériels sont validés, d'autres rejetés
        // La demande passe à l'étape suivante avec les matériels validés
        $demande->status = $nextStatusMap[$role] ?? 'validee';

        if ($role === 'gestionnaire_stock') {
            $daaf = User::where('role', 'daaf')->first();
            if ($daaf) $demande->daaf_id = $daaf->id;
        }
        if ($role === 'daaf') {
            $secretaire = User::where('role', 'secretaire_executif')->first();
            if ($secretaire) $demande->secretaire_id = $secretaire->id;
        }
    }

    $demande->save();

    return response()->json([
        'status' => 'success',
        'message' => 'Matériels traités',
        'demande' => $demande->load('materiels.materiel')
    ]);
}
}
