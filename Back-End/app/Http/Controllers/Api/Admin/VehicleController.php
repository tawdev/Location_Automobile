<?php

namespace app\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehicleRequest;
use App\Models\Vehicle;
use App\Services\ReservationService;
use App\Services\VehicleService;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function __construct(
        protected VehicleService $vehicleService,
        protected ReservationService $reservitionService
    ) {}

    public function index()
    {
       $data= $this->vehicleService->getAll();
         return response()->json([
            'status'=>'success',
            'data'=>$data,
         ]);
    }

    public function store(VehicleRequest $request)
    {
       $data=$this->vehicleService->CreateVehicle($request->all());
       return response()->json([
        'status'=>'success',
        'message'=>'Vehicle créée avec succès',
        'data'=>$data,
       ],201);
    }
    public function update(VehicleRequest $request,$id){
        $Validate=$request->validated();

        $data=$this->vehicleService->UpdateVehicle($id,$Validate);
        return response()->json([
            'status'=>'success',
            'message'=>'Vehicle mise à jour avec succès',
            'data'=>$data
        ]);
    }

    public function destroy($id){
    $isDeleted =  $this->vehicleService->DeleteVehicle($id);
    if(!$isDeleted) {
        return response()->json([
            'status'=>'error',
            'message'=>'La suppression du véhicule a échoué.',
        ]);
    }

    return response()->json([
            'status'=>'success',
            'message'=>'Vehicle supprimée avec succès',
        ],200);
    }

    public function displayReservition(){
        $data=$this->reservitionService->getAllReservition();
        return response()->json([
            'status'=>'success',
            'data'=>$data
        ]);
    }

    public function confirmeReservation($id){
        $data=$this->reservitionService->acceptReservition($id);
        return response()->json([
            'status'=>'success',
            'data'=>$data,
        ]);
    }

    public function annulleReservation($id){
        $data=$this->reservitionService->refuseReservition($id);
        return response()->json([
            'status'=>'success',
            'data'=>$data,
        ]);
    }
}
