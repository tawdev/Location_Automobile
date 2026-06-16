<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationPicture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationPictureController extends Controller
{
    public function index(Reservation $reservation): JsonResponse
    {
        $pictures = $reservation->pictures()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $pictures,
        ]);
    }

    public function store(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:before,after'],
            'image' => ['required', 'image', 'max:5120'],
        ]);

        if ($validated['type'] === 'before' && $reservation->status === 'Terminée') {
            return response()->json([
                'message' => 'Impossible d\'ajouter des photos "Avant" pour une réservation terminée.',
            ], 422);
        }

        if ($validated['type'] === 'after') {
            if ($reservation->status === 'Terminée' && $reservation->end_date) {
                $daysSinceEnd = now()->diffInDays($reservation->end_date, false);
                if ($daysSinceEnd > 3) {
                    return response()->json([
                        'message' => 'Délai de 3 jours dépassé. Impossible d\'ajouter des photos "Après".',
                    ], 422);
                }
            }
        }

        $path = $request->file('image')->store('ReservationPictures', 'public');

        $picture = $reservation->pictures()->create([
            'type' => $validated['type'],
            'path' => $path,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $picture,
        ], 201);
    }

    public function destroy(ReservationPicture $picture): JsonResponse
    {
        $storagePath = storage_path('app/public/' . $picture->path);
        if (file_exists($storagePath)) {
            unlink($storagePath);
        }

        $picture->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Photo supprimée.',
        ]);
    }
}
