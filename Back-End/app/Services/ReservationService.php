<?php

namespace App\Services;

use App\Models\Extra;
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
        $reservations = Reservation::with('user','vehicle', 'vehicle.pictures')->get();
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
    $startDate = new DateTime($data['start_date']);
    $endDate = new DateTime($data['end_date']);
    $days = $startDate->diff($endDate)->days;
    if ($days < 3) {
        return false;
    }

    $hasTwoDrivers = !empty($data['driver2_name']);

    if (!$hasTwoDrivers) {
        if(!auth()->user()->cin_recto || !auth()->user()->cin_verso){
            return 'cin_missing';
        }
        if(!auth()->user()->permi_recto || !auth()->user()->permi_verso){
            return 'permi_missing';
        }
    }

    $licenseIssueDate = !empty($data['date_delivrance']) ? $data['date_delivrance'] : auth()->user()->license_issue_date;
    if ($licenseIssueDate) {
        $now = new DateTime();
        $issueDate = new DateTime($licenseIssueDate);
        $interval = $issueDate->diff($now);
        if ($interval->y < 2) {
            return 'license_too_recent';
        }
    } else {
        return 'license_too_recent';
    }

    $days = $days > 0 ? $days : 3;

    $extraPricePerDay = 0;
    $extraIds = $data['extra_ids'] ?? [];
    if (!empty($extraIds)) {
        $extraPricePerDay = Extra::whereIn('id', $extraIds)->sum('price_per_day');
    }

    $total = $days * ($vehicle->pricePerDay + $extraPricePerDay);
    $kmIncluded = $days * 200;

    // Handle client info - create/update client record
    $clientData = [];
    if (!empty($data['nom_prenom'])) {
        $clientData = [
            'user_id' => auth()->id(),
            'nom_prenom' => $data['nom_prenom'],
            'date_naissance' => $data['date_naissance'],
            'cin_passport' => $data['cin_passport'],
            'adresse' => $data['adresse'],
            'telephone' => $data['telephone'],
            'numero_permi' => $data['numero_permi'],
            'date_delivrance' => $data['date_delivrance'],
            'date_expiration' => $data['date_expiration'],
        ];
    }

    // Build reservation data
    $reservationData = array_merge($data, [
        'user_id'    => auth()->id(),
        'vehicle_id' => $id,
        'TotalPrice' => $total,
        'km_included' => $kmIncluded,
    ]);

    // If client data provided, create/update client and associate
    if (!empty($clientData)) {
        $client = \App\Models\Client::updateOrCreate(
            ['user_id' => auth()->id()],
            $clientData
        );
        $reservationData['client_id'] = $client->id;
    }

    // Remove fields that are not in the reservations table
    unset($reservationData['extra_ids']);
    unset($reservationData['driver2_name']);
    unset($reservationData['driver2_cin_recto']);
    unset($reservationData['driver2_cin_verso']);
    unset($reservationData['driver2_permi_recto']);
    unset($reservationData['driver2_permi_verso']);

    $Reservation = Reservation::create($reservationData);

    if (!empty($extraIds)) {
        $Reservation->extras()->sync($extraIds);
    }

    return $Reservation;
}

public function finalizeReservation($id, $kmDriven)
{
    $reservation = Reservation::findOrFail($id);

    if ($reservation->status !== 'Confirmée') {
        return false;
    }

    $overage = max(0, $kmDriven - $reservation->km_included);
    $overageCharge = $overage > 0 ? 100 : 0;

    $reservation->update([
        'km_driven'         => $kmDriven,
        'km_overage_charge' => $overageCharge,
        'TotalPrice'        => $reservation->TotalPrice + $overageCharge,
    ]);

    return $reservation;
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
        $query = Reservation::query()->with('user', 'vehicle', 'vehicle.pictures');

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
