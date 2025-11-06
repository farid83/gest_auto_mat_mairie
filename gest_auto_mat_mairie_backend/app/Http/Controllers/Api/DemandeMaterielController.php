<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DemandeMateriel;
use App\Models\Demande;
use App\Models\User;
use App\Models\Livraison;
use App\Models\MouvementStock;
use App\Models\Materiel;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


class DemandeMaterielController extends Controller
{
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

    public function getAllRequests(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $allowedRoles = ['admin', 'gestionnaire_stock', 'daaf'];
        if (!in_array($user->role, $allowedRoles)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        try {
            $demandes = Demande::with(['materiels.materiel', 'user', 'service'])
                ->orderBy('created_at', 'desc')
                ->get();

            $demandes = $demandes->map(function ($demande) {
                return [
                    'id' => $demande->id,
                    'demande_id' => $demande->id,
                    'user_name' => $demande->user->name ?? 'Utilisateur inconnu',
                    'user_service' => $demande->user->service?->name ?? 'Service inconnu',
                    'created_at' => $demande->created_at,
                    'updated_at' => $demande->updated_at,
                    'status' => $demande->status,
                    'validated_by' => $demande->validated_by ?? 'Non validé',
                    'commentaire_secretaire' => $demande->commentaire_secretaire ?? 'Aucun commentaire',
                    'livraison_status' => $demande->livraison_status ?? 'Non livrée',
                    'materials' => $demande->materiels->map(function ($dm) {
                        return [
                            'id' => $dm->id,
                            'materiel_id' => $dm->materiel_id,
                            'name' => $dm->materiel->nom ?? 'Nom indisponible',
                            'quantity' => $dm->quantite_demandee ?? 0,
                            'justification' => $dm->justification ?? 'Aucune justification',
                            'status' => $dm->status ?? 'en_attente',
                            'created_at' => $dm->created_at,
                            'updated_at' => $dm->updated_at,
                            'quantite_validee' => $dm->quantite_validee,
                            'quantite_proposee_gestionnaire' => $dm->quantite_proposee_gestionnaire,
                            'quantite_validee_daaf' => $dm->quantite_validee_daaf,
                            'date_validation_directeur' => $dm->date_validation_directeur,
                            'date_validation_gestionnaire' => $dm->date_validation_gestionnaire,
                            'date_validation_daaf' => $dm->date_validation_daaf,
                            'date_validation_secretaire' => $dm->date_validation_secretaire,
                        ];
                    })
                ];
            });

            return response()->json([
                'message' => 'Liste complète de toutes les demandes',
                'demandes' => $demandes
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur getAllRequests: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur lors de la récupération des demandes'], 500);
        }
    }
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

  public function validateRequest(Request $request, $id)
{
    $user = $request->user();
    if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

    $demande = Demande::with('materiels.materiel')->find($id);
    if (!$demande) return response()->json(['message' => 'Demande non trouvée'], 404);

    $validated = $request->validate([
        'status' => 'required|in:validee,rejetee,validé,rejeté',
        'commentaire' => 'nullable|string|max:500',
        'materiel_ids' => 'nullable|array',
        'materiel_ids.*' => 'integer|exists:demande_materiels,materiel_id',
        'quantites' => 'nullable|array',
        'quantites.*' => 'nullable|integer|min:1',
    ]);

    $statusMap = [
        'validé' => 'validee',
        'rejeté' => 'rejetee'
    ];
    $validated['status'] = $statusMap[$validated['status']] ?? $validated['status'];

    $role = $user->role;

    $commentField = 'commentaire_' . $role;
    if (Schema::hasColumn('demandes', $commentField)) {
        $demande->$commentField = $validated['commentaire'] ?? null;
    }

    $dateField = 'date_validation_' . $role;
    if (Schema::hasColumn('demandes', $dateField)) {
        $demande->$dateField = now();
    }

    // ===== CAS DE REJET GLOBAL =====
    if ($validated['status'] === 'rejetee' && empty($validated['materiel_ids'])) {
        // Rejet de toute la demande (aucun matériel spécifié)
        $demande->status = 'rejetee';

        foreach ($demande->materiels as $dm) {
            $dm->quantite_validee = 0;
            $dm->status = 'rejetee';
            $dm->{'date_validation_' . $role} = now();
            $dm->save();
        }

        $commentField = 'commentaire_' . $role;
        if (Schema::hasColumn('demandes', $commentField)) {
            $demande->$commentField = $validated['commentaire'] ?? null;
        }

        $demande->save();

        return response()->json(['message' => 'Demande rejetée avec succès']);
    }

    // ===== CAS DE VALIDATION OU REJET PARTIEL =====
    if ($validated['status'] === 'validee' || ($validated['status'] === 'rejetee' && !empty($validated['materiel_ids']))) {
        $materielIdsSelectionnes = $validated['materiel_ids'] ?? [];
        $actionEstValidation = ($validated['status'] === 'validee');

        foreach ($demande->materiels as $dm) {
            // ✅ CORRECTION : Traiter uniquement les matériels SÉLECTIONNÉS
            if (in_array($dm->materiel_id, $materielIdsSelectionnes)) {
                
                if ($actionEstValidation) {
                    // Action = Validation
                    if ($role === 'gestionnaire_stock' && isset($validated['quantites'][$dm->materiel_id])) {
                        $dm->quantite_proposee_gestionnaire = $validated['quantites'][$dm->materiel_id];
                    }

                    if ($role === 'daaf' && isset($validated['quantites'][$dm->materiel_id])) {
                        $dm->quantite_validee_daaf = $validated['quantites'][$dm->materiel_id];
                    }

                    $dm->status = 'en_attente';
                } else {
                    // Action = Rejet
                    $dm->quantite_validee = 0;
                    $dm->status = 'rejetee';
                    if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
                    if ($role === 'daaf') $dm->quantite_validee_daaf = null;
                }

                $dm->{'date_validation_' . $role} = now();
                $dm->save();
            }
            // ✅ Les matériels NON sélectionnés restent inchangés
        }

        // Vérifier si tous les matériels sont rejetés
        $allRejected = $demande->materiels->every(fn($m) => $m->status === 'rejetee');
        $hasValidatedMateriels = $demande->materiels->some(fn($m) => $m->status === 'en_attente');

        if ($allRejected) {
            $demande->status = 'rejetee';
        } elseif ($hasValidatedMateriels) {
            // Passer à l'étape suivante
            switch ($role) {
                case 'directeur':
                    $demande->status = 'en_attente_stock';
                    $nextUser = User::where('role', 'gestionnaire_stock')->first();
                    if ($nextUser && Schema::hasColumn('demandes', 'gestionnaire_id')) {
                        $demande->gestionnaire_id = $nextUser->id;
                    }
                    break;
                case 'gestionnaire_stock':
                    $demande->status = 'en_attente_daaf';
                    $nextUser = User::where('role', 'daaf')->first();
                    if ($nextUser && Schema::hasColumn('demandes', 'daaf_id')) {
                        $demande->daaf_id = $nextUser->id;
                    }
                    break;
                case 'daaf':
                    $demande->status = 'en_attente_secretaire';
                    $nextUser = User::where('role', 'secretaire_executif')->first();
                    if ($nextUser && Schema::hasColumn('demandes', 'secretaire_id')) {
                        $demande->secretaire_id = $nextUser->id;
                    }
                    break;
                case 'secretaire_executif':
                    $demande->status = 'validee_finale';
                    break;
            }
        }
    }

    $demande->save();

    return response()->json([
        'message' => "Demande traitée par {$role}",
        'demande' => $demande->load('materiels.materiel')
    ]);
}

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

    private function validateMaterielByRole(Request $request, $demandeId, $materielId, $role)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $validated = $request->validate([
            'status' => 'required|in:validee,rejetee,validé,rejeté',
            'commentaire' => 'nullable|string|max:500',
            'quantite_demandee' => 'nullable|integer|min:1'
        ]);

        $statusMap = [
            'validé' => 'validee',
            'rejeté' => 'rejetee'
        ];
        $validated['status'] = $statusMap[$validated['status']] ?? $validated['status'];

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
            if (in_array($role, ['gestionnaire_stock', 'daaf'])) {
                if (isset($validated['quantite_demandee'])) {
                    $dm->quantite_validee = $validated['quantite_demandee'];
                    if ($role === 'gestionnaire_stock') {
                        $dm->quantite_proposee_gestionnaire = $validated['quantite_demandee'];
                    }
                    if ($role === 'daaf') {
                        $dm->quantite_validee_daaf = $validated['quantite_demandee'];
                    }
                } else {
                    $dm->quantite_validee = $dm->quantite_demandee;
                    if ($role === 'gestionnaire_stock') {
                        $dm->quantite_proposee_gestionnaire = $dm->quantite_demandee;
                    }
                    if ($role === 'daaf') {
                        $dm->quantite_validee_daaf = $dm->quantite_demandee;
                    }
                }
            } else {
                $dm->quantite_validee = $dm->quantite_demandee;
            }
            $dm->status = 'validee';
        } else {
            $dm->quantite_validee = 0;
            $dm->status = 'rejetee';
        }

        $dm->{'date_validation_' . $role} = now();
        $dm->save();

        $demande->load('materiels');
        $allRejected = $demande->materiels->every(fn($m) => $m->quantite_validee === 0);
        $hasValidatedMateriels = $demande->materiels->some(fn($m) => $m->quantite_validee > 0);

        $nextStatusMap = [
            'directeur' => 'en_attente_stock',
            'gestionnaire_stock' => 'en_attente_daaf',
            'daaf' => 'en_attente_secretaire',
            'secretaire_executif' => 'validee_finale'
        ];

        if ($allRejected) {
            $demande->status = 'rejetee';
        } elseif ($hasValidatedMateriels) {
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
            'message' => "Matériel {$validated['status']} par {$role}",
            'demande' => $demande->load('materiels.materiel')
        ]);
    }

public function batchValidateMateriels(Request $request, $demandeId)
{
    $user = $request->user();
    if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

    $demande = Demande::with('materiels')->find($demandeId);
    if (!$demande) return response()->json(['message' => 'Demande non trouvée'], 404);

    $validated = $request->validate([
        'materiel_ids' => 'required|array',
        'status' => 'required|in:validee,rejetee,validé,rejeté',
        'quantites' => 'nullable|array',
        'quantites.*' => 'nullable|integer|min:0',
    ]);

    $statusMap = [
        'validé' => 'validee',
        'rejeté' => 'rejetee'
    ];
    $validated['status'] = $statusMap[$validated['status']] ?? $validated['status'];

    $materielIdsSelectionnes = $validated['materiel_ids'] ?? [];
    $role = $user->role;
    $actionEstValidation = ($validated['status'] === 'validee');

    foreach ($demande->materiels as $dm) {
        // ✅ CORRECTION : Traiter uniquement les matériels SÉLECTIONNÉS
        if (in_array($dm->materiel_id, $materielIdsSelectionnes)) {
            
            if ($actionEstValidation) {
                // Action = Validation
                if ($role === 'gestionnaire_stock' && isset($validated['quantites'][$dm->materiel_id])) {
                    $dm->quantite_proposee_gestionnaire = $validated['quantites'][$dm->materiel_id];
                }
                if ($role === 'daaf' && isset($validated['quantites'][$dm->materiel_id])) {
                    $dm->quantite_validee_daaf = $validated['quantites'][$dm->materiel_id];
                }
                $dm->status = 'en_attente';
            } else {
                // Action = Rejet
                $dm->quantite_validee = 0;
                $dm->status = 'rejetee';
                if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
                if ($role === 'daaf') $dm->quantite_validee_daaf = null;
            }

            $dm->{'date_validation_' . $role} = now();
            $dm->save();
        }
        // ✅ Les matériels NON sélectionnés restent inchangés
    }

    // Mise à jour du statut de la demande
    $allRejected = $demande->materiels->every(fn($m) => $m->status === 'rejetee');
    $hasValidatedMateriels = $demande->materiels->some(fn($m) => $m->status === 'en_attente');

    if ($allRejected) {
        $demande->status = 'rejetee';
    } elseif ($hasValidatedMateriels) {
        switch ($role) {
            case 'directeur':
                $demande->status = 'en_attente_stock';
                $nextUser = User::where('role', 'gestionnaire_stock')->first();
                if ($nextUser && Schema::hasColumn('demandes', 'gestionnaire_id')) {
                    $demande->gestionnaire_id = $nextUser->id;
                }
                break;
            case 'gestionnaire_stock':
                $demande->status = 'en_attente_daaf';
                $nextUser = User::where('role', 'daaf')->first();
                if ($nextUser && Schema::hasColumn('demandes', 'daaf_id')) {
                    $demande->daaf_id = $nextUser->id;
                }
                break;
            case 'daaf':
                $demande->status = 'en_attente_secretaire';
                $nextUser = User::where('role', 'secretaire_executif')->first();
                if ($nextUser && Schema::hasColumn('demandes', 'secretaire_id')) {
                    $demande->secretaire_id = $nextUser->id;
                }
                break;
            case 'secretaire_executif':
                $demande->status = 'validee_finale';
                break;
        }
    }

    $demande->save();

    return response()->json([
        'message' => "Validation batch effectuée par {$role}",
        'demande' => $demande->load('materiels.materiel')
    ]);
}
    public function validateBySecretaireExecutif($id)
    {
        DB::beginTransaction();

        try {
            $demande = Demande::with('materiels.materiel')->findOrFail($id);
            $user = request()->user();

            \Log::info("=== Début validation secrétaire pour demande {$id} par utilisateur {$user->id} ===");

            if ($demande->status !== 'en_attente_secretaire') {
                return response()->json([
                    'message' => 'La demande n\'est pas dans le statut attendu pour la validation secrétaire'
                ], 422);
            }

            $materielsMisAJour = [];
            $materielsRejetes = [];

            foreach ($demande->materiels as $dm) {
                $materiel = $dm->materiel;

                if (!$materiel) {
                    \Log::warning("⚠️ Pas de matériel lié pour DemandeMateriel ID {$dm->id}");
                    continue;
                }

                $quantiteValidee = $dm->quantite_validee_daaf ?? 0;

                if ($quantiteValidee > 0) {
                    $materielActualise = Materiel::where('id', $materiel->id)
                        ->lockForUpdate()
                        ->first();

                    if (!$materielActualise) {
                        throw new \Exception("Matériel {$materiel->nom} introuvable lors de la vérification du stock");
                    }

                    if ($materielActualise->quantite_disponible >= $quantiteValidee) {
                        $nouveauStock = $materielActualise->quantite_disponible - $quantiteValidee;

                        $miseAJourStock = Materiel::where('id', $materielActualise->id)
                            ->update(['quantite_disponible' => $nouveauStock]);

                        if (!$miseAJourStock) {
                            throw new \Exception("Échec de la mise à jour du stock pour {$materiel->nom}");
                        }

                        $dm->quantite_validee = $quantiteValidee;
                        $dm->status = 'validee';
                        $dm->date_validation_secretaire = now();

                        if (!$dm->save()) {
                            throw new \Exception("Échec de la sauvegarde du DemandeMateriel ID {$dm->id}");
                        }

                        $materielsMisAJour[] = [
                            'materiel_id' => $materiel->id,
                            'nom' => $materiel->nom,
                            'quantite_validee' => $quantiteValidee,
                            'ancien_stock' => $materielActualise->quantite_disponible,
                            'nouveau_stock' => $nouveauStock
                        ];

                        \Log::info("✅ Stock mis à jour pour {$materiel->nom} : {$materielActualise->quantite_disponible} → {$nouveauStock}");
                    } else {
                        $dm->quantite_validee = 0;
                        $dm->status = 'rejetee';
                        $dm->date_validation_secretaire = now();

                        if (!$dm->save()) {
                            throw new \Exception("Échec de la sauvegarde du DemandeMateriel rejeté ID {$dm->id}");
                        }

                        $materielsRejetes[] = [
                            'materiel_id' => $materiel->id,
                            'nom' => $materiel->nom,
                            'quantite_demandee' => $quantiteValidee,
                            'stock_disponible' => $materielActualise->quantite_disponible
                        ];

                        \Log::warning("❌ Stock insuffisant pour {$materiel->nom} : demandé {$quantiteValidee}, disponible {$materielActualise->quantite_disponible}");
                    }
                } else {
                    $dm->quantite_validee = 0;
                    $dm->status = 'rejetee';
                    $dm->date_validation_secretaire = now();

                    if (!$dm->save()) {
                        throw new \Exception("Échec de la sauvegarde du DemandeMateriel rejeté ID {$dm->id}");
                    }

                    $materielsRejetes[] = [
                        'materiel_id' => $materiel->id,
                        'nom' => $materiel->nom,
                        'quantite_demandee' => $quantiteValidee,
                        'raison' => 'Quantité non validée par DAAF'
                    ];

                    \Log::warning("❌ Quantité non validée par DAAF pour {$materiel->nom}");
                }
            }

            $demande->status = 'validee_finale';
            $demande->secretaire_id = $user->id;
            $demande->date_validation_secretaire = now();

            if (!$demande->save()) {
                throw new \Exception("Échec de la mise à jour de la demande ID {$id}");
            }

            DB::commit();

            return response()->json([
                'message' => 'Demande validée par le secrétaire exécutif avec succès',
                'data' => $demande->load('materiels.materiel'),
                'statistiques' => [
                    'materiels_valides' => count($materielsMisAJour),
                    'materiels_rejetes' => count($materielsRejetes),
                    'details_materiels_valides' => $materielsMisAJour,
                    'details_materiels_rejetes' => $materielsRejetes
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error("❌ Erreur lors de la validation secrétaire pour demande {$id}: " . $e->getMessage());

            return response()->json([
                'message' => 'Erreur lors de la validation par le secrétaire exécutif',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
