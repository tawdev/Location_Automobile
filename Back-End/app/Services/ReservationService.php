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
        $reservations = Reservation::with('user','vehicle')->get();
        foreach($reservations as $reservation){
            if(now() > $reservation->end_date){
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
        ->where('end_date', '>', $data['start_date'])
        ->where('start_date','<',$data['end_date'])
        ->exists();

        $alreadyExists = Reservation::where('user_id', auth()->id())
            ->where('vehicle_id', $id)
            ->where('start_date', $data['start_date'])
            ->where('end_date', $data['end_date'])
            ->exists();

        if ($alreadyExists) {
            return 1;
        }

        if ($conflict) {
            return false;
        }




   $Reservation=Reservation::create(
    array_merge($data, [
        'user_id'    => auth()->id(),
        'vehicle_id' => $id,
    ])
);

return $Reservation->with('user');
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
