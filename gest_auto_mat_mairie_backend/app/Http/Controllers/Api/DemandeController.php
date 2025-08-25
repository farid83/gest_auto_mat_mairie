<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Valider les données de la requête
        $validatedData = $request->validate([
            'materials' => 'required|array',
            'materials.*.material' => 'required|string',
            'materials.*.quantity' => 'required|integer|min:1',
            'materials.*.justification' => 'required|string',
        ]);

        // Ici, vous pouvez implémenter la logique pour enregistrer la demande dans la base de données
        // Par exemple, créer une nouvelle entrée dans la table "demandes" et une entrée pour chaque matériel dans "demande_materiel"

        // Pour l'instant, nous allons simplement retourner les données validées
        return response()->json([
            'message' => 'Demande reçue avec succès',
            'data' => $validatedData
        ], 201);
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
