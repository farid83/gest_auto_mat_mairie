<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Direction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', "%{$request->search}%");
        }

        if ($request->filled('direction_id')) {
            $query->where('direction_id', $request->direction_id);
        }

        $services = $query->with('direction')
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json($services);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'direction_id' => 'required|exists:directions,id',
            'description' => 'nullable|string',
        ]);

        $service = Service::create($validated);

        return response()->json([
            'service' => $service->load('direction'),
            'message' => 'Service créé avec succès',
        ]);
    }

    public function show(string $id)
    {
        $service = Service::with(['direction', 'users'])->findOrFail($id);
        return response()->json($service);
    }

    public function update(Request $request, string $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100', Rule::unique('services')->ignore($service->id)],
            'direction_id' => 'sometimes|exists:directions,id',
            'description' => 'nullable|string',
        ]);

        $service->update($validated);

        return response()->json([
            'service' => $service->load('direction'),
            'message' => 'Service mis à jour avec succès',
        ]);
    }

    public function destroy(string $id)
    {
        $service = Service::findOrFail($id);
        
        if ($service->users()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer ce service car il contient encore des utilisateurs',
            ], 422);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service supprimé avec succès',
        ]);
    }

    public function getByDirection($directionId)
    {
        $services = Service::where('direction_id', $directionId)
            ->orderBy('name')
            ->get();

        return response()->json($services);
    }
}