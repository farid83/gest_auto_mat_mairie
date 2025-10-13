<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Direction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DirectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $directions = Direction::withCount('services', 'users')->get();
        return response()->json($directions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:directions,name',
            'description' => 'nullable|string',
        ]);

        $direction = Direction::create($validated);

        return response()->json([
            'direction' => $direction,
            'message' => 'Direction créée avec succès',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $direction = Direction::with(['services', 'users'])->findOrFail($id);
        return response()->json($direction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $direction = Direction::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100', Rule::unique('directions')->ignore($direction->id)],
            'description' => 'nullable|string',
        ]);

        $direction->update($validated);

        return response()->json([
            'direction' => $direction,
            'message' => 'Direction mise à jour avec succès',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $direction = Direction::findOrFail($id);
        
        // Check if direction has related services or users
        if ($direction->services()->count() > 0 || $direction->users()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cette direction car elle contient encore des services ou des utilisateurs',
            ], 422);
        }

        $direction->delete();

        return response()->json([
            'message' => 'Direction supprimée avec succès',
        ]);
    }
}
