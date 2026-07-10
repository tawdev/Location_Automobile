<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CityLocation;
use Illuminate\Http\Request;

class CityLocationController extends Controller
{
    public function index(Request $request)
    {
        $query = CityLocation::query();

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:airport,citycenter',
            'price' => 'nullable|numeric|min:0',
        ]);

        $location = CityLocation::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Emplacement créé avec succès',
            'data' => $location,
        ], 201);
    }

    public function show(CityLocation $cityLocation)
    {
        return response()->json([
            'status' => 'success',
            'data' => $cityLocation,
        ]);
    }

    public function update(Request $request, CityLocation $cityLocation)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:airport,citycenter',
            'price' => 'nullable|numeric|min:0',
        ]);

        $cityLocation->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Emplacement mis à jour avec succès',
            'data' => $cityLocation,
        ]);
    }

    public function destroy(CityLocation $cityLocation)
    {
        $cityLocation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Emplacement supprimé avec succès',
        ]);
    }
}
