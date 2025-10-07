<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Livraison;
use App\Models\Demande;
use App\Models\User;

class LivraisonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $livraisons = Livraison::with([
            'demande.user',
            'user',
            'materiels' => function ($q) {
                $q->withPivot('quantite_demandee', 'quantite_livree');
            }
        ])
            ->when($user->role !== 'admin', function ($query) use ($user) {
                if (!in_array($user->role, ['admin', 'gestionnaire_stock'])) {
                    $query->where('user_id', $user->id);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Liste des livraisons',
            'livraisons' => $livraisons
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

    // 🔹 Récupérer les données du JSON ou du formulaire
    $input = $request->all(); // Laravel merge automatiquement JSON + POST data

    // 🔹 Validation
    $validated = validator($input, [
        'demande_id' => 'required|exists:demandes,id',
        'statut' => 'required|in:en_cours,livree,annulee',
        'date_livraison' => 'nullable|date',
        'commentaire' => 'nullable|string|max:500',
    ])->validate();

    $validated['user_id'] = $user->id;

    // 🔹 Création de la livraison
    $livraison = Livraison::create($validated);

    // 🔹 Attachement des matériels validés de la demande
    $demande = Demande::with('materiels')->find($validated['demande_id']);

    foreach ($demande->materiels as $materiel) {
        if ($materiel->status === 'validee_finale') {
            $livraison->materiels()->attach($materiel->materiel_id, [
                'quantite_demandee' => $materiel->quantite_demandee,
                'quantite_livree'   => $materiel->quantite_validee,
            ]);
        }
    }

    return response()->json([
        'message' => 'Livraison créée avec succès',
        'livraison' => $livraison->load([
            'demande.user',
            'user',
            'materiels' => function ($q) {
                $q->withPivot('quantite_demandee', 'quantite_livree');
            }
        ])
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $livraison = Livraison::with([
            'demande.user',
            'user',
            'materiels' => function ($q) {
                $q->withPivot('quantite_demandee', 'quantite_livree');
            }
        ])->find($id);

        if (!$livraison) {
            return response()->json(['message' => 'Livraison non trouvée'], 404);
        }

        return response()->json([
            'message' => 'Détails de la livraison',
            'livraison' => $livraison
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $livraison = Livraison::find($id);
        if (!$livraison) {
            return response()->json(['message' => 'Livraison non trouvée'], 404);
        }

        // Vérifier les permissions
        if ($user->role !== 'admin' && $livraison->user_id !== $user->id) {
            return response()->json(['message' => 'Permission refusée'], 403);
        }

        $validated = $request->validate([
            'statut' => 'sometimes|in:en_cours,livree,annulee',
            'date_livraison' => 'nullable|date',
            'commentaire' => 'nullable|string|max:500',
        ]);

        $livraison->update($validated);

        return response()->json([
            'message' => 'Livraison mise à jour avec succès',
            'livraison' => $livraison->load([
                'demande.user',
                'user',
                'materiels' => function ($q) {
                    $q->withPivot('quantite_demandee', 'quantite_livree');
                }
            ])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $livraison = Livraison::find($id);
        if (!$livraison) {
            return response()->json(['message' => 'Livraison non trouvée'], 404);
        }

        // Vérifier les permissions
        if ($user->role !== 'admin' && $livraison->user_id !== $user->id) {
            return response()->json(['message' => 'Permission refusée'], 403);
        }

        $livraison->delete();

        return response()->json(['message' => 'Livraison supprimée avec succès']);
    }

    /**
     * Marquer une livraison comme terminée
     */
    public function markAsDelivered(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Utilisateur non authentifié'], 401);

        $livraison = Livraison::find($id);
        if (!$livraison) {
            return response()->json(['message' => 'Livraison non trouvée'], 404);
        }

        $livraison->update([
            'statut' => 'livree',
            'date_livraison' => now(),
        ]);

        return response()->json([
            'message' => 'Livraison marquée comme terminée',
            'livraison' => $livraison->load([
                'demande.user',
                'user',
                'materiels' => function ($q) {
                    $q->withPivot('quantite_demandee', 'quantite_livree');
                }
            ])
        ]);
    }
}
