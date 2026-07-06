<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;

class CityController extends Controller
{
    public function byCountry($countryId)
    {
        $country = Country::with('cities')->findOrFail($countryId);

        return response()->json([
            'status' => 'success',
            'data' => $country->cities,
        ]);
    }
}
