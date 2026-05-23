<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Vehicle;
use DateTime;
use app\Http\Requests\ReservationRequest;
use function Illuminate\Support\days;

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
        $data = Reservation::with(['vehicle', 'vehicle.pictures'])
                           ->where('user_id', auth()->id())
                           ->get();
        foreach ($data as $reservation) {
            if (now() > $reservation->end_date && $reservation->status !== 'Terminée') {
                $reservation->update([
                    'status' => 'Terminée'
                ]);
            }
        }
        return $data;
    }
    public function getAllReservition(){
        $reservations = Reservation::with('user','vehicle')->get();
        foreach($reservations as $reservation){
            if(now() > $reservation->end_date && $reservation->status !== 'Terminée'){
                $reservation->update([
                    'status'=>'Terminée'
                ]);
            }
        }
        return $reservations;
    }

   public function makeReservation($id, $data)
{
    $vehicle = Vehicle::findOrFail($id);



    $conflict = $vehicle->reservations()
        ->where('status', '=', 'Confirmée')
        ->where('end_date', '>', $data['start_date'])
        ->where('start_date', '<', $data['end_date'])
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
    if($data['start_date']==$data['end_date']){
        return false;
    }

    $days  = (new DateTime($data['start_date']))->diff(new DateTime($data['end_date']))->days;
    $total = $days * $vehicle->pricePerDay;

    $Reservation = Reservation::create(
        array_merge($data, [
            'user_id'    => auth()->id(),
            'vehicle_id' => $id,
            'TotalPrice' => $total
        ])
    );

    return $Reservation;
}






   public function acceptReservition($id)
{
    $reservition = Reservation::with(['user', 'vehicle'])->findOrFail($id);

    $athoreReservations = Reservation::where('start_date', $reservition->start_date)
        ->where('end_date', $reservition->end_date)
        ->where('vehicle_id', $reservition->vehicle_id)
        ->where('id', '!=', $id)
        ->pluck('id');

    $reservition->update(['status' => 'Confirmée']);

    Reservation::whereIn('id', $athoreReservations)
        ->update(['status' => 'Annulée']);

    return $reservition;
}

    public function refuseReservition($id){
        $reservaition = Reservation::findOrFail($id);
       if (\Carbon\Carbon::parse($reservaition->start_date) < now()->addHours(48)) {
            return false;
            }

        $reservaition->update([
            'status'=>'Annulée'
        ]);
        return $reservaition;
    }

    public function AdminRefuseReservition($id){
            $reservaition = Reservation::findOrFail($id);

        $reservaition->update([
            'status'=>'Annulée'
        ]);
        return $reservaition;
    }


     public function filterMyReservation($request) {
        Reservation::where('user_id', auth()->id())
            ->where('end_date', '<', now())
            ->where('status', '!=', 'Terminée')
            ->where('status', '!=', 'Annulée')
            ->update(['status' => 'Terminée']);

        $query = Reservation::query()->with(['vehicle', 'vehicle.pictures'])
                                     ->where('user_id', auth()->id());
        $query = Reservation::query()->with('vehicle');


        $query->when($request->filled('start_date'), function ($q) use ($request) {
            $q->where('start_date', '>=', $request->start_date);
        });
        $query->when($request->filled('end_date'), function ($q) use ($request) {
            $q->where('end_date','<=',$request->end_date);
        });

        $query->when($request->filled('status'), function ($q) use ($request) {
            $q->where('status',$request->status);
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



    public function filterAllReservation($request) {
        $query = Reservation::query()->with('vehicle');

        $query->when($request->filled('start_date'), function ($q) use ($request) {
            $q->where('start_date', '>=', $request->start_date);
        });
        $query->when($request->filled('end_date'), function ($q) use ($request) {
            $q->where('end_date','<=',$request->end_date);
        });

         $query->when($request->filled('status'), function ($q) use ($request) {
            $q->where('status',$request->status);
        });

        $query->when($request->filled('end_date'), function ($q) use ($request) {
            $q->where('end_date','<=',$request->end_date);
        });


        $query->when($request->filled('vehicle_marque'), function ($q) use ($request) {
        $q->whereHas('vehicle', function ($q) use ($request) {
            $q->where('marque', 'LIKE', "%{$request->vehicle_marque}%");
         });

        });



        $reservation = $query->get();

        return $reservation;

    }

}
