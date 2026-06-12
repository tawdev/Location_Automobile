<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DepartureCondition;
use Illuminate\Http\Request;

class DepartureConditionController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => DepartureCondition::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $condition = DepartureCondition::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Condition créée avec succès',
            'data' => $condition,
        ], 201);
    }

    public function show(DepartureCondition $departureCondition)
    {
        return response()->json([
            'status' => 'success',
            'data' => $departureCondition,
        ]);
    }

    public function update(Request $request, DepartureCondition $departureCondition)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $departureCondition->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Condition mise à jour avec succès',
            'data' => $departureCondition,
        ]);
    }

    public function destroy(DepartureCondition $departureCondition)
    {
        $departureCondition->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Condition supprimée avec succès',
        ]);
    }
}
