<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Country;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index(Request $request)
    {
        $query = City::query();

        if ($request->filled('country_id')) {
            $query->where('country_id', $request->country_id);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'country_id' => 'required|exists:countries,id',
            'name' => 'required|string|max:255',
        ]);

        $city = City::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ville créée avec succès',
            'data' => $city,
        ], 201);
    }

    public function show(City $city)
    {
        return response()->json([
            'status' => 'success',
            'data' => $city,
        ]);
    }

    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'country_id' => 'sometimes|exists:countries,id',
            'name' => 'required|string|max:255',
        ]);

        $city->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ville mise à jour avec succès',
            'data' => $city,
        ]);
    }

    public function destroy(City $city)
    {
        $city->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Ville supprimée avec succès',
        ]);
    }
}
