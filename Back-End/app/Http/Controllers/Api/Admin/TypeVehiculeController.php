<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TypeVehicule;
use Illuminate\Http\Request;
use App\Services\TypeVehiculeService;

class TypeVehiculeController extends Controller
{
    public function __construct(protected TypeVehiculeService $typeVehiculeService)
    {
    }

    public function index()
    {
        $data = $this->typeVehiculeService->getAll();
        if (!$data) {
            return $this->typeVehiculeService->getErrorResponse();
        }
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->typeVehiculeService->ValidateTypeVehicule($request);

        $isFound = TypeVehicule::where('name', $validated['name'])->exists();
        if ($isFound) {
            return $this->typeVehiculeService->getExistingError();
        }
        $typeVehicule = TypeVehicule::create($validated);

        return response()->json([
            'message' => 'success',
            'data' => $typeVehicule
        ]);
    }

    public function show(string $id)
    {
        $typeVehicule = TypeVehicule::find($id);

        if (!$typeVehicule) {
            return $this->typeVehiculeService->getErrorResponse();
        }

        return response()->json([
            'message' => 'success',
            'data' => $typeVehicule
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $this->typeVehiculeService->ValidateTypeVehicule($request);

        $typeVehicule = TypeVehicule::find($id);

        if (!$typeVehicule) {
            return $this->typeVehiculeService->getErrorResponse();
        }

        $isFound = TypeVehicule::where('name', $validated['name'])->where('id', '!=', $id)->exists();

        if ($isFound) {
            return $this->typeVehiculeService->getExistingError();
        }

        $typeVehicule->update($validated);

        return response()->json([
            'message' => 'success',
            'data' => $typeVehicule
        ]);
    }

    public function destroy(string $id)
    {
        $typeVehicule = $this->typeVehiculeService->findById($id);

        if ($typeVehicule) {
            // Set type_vehicule_id to null for vehicles that reference this type
            $typeVehicule->vehicles()->update(['type_vehicule_id' => null]);
            $typeVehicule->delete();
            return response()->json([
                'message' => 'success',
                'data' => 'Type de véhicule supprimé avec succès'
            ]);
        }

        return $this->typeVehiculeService->getErrorResponse();
    }

    public function FilterByName(Request $request)
    {
        $validated = $this->typeVehiculeService->ValidateTypeVehicule($request);

        $types = TypeVehicule::where('name', 'LIKE', "%{$validated['name']}%")->get();

        if (!$types) {
            return $this->typeVehiculeService->getErrorResponse();
        }

        return response()->json([
            'message' => 'success',
            'data' => $types
        ]);
    }
}
