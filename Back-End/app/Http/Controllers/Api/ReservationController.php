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
        if($data===1){
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
        if(!$data){
             return response()->json([
        'message' => 'Vous ne pouvez pas annuler une réservation moins de 48h avant le début.'
            ], 403);
        }
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function annulleReservation($id)
    {
        $data = $this->reservitionService->AdminRefuseReservition($id);

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function filterUserReservation(Request $request){
        $data=$this->reservitionService->filterMyReservation($request);

        if(empty($data)){
            return response()->json([
                'message'=>'Aucan reservation',
            ]);
        }
        return response()->json([
            'data'=>$data
        ]);
    }

    public function filterAdminReservation(Request $request){
           $data=$this->reservitionService->filterAllReservation($request);

        if(empty($data)){
            return response()->json([
                'message'=>'Aucan reservation',
            ]);
        }
        return response()->json([
            'data'=>$data
        ]);
    }

    public function getReservedDates($id)
    {
        $dates = \App\Models\Reservation::where('vehicle_id', $id)
            ->where('status', 'Confirmée')
            ->get(['start_date', 'end_date']);

        return response()->json([
            'status' => 'success',
            'data' => $dates
        ]);
    }

}


