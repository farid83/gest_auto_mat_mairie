<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MouvementStock;
use App\Models\Materiel;
use Illuminate\Support\Str;

class MouvementStockController extends Controller
{


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $mouvements = MouvementStock::with('materiel', 'user')->get();
        return response()->json($mouvements);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        // 🔹 Normalisation du type
        $rawType = $request->input('type', '');
        $key = Str::of($rawType)->ascii()->lower(); // "Entrée" -> "entree", "Sortie" -> "sortie"
        if ($key === 'entree') {
            $request->merge(['type' => 'Entrée']);
        } elseif ($key === 'sortie') {
            $request->merge(['type' => 'Sortie']);
        }
        $validated = $request->validate([
            'type'        => 'required|in:Entrée,Sortie',
            'materiel_id' => 'required|exists:materiels,id',
            'quantity' => 'required|integer|min:1',
            // 'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
        ]);

        // Ajout automatique de l'user_id
        $validated['user_id'] = $request->user()->id;

        $materiel = Materiel::findOrFail($validated['materiel_id']);

        if ($validated['type'] === 'Entrée') {
            $materiel->quantite_total += $validated['quantity'];
            $materiel->quantite_disponible += $validated['quantity'];
        } else {
            if ($materiel->quantite_disponible < $validated['quantity']) {
                return response()->json(['error' => 'Quantité insuffisante en stock'], 400);
            }
            $materiel->quantite_disponible -= $validated['quantity'];
        }

        $materiel->save();

        $mouvement = MouvementStock::create($validated);

        return response()->json($mouvement->load('materiel'), 201);
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
