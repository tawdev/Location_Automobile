<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservationRequest;
use App\Services\ReservationService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservitionService
    ) {}

    public function index()
    {
        $data=$this->reservitionService->myReservetion();
        return response()->json([
            'status'=>'success',
            'data'=>$data
        ]);
    }

    public function store(ReservationRequest $request,$id)
    {

        $data = $this->reservitionService->makeReservation($id, $request->all());
        if(!$data){
             return response()->json([
        'status'=>'failed',
        'message' => 'Ce véhicule est déjà réservé pour ces dates.'
    ], 400);
        }
        if($data=1){
                 return response()->json([
                'status'=>'failed',
                'message'=>'Reservation est deja existe'
            ],400);
        }
        return response()->json([
            'status' => 'success',
            'message' => 'Reservation créée avec succès',
            'data' => $data,
        ], 201);
    }

    public function show($id)
    {
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }

    public function annulleMyReservation($id)
    {
        $data = $this->reservitionService->refuseReservition($id);
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

}
