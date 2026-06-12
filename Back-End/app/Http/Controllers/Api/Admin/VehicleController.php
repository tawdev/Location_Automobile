<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehicleRequest;
use App\Models\Vehicle;
use App\Services\ReservationService;
use App\Services\VehicleService;
use Illuminate\Http\Request;
use App\Http\Requests\FilterVehiclesRequest;
use App\Models\Location;
class VehicleController extends Controller
{
    public function __construct(
        protected VehicleService $vehicleService,
        protected ReservationService $reservitionService
    ) {
    }

    public function index()
    {
        $Vehicles = $this->vehicleService->getAll();
        if (!$Vehicles) {
            return response()->json([
                'status' => 'success',
                'data' => "Aucun véhicule n'a été trouvé."
            ]);
        }
        return response()->json([
            'status' => 'success',
            'data' => $Vehicles
        ], 200);
    }

    public function show($id)
    {
        $vehicle = $this->vehicleService->getById($id);
        if (!$vehicle) {
            return response()->json([
                'status' => 'error',
                'message' => 'Véhicule non trouvé'
            ], 404);
        }
        return response()->json([
            'status' => 'success',
            'data' => $vehicle
        ], 200);
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
        ], 201);
    }
    public function update(VehicleRequest $request, Vehicle $Vehicle)
    {
        $Validate = $request->validated();
        $pictures = $request->file('images');

        $Vehicle = $this->vehicleService->UpdateVehicle($Vehicle, $Validate, $pictures);
        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle mise à jour avec succès',
            'data' => $Vehicle
        ], 202);
    }

    public function destroy($id)
    {
        $isDeleted = $this->vehicleService->DeleteVehicle($id);
        if (!$isDeleted) {
            return response()->json([
                'status' => 'error',
                'message' => 'La suppression du véhicule a échoué.',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle supprimée avec succès',
        ], 200);
    }

    public function displayReservition()
    {
        $data = $this->reservitionService->getAllReservition();
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function confirmeReservation($id)
    {
        $data = $this->reservitionService->acceptReservition($id);
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function annulleReservation($id)
    {
        $data = $this->reservitionService->refuseReservition($id);
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }



    public function filterVehicles(FilterVehiclesRequest $request)
    {

        $Vehicles = $this->vehicleService->filterVehicles($request);

        if (!count($Vehicles)) {
            return response()->json([
                'status' => 'success',
                'data' => 'Aucun véhicule trouvé'
            ], 200);
        }
        return response()->json([
            'status' => 'success',
            'data' => $Vehicles
        ], 200);
    }

    public function locations(Request $request)
    {
        $query = Vehicle::with('latestLocation', 'pictures');

        if ($request->filled('marque')) {
            $query->where('marque', 'LIKE', '%' . $request->input('marque') . '%');
        }

        $vehicles = $query->get()->map(function ($v) {
            $loc = $v->latestLocation;
            return [
                'id'        => $v->id,
                'marque'    => $v->marque,
                'model'     => $v->model,
                'registration' => $v->registration,
                'device_id' => $v->device_id,
                'picture'   => $v->pictures->first()?->path,
                'location'  => $loc ? [
                    'latitude'  => (float) $loc->latitude,
                    'longitude' => (float) $loc->longitude,
                    'speed'     => $loc->speed,
                    'heading'   => $loc->heading,
                    'updated_at'=> $loc->created_at,
                ] : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $vehicles,
        ]);
    }
}
