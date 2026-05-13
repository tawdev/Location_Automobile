<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Vehicle;
use app\Http\Requests\ReservationRequest;

class ReservationService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }
    public function getAllReservition(){
        $reservations = Reservation::all();
        foreach($reservations as $reservation){
            if(now() >= $reservation->end_date){
                $reservation->update([
                    'status'=>'Términée'
                ]);
            }
        }
        return $reservations;
    }

    public function makeReservation($data,$id){
        $vehicle=Vehicle::findOrFail($id);
        if($vehicle->reservations()->end_date < $data['end_date']){
            $reservation=Reservation::create(array_merge($data,
            [
                'user_id'=>auth()->id,
                'vehicle_id'=>$id
            ]
            ));
            return $reservation;
        }



    }
    public function acceptReservition($id){
        $reservition = Reservation::findOrFail($id);
        $reservition->update([
            'status'=>'Confirmée'
        ]);
        return $reservition;
    }

    public function refuseReservition($id){
        $reservition = Reservation::findOrFail($id);
        $reservition->update([
            'status'=>'Annulée'
        ]);
        return $reservition;
    }
}


