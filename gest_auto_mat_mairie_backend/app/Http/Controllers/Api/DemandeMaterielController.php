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
            'status' => 'required|in:validee,rejetee,validé,rejeté',
            'commentaire' => 'nullable|string|max:500',
            'materiel_ids' => 'nullable|array',
            'materiel_ids.*' => 'integer|exists:demande_materiels,materiel_id',
            'quantites' => 'nullable|array',
            'quantites.*' => 'nullable|integer|min:1',
        ]);

        // Normaliser les statuts
        $statusMap = [
            'validé' => 'validee',
            'rejeté' => 'rejetee'
        ];
        $validated['status'] = $statusMap[$validated['status']] ?? $validated['status'];

        $role = $user->role;

        // Commentaire + date de validation
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
                    // Matériel sélectionné → validé
                    if ($role === 'gestionnaire_stock' && isset($validated['quantites'][$dm->materiel_id])) {
                        $dm->quantite_proposee_gestionnaire = $validated['quantites'][$dm->materiel_id];
                    }

                    if ($role === 'daaf' && isset($validated['quantites'][$dm->materiel_id])) {
                        $dm->quantite_validee_daaf = $validated['quantites'][$dm->materiel_id];
                    }

                    $dm->quantite_validee = $role === 'gestionnaire_stock'
                        ? ($dm->quantite_proposee_gestionnaire ?? $dm->quantite_demandee)
                        : ($role === 'daaf' ? ($dm->quantite_validee_daaf ?? $dm->quantite_demandee) : $dm->quantite_demandee);

                    $dm->status = 'validee';
                } else {
                    // Non sélectionné → rejeté
                    $dm->quantite_validee = 0;
                    $dm->status = 'rejetee';
                    if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
                    if ($role === 'daaf') $dm->quantite_validee_daaf = null;
                }

                $dm->{'date_validation_' . $role} = now();
                $dm->save();
            }

            // Vérifier si la demande doit passer ou être rejetée
            $allRejected = $demande->materiels->every(fn($m) => $m->quantite_validee === 0);
            $hasValidatedMateriels = $demande->materiels->some(fn($m) => $m->quantite_validee > 0);

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
        } else {
            // Si la demande entière est rejetée
            $demande->status = 'rejetee';
            foreach ($demande->materiels as $dm) {
                $dm->quantite_validee = 0;
                $dm->status = 'rejetee';
                if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
                if ($role === 'daaf') $dm->quantite_validee_daaf = null;
                $dm->save();
            }
        }

        $demande->save();

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
            'status' => 'required|in:validee,rejetee,validé,rejeté',
            'commentaire' => 'nullable|string|max:500',
            'quantite_demandee' => 'nullable|integer|min:1'
        ]);

        // Normaliser les statuts
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
            // Si gestionnaire_stock ou daaf, utiliser la quantité envoyée si elle existe, sinon garder la quantité demandée
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
                    // Si aucune quantité n'est envoyée, garder la quantité demandée et la mettre dans le champ approprié
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

        // $dm->commentaire = $validated['commentaire'] ?? null;
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
            // Tous les matériels sont rejetés -> rejeter la demande
            $demande->status = 'rejetee';
        } elseif ($hasValidatedMateriels) {
            // Au moins un matériel est validé (peut être tous ou une partie) -> passer à l'étape suivante
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
        // Si aucun matériel n'est validé mais pas tous rejetés (cas impossible avec la logique actuelle),
        // on garde le statut actuel

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

        $demande = Demande::with('materiels')->find($demandeId);
        if (!$demande) return response()->json(['message' => 'Demande non trouvée'], 404);

        $validated = $request->validate([
            'materiel_ids' => 'required|array',
            'status' => 'required|in:validee,rejetee,validé,rejeté',
            'quantites' => 'nullable|array',
            'quantites.*' => 'nullable|integer|min:1',
        ]);

        // Normaliser statut
        $statusMap = [
            'validé' => 'validee',
            'rejeté' => 'rejetee'
        ];
        $validated['status'] = $statusMap[$validated['status']] ?? $validated['status'];

        $materielIdsValides = $validated['materiel_ids'] ?? [];
        $role = $user->role;

        foreach ($demande->materiels as $dm) {
            if (in_array($dm->materiel_id, $materielIdsValides)) {
                // Sélectionné → validé
                if ($role === 'gestionnaire_stock' && isset($validated['quantites'][$dm->materiel_id])) {
                    $dm->quantite_proposee_gestionnaire = $validated['quantites'][$dm->materiel_id];
                }
                if ($role === 'daaf' && isset($validated['quantites'][$dm->materiel_id])) {
                    $dm->quantite_validee_daaf = $validated['quantites'][$dm->materiel_id];
                }
                $dm->quantite_validee = $role === 'gestionnaire_stock'
                    ? ($dm->quantite_proposee_gestionnaire ?? $dm->quantite_demandee)
                    : ($role === 'daaf' ? ($dm->quantite_validee_daaf ?? $dm->quantite_demandee) : $dm->quantite_demandee);
                $dm->status = 'validee';
            } else {
                // Non sélectionné → rejeté
                $dm->quantite_validee = 0;
                $dm->status = 'rejetee';
                if ($role === 'gestionnaire_stock') $dm->quantite_proposee_gestionnaire = null;
                if ($role === 'daaf') $dm->quantite_validee_daaf = null;
            }

            $dm->{'date_validation_' . $role} = now();
            $dm->save();
        }

        // Vérifier si tous rejetés ou passer à l'étape suivante
        $allRejected = $demande->materiels->every(fn($m) => $m->quantite_validee === 0);
        $hasValidatedMateriels = $demande->materiels->some(fn($m) => $m->quantite_validee > 0);

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

    /**
     * Validation finale par le secrétaire_exécutif
     * Cette méthode valide définitivement la demande et déduit le stock
     */
    
  /**
   * Validation finale par le secrétaire exécutif
   * Cette méthode valide définitivement la demande et déduit le stock de manière sécurisée
   */
  public function validateBySecretaireExecutif($id)
  {
      DB::beginTransaction();
      
      try {
          $demande = Demande::with('materiels.materiel')->findOrFail($id);
          $user = request()->user();
  
          \Log::info("=== Début validation secrétaire pour demande {$id} par utilisateur {$user->id} ===");
  
          // Vérifier que la demande est dans le bon statut
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
  
              // Quantité validée par la DAAF
              $quantiteValidee = $dm->quantite_validee_daaf ?? 0;
  
              if ($quantiteValidee > 0) {
                  // Vérifier le stock disponible avec une requête sécurisée
                  $materielActualise = Materiel::where('id', $materiel->id)
                      ->lockForUpdate() // Verrouiller le matériel pour éviter les conflits
                      ->first();
  
                  if (!$materielActualise) {
                      throw new \Exception("Matériel {$materiel->nom} introuvable lors de la vérification du stock");
                  }
  
                  if ($materielActualise->quantite_disponible >= $quantiteValidee) {
                      // Déduction sécurisée du stock
                      $nouveauStock = $materielActualise->quantite_disponible - $quantiteValidee;
                      
                      $miseAJourStock = Materiel::where('id', $materielActualise->id)
                          ->update(['quantite_disponible' => $nouveauStock]);
  
                      if (!$miseAJourStock) {
                          throw new \Exception("Échec de la mise à jour du stock pour {$materiel->nom}");
                      }
  
                      // Mettre à jour le DemandeMateriel
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
                      // Stock insuffisant
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
                  // Quantité non validée par DAAF
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
  
          // Mettre à jour la demande avec le statut final et l'ID du secrétaire
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

    /**
     * Récupérer les demandes prêtes à être livrées
     */
    // public function getReadyToDeliver(Request $request)
    // {
    //     $user = $request->user();
    //     if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

    //     $demandes = Demande::with(['materiels.materiel', 'user'])
    //         ->where('status', 'livraison')
    //         ->orderBy('created_at', 'desc')
    //         ->get();

    //     $demandes = $demandes->map(function ($demande) {
    //         return [
    //             'id' => $demande->id,
    //             'user_name' => $demande->user->name ?? 'Utilisateur inconnu',
    //             'created_at' => $demande->created_at,
    //             'status' => $demande->status,
    //             'materials' => $demande->materiels->map(function ($dm) {
    //                 return [
    //                     'id' => $dm->id,
    //                     'materiel_id' => $dm->materiel_id,
    //                     'name' => $dm->materiel->nom ?? 'Nom indisponible',
    //                     'quantity' => $dm->quantite_validee ?? 0,
    //                     'justification' => $dm->justification ?? 'Aucune justification',
    //                 ];
    //             })
    //         ];
    //     });

    //     return response()->json([
    //         'message' => 'Liste des demandes prêtes à être livrées',
    //         'demandes' => $demandes
    //     ]);
    // }

}
