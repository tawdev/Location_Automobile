<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;

class CityLocationController extends Controller
{
    public function byCity($cityId)
    {
        $city = City::with('locations')->findOrFail($cityId);

        return response()->json([
            'status' => 'success',
            'data' => $city->locations,
        ]);
    }
}
