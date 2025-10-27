<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MouvementStock;
use App\Models\Materiel;
use Illuminate\Support\Str;

class MouvementStockController extends Controller
{


    public function index()
    {
        $mouvements = MouvementStock::with('materiel', 'user')->get();
        return response()->json($mouvements);
    }

    public function store(Request $request)
    {
        $rawType = $request->input('type', '');
        $key = Str::of($rawType)->ascii()->lower();
        if ($key === 'entree') {
            $request->merge(['type' => 'Entrée']);
        } elseif ($key === 'sortie') {
            $request->merge(['type' => 'Sortie']);
        }
        $validated = $request->validate([
            'type'        => 'required|in:Entrée,Sortie',
            'materiel_id' => 'required|exists:materiels,id',
            'quantity' => 'required|integer|min:1',
            'date' => 'required|date',
        ]);

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

    public function show(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }
}
