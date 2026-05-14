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
    public function myReservetion(){
        $data=Reservation::where('user_id',auth()->id())->get();
        return $data;
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

    public function makeReservation($id,$data)
{
    $vehicle = Vehicle::findOrFail($id);

    $conflict = $vehicle->reservations()
        ->where('status', '=', 'Confirmée')
        ->where('start_date', '<', $data['end_date'])
        ->where('end_date', '>', $data['start_date'])
        ->exists();

    if ($conflict) {
        throw new \Exception('Ce véhicule est déjà réservé pour ces dates.');
    }

   return Reservation::create(
    array_merge($data, [
        'user_id'    => auth()->id(),
        'vehicle_id' => $id,
    ])
);

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


