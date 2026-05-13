<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehicleRequest;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function __construct(
        protected VehicleService $vehicleService
    ) {
    }

    public function index()
    {
        $data = $this->vehicleService->getAll();
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function store(VehicleRequest $request)
    {

        $data = $this->vehicleService->CreateVehicle($request);
        if ($data) {
            return response()->json([
                'status' => 'success',
                'message' => 'Vehicle créée avec succès',
                'data' => $data,
            ], 201);
        }
        return response()->json([
            'status' => 'error',
            'message' => 'Error dans La creation du Vehicle',
            'data' => $data,
        ]);
    }
    public function update(VehicleRequest $request, $id)
    {
        $Validate = $request->validated();

        $data = $this->vehicleService->UpdateVehicle($id, $Validate);
        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle mise à jour avec succès',
            'data' => $data
        ]);
    }

    public function destroy(Request $request)
    {
        $isDeleted = $this->vehicleService->DeleteVehicle($request->id);
        if (!$isDeleted) {
            return response()->json([
                'status' => 'error',
                'message' => 'vehicle deleting proccess failed',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle supprimée avec succès',
        ], 200);
    }
}
