<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DemandeMateriel;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class DemandeMaterielController extends Controller
{
    /**
     * Liste des demandes de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $demandes = Demande::with('materiels.materiel')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($demande) => [
                'id' => $demande->id,
                'user_id' => $demande->user_id,
                'created_at' => $demande->created_at,
                'status' => $demande->status,
                'materials' => $demande->materiels->map(fn($dm) => [
                    'id' => $dm->id,
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
    /**
     * Récupérer les demandes à valider selon le rôle
     */
public function getRequestsForValidation(Request $request)
{
    $user = $request->user();
    if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

    $roleStatusMap = [
        'directeur' => ['status' => 'en_attente', 'field' => 'directeur_id'],
        'gestionnaire_stock' => ['status' => 'en_attente_stock', 'field' => null],
        'daaf' => ['status' => 'en_attente_daaf', 'field' => 'daaf_id'],
        'secretaire_executif' => ['status' => 'en_attente_secretaire', 'field' => 'secretaire_id'],
    ];

    if (!isset($roleStatusMap[$user->role])) {
        return response()->json(['message' => 'Accès non autorisé'], 403);
    }

    $status = $roleStatusMap[$user->role]['status'];
    $roleField = $roleStatusMap[$user->role]['field'];

    try {
        $demandes = Demande::with(['materiels.materiel', 'user'])
            ->when($roleField, function($query) use ($roleField, $user) {
                $query->where($roleField, $user->id);
            })
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($demande) {
                return [
                    'id' => $demande->id,
                    'user_name' => $demande->user->name ?? 'Utilisateur inconnu',
                    'created_at' => $demande->created_at,
                    'status' => $demande->status,
                    'materials' => $demande->materiels->map(function($dm) {
                        return [
                            'id' => $dm->id,
                            'name' => $dm->materiel->nom ?? 'Nom indisponible',
                            'quantity' => $dm->quantite_demandee ?? 0,
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
    ]);

    $role = $user->role;

    // Sauvegarde commentaire et date pour ce rôle
    $commentField = 'commentaire_' . $role;
    if (Schema::hasColumn('demandes', $commentField)) {
        $demande->$commentField = $validated['commentaire'] ?? null;
    }

    $dateField = 'date_validation_' . $role;
    if (Schema::hasColumn('demandes', $dateField)) {
        $demande->$dateField = now();
    }

    if ($validated['status'] === 'validee') {
        // Valider tous les matériels
        foreach ($demande->materiels as $dm) {
            $dm->quantite_validee = $dm->quantite_demandee;
            $dm->save();
        }

        // Déterminer le rôle suivant et assigner la demande
        switch ($role) {
            case 'directeur':
                $nextRole = 'gestionnaire_stock';
                $demande->status = 'en_attente_stock';
                $nextUser = User::where('role', $nextRole)->first();
                if ($nextUser && Schema::hasColumn('demandes', $nextRole . '_id')) {
                    $demande->{$nextRole . '_id'} = $nextUser->id;
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
            'status' => 'required|in:validee,rejetee',
            'commentaire' => 'nullable|string|max:500',
            'quantite_demandee' => 'nullable|integer|min:1'
        ]);

        $demande = Demande::with('materiels.materiel')->find($demandeId);
        if (!$demande) return response()->json(['message' => 'Demande non trouvée'], 404);

        $dm = DemandeMateriel::firstOrCreate(
            ['demande_id' => $demandeId, 'materiel_id' => $materielId],
            [
                'quantite_demandee' => $validated['quantite_demandee'] ?? 1,
                'justification' => 'Ajout automatique pour validation'
            ]
        );

        $dm->quantite_validee = $validated['status'] === 'validee' ? $dm->quantite_demandee : 0;
        $dm->commentaire = $validated['commentaire'] ?? null;
        $dm->{'date_validation_' . $role} = now();
        $dm->save();

        // Vérifier l'état global
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
            $demande->status = $nextStatusMap[$role] ?? 'validee';
        } elseif ($allRejected) {
            $demande->status = 'rejetee';
        } else {
            $demande->status = 'en_attente_' . $role;
        }

        $demande->save();

        return response()->json([
            'status' => 'success',
            'message' => "Matériel {$validated['status']} par {$role}",
            'demande' => $demande->load('materiels.materiel')
        ]);
    }
}
