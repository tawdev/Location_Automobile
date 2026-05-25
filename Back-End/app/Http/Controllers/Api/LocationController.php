<?php

namespace App\Http\Controllers\Api;

use App\Events\LocationUpdated;
use App\Models\Location;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LocationController extends Controller
{
    // GET /api/gps/data or POST /api/gps/data  — called by the GPS device
    public function store(Request $request)
    {
        $data = $request->validate([
            'device_id' => 'required|string',
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'speed'     => 'nullable|numeric|min:0',
            'accuracy'  => 'nullable|numeric|min:0',
            'heading'   => 'nullable|numeric|between:0,360',
        ]);

        $location = Location::create($data);

        broadcast(new LocationUpdated($location))->toOthers();

        return response()->json($location, 201);
    }

    // GET /api/location/live/{deviceId}  — latest position
    public function live(string $deviceId)
    {
        $location = Location::where('device_id', $deviceId)
            ->latest()
            ->firstOrFail();

        return response()->json($location);
    }

    // GET /api/location/history/{deviceId}  — route history
    public function history(Request $request, string $deviceId)
    {
        $locations = Location::where('device_id', $deviceId)
            ->when($request->from, fn($q) => $q->where('created_at', '>=', $request->from))
            ->when($request->to,   fn($q) => $q->where('created_at', '<=', $request->to))
            ->orderBy('created_at')
            ->paginate(500);

        return response()->json($locations);
    }
}
