<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materiel;
use Illuminate\Http\Request;
use App\Models\MouvementStock;
use Illuminate\Support\Facades\Auth;

class MaterielController extends Controller
{
    // Afficher la liste de tous les matériels
    public function index()
    {
        $materiels = Materiel::all();
        return response()->json($materiels);
    }

    // Enregistrer un nouveau matériel dans la base
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'categorie' => 'required|string|max:255',
            'quantite_totale' => 'required|integer|min:0',
            'quantite_disponible' => 'required|integer|min:0',
            'etat' => 'required|string|max:255',
        ]);

         // ✅ Vérification AVANT insertion
    if (Materiel::whereRaw('LOWER(nom) = ?', [strtolower($request->nom)])->exists()) {
        return response()->json(['message' => 'Matériel déjà existant'], 409);
    }

        $materiel = Materiel::create([
            'nom' => $request->nom,
            'categorie' => $request->categorie,
            'quantite_totale' => $request->quantite_totale,
            'quantite_disponible' => $request->quantite_disponible,
            'etat' => $request->etat,
        ]);

        // Enregistrement automatique d’un mouvement de type "entrée"
        MouvementStock::create([
            'materiel_id' => $materiel->id,
            'user_id' => Auth::id(), // ou null si pas obligatoire
            'type' => 'Entrée',
            'quantity' => $materiel->quantite_totale,
            'description' => 'Ajout initial du matériel',
            'date'        => now(),
        ]);

        return response()->json([
            'message' => 'Matériel ajouté avec succès.',
            'data' => $materiel
        ], 201);
        \Log::info('Création matériel', $request->all());
    }

    // Mettre à jour un matériel
    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'quantite_totale' => 'required|integer|min:0',
            'quantite_disponible' => 'sometimes|integer|min:0',
            'etat' => 'nullable|string|max:255',
        ]);

        $materiel = Materiel::findOrFail($id);
        $materiel->update($request->only([
            'nom',
            'categorie',
            'quantite_totale',
            'quantite_disponible',
            'etat'
        ]));

        return response()->json([
            'message' => 'Matériel mis à jour avec succès.',
            'data' => $materiel
        ]);
    }

    // Supprimer un matériel
    public function destroy($id)
    {
        $materiel = Materiel::findOrFail($id);
        $materiel->delete();

        return response()->json([
            'message' => 'Matériel supprimé avec succès.'
        ]);
    }

    public function sortirStock(Request $request, Materiel $materiel)
    {
        $request->validate([
            'quantite' => 'required|integer|min:1',
        ]);

        if ($materiel->quantite_disponible < $request->quantite) {
            return response()->json(['message' => 'Quantité disponible insuffisante'], 400);
        }

        $materiel->quantite_disponible -= $request->quantite;
        $materiel->save();

        return response()->json($materiel);
    }

    public function entrerStock(Request $request, Materiel $materiel)
    {
        $request->validate([
            'quantite' => 'required|integer|min:1',
        ]);

        $materiel->quantite_disponible += $request->quantite;
        $materiel->save();

        return response()->json($materiel);
    }
}
