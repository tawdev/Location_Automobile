<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        try {
            $totalVehicles = Vehicle::count();
            $totalReservations = Reservation::count();
            $totalClients = User::where('role_id', 2)->count();

            $totalRevenue = Reservation::whereIn('status', ['Confirmée', 'Terminée'])
                ->sum('TotalPrice');

            $reservationsByStatus = [
                'En_Attente' => Reservation::where('status', 'En_Attente')->count(),
                'Confirmée'  => Reservation::where('status', 'Confirmée')->count(),
                'Annulée'    => Reservation::where('status', 'Annulée')->count(),
                'Terminée'   => Reservation::where('status', 'Terminée')->count(),
            ];

            $monthlyRevenue = Reservation::whereIn('status', ['Confirmée', 'Terminée'])
                ->selectRaw("DATE_FORMAT(start_date, '%Y-%m') as month, SUM(TotalPrice) as revenue")
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get()
                ->map(function ($item) {
                    return [
                        'month'   => $item->month,
                        'revenue' => (float) $item->revenue,
                    ];
                });

            $recentReservations = Reservation::with('user', 'vehicle', 'vehicle.pictures')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($r) {
                    return [
                        'id'         => $r->id,
                        'start_date' => $r->start_date,
                        'end_date'   => $r->end_date,
                        'status'     => $r->status,
                        'TotalPrice' => $r->TotalPrice,
                        'user'       => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name, 'email' => $r->user->email] : null,
                        'vehicle'    => $r->vehicle ? [
                            'id'      => $r->vehicle->id,
                            'marque'  => $r->vehicle->marque,
                            'model'   => $r->vehicle->model,
                        ] : null,
                    ];
                });

            $popularVehicles = Reservation::whereIn('status', ['Confirmée', 'Terminée'])
                ->selectRaw('vehicle_id, COUNT(*) as count')
                ->groupBy('vehicle_id')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $vehicle = Vehicle::with('pictures', 'category')->find($item->vehicle_id);
                    return [
                        'count'   => (int) $item->count,
                        'vehicle' => $vehicle ? [
                            'id'           => $vehicle->id,
                            'marque'       => $vehicle->marque,
                            'model'        => $vehicle->model,
                            'pricePerDay'  => $vehicle->pricePerDay,
                            'pictures'     => $vehicle->pictures,
                            'category'     => $vehicle->category,
                        ] : null,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'totalVehicles'       => $totalVehicles,
                    'totalReservations'   => $totalReservations,
                    'totalClients'        => $totalClients,
                    'totalRevenue'        => $totalRevenue,
                    'reservationsByStatus' => $reservationsByStatus,
                    'monthlyRevenue'      => $monthlyRevenue,
                    'recentReservations'  => $recentReservations,
                    'popularVehicles'     => $popularVehicles,
                ],
            ]);
        } catch (\Throwable $th) {
            Log::error('Dashboard stats error: ' . $th->getMessage(), [
                'file' => $th->getFile(),
                'line' => $th->getLine(),
                'trace' => $th->getTraceAsString(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors du chargement des statistiques.',
            ], 500);
        }
    }
}
