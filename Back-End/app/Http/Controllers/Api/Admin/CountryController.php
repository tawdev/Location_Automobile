<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Country::with('cities')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:countries,name',
        ]);

        $country = Country::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pays créé avec succès',
            'data' => $country,
        ], 201);
    }

    public function show(Country $country)
    {
        return response()->json([
            'status' => 'success',
            'data' => $country->load('cities'),
        ]);
    }

    public function update(Request $request, Country $country)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:countries,name,' . $country->id,
        ]);

        $country->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pays mis à jour avec succès',
            'data' => $country,
        ]);
    }

    public function destroy(Country $country)
    {
        $country->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pays supprimé avec succès',
        ]);
    }
}
