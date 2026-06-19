<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservationRequest;
use App\Mail\NewReservationMail;
use App\Models\Setting;
use App\Services\ContractScanService;
use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Models\Reservation;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservitionService,
        protected ContractScanService $contractScanService
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
        $payload = $request->all();

        if ($request->hasFile('driver2_cin_recto')) {
            $payload['driver2_cin_recto'] = $request->file('driver2_cin_recto')->store('Vehicles', 'public');
        }
        if ($request->hasFile('driver2_cin_verso')) {
            $payload['driver2_cin_verso'] = $request->file('driver2_cin_verso')->store('Vehicles', 'public');
        }
        if ($request->hasFile('driver2_permi_recto')) {
            $payload['driver2_permi_recto'] = $request->file('driver2_permi_recto')->store('Vehicles', 'public');
        }
        if ($request->hasFile('driver2_permi_verso')) {
            $payload['driver2_permi_verso'] = $request->file('driver2_permi_verso')->store('Vehicles', 'public');
        }

        $data = $this->reservitionService->makeReservation($id, $payload);
        if($data === 'cin_missing'){
            return response()->json([
                'status'=>'failed',
                'message'=>'Veuillez ajouter votre CIN (recto et verso) dans votre profil avant de réserver.'
            ], 400);
        }
        if($data === 'permi_missing'){
            return response()->json([
                'status'=>'failed',
                'message'=>'Veuillez ajouter votre permis de conduire (recto et verso) dans votre profil avant de réserver.'
            ], 400);
        }
        if($data === 'license_too_recent'){
            return response()->json([
                'status'=>'failed',
                'message'=>'Vous devez avoir votre permis de conduire depuis au moins 2 ans pour pouvoir réserver un véhicule.'
            ], 400);
        }
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
        try {
            $reservation = $data->load(['user', 'vehicle']);
            $adminEmail = Setting::where('key', 'email')->value('value') ?? config('mail.from.address');
            Mail::to($adminEmail)->send(new NewReservationMail($reservation));
        } catch (\Throwable $e) {
            // Email notification failure does not block reservation
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

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function getReservedDates($id)
    {
        $dates = Reservation::where('vehicle_id', $id)
            ->where('status', 'Confirmée')
            ->get(['start_date', 'end_date']);

        return response()->json([
            'status' => 'success',
            'data' => $dates
        ]);
    }

    public function finalize($id, Request $request)
    {
        $request->validate(['km_driven' => 'required|integer|min:0']);

        $data = $this->reservitionService->finalizeReservation($id, $request->km_driven);

        if (!$data) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Impossible de finaliser cette réservation.'
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Réservation finalisée avec succès.',
            'data' => $data,
        ]);
    }

    public function uploadContractScans(Request $request, $id)
    {
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'required|image|mimes:jpg,jpeg,png|max:10240',
        ]);

        $reservation = Reservation::findOrFail($id);

        $relativePath = $this->contractScanService->generateFromImages(
            $reservation,
            $request->file('images')
        );

        $reservation->update(['contract_pdf' => $relativePath]);

        return response()->json([
            'status' => 'success',
            'message' => 'Contrat scanné créé avec succès.',
            'data' => $reservation->fresh()->load(['user', 'vehicle', 'vehicle.pictures']),
        ]);
    }

    public function downloadContract($id)
    {
        $reservation = Reservation::findOrFail($id);

        if (!$reservation->contract_pdf) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun contrat trouvé pour cette réservation.'
            ], 404);
        }

        if (!Storage::disk('public')->exists($reservation->contract_pdf)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le fichier du contrat n\'existe plus.'
            ], 404);
        }

        return Storage::disk('public')->download($reservation->contract_pdf);
    }

}


