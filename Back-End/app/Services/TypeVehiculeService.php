<?php

namespace App\Services;

use App\Models\TypeVehicule;

class TypeVehiculeService
{
    public function __construct()
    {
        //
    }

    public function getAll()
    {
        return TypeVehicule::all();
    }

    public function ValidateTypeVehicule($request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255']
        ]);
        return $validated;
    }

    public function findById($id)
    {
        return TypeVehicule::find($id);
    }

    public function getErrorResponse()
    {
        return response()->json([
            'message' => 'error',
            'data' => 'Aucun type de véhicule trouvé'
        ]);
    }

    public function getExistingError()
    {
        return response()->json([
            'message' => 'error',
            'data' => 'Ce type de véhicule existe déjà'
        ]);
    }
}
