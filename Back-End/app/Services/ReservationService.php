<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Vehicle;
use DateTime;
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
        $reservations = Reservation::with('user','vehicle');
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

       $days  = (new DateTime($data['start_date']))->diff(new DateTime($data['end_date']))->days;
       $total = $days * $vehicle->pricePerDay;




   $Reservation=Reservation::create(
    array_merge($data, [
        'user_id'    => auth()->id(),
        'vehicle_id' => $id,
        'TotalPrice'=>$total
    ])
);

return $Reservation;
}

    public function acceptReservition($id){
        $reservition = Reservation::findOrFail($id);
        $reservition->update([
            'status'=>'Confirmée'
        ]);
        return $reservition;
    }

    public function refuseReservition($id){
        $reservaition = Reservation::findOrFail($id);
       if ($reservaition->start_date < now()->addHours(48)) {
            return false;
            }

        $reservaition->update([
            'status'=>'Annulée'
        ]);
        return $reservaition;
    }

     public function filterReservation($request) {
        $query = Reservation::query();


        $query->when($request->filled('start_date'), function ($q) use ($request) {
            $q->where('start_date', '>=', $request->start_date);
        });
        $query->when($request->filled('end_date'), function ($q) use ($request) {
            $q->where('end_date','<=',$request->end_date);
        });

        $query->when($request->filled('end_date'), function ($q) use ($request) {
            $q->where('end_date','<=',$request->end_date);
        });

        // $query->when($request->filled('vehicle_id')->vehicle(), function ($q) use ($request) {
        //     $q->where('vehicle_id',"%{$request->model}%");
        // });
         $query->when($request->filled('my_reservations'), function ($q) {
        $q->where('user_id', auth()->id());
       });

        $query->when($request->filled('vehicle_name'), function ($q) use ($request) {
        $q->whereHas('vehicle', function ($q) use ($request) {
            $q->where('name', 'LIKE', "%{$request->vehicle_name}%");
         });

        });



        $reservation = $query->get();

        return $reservation;

    }

}
