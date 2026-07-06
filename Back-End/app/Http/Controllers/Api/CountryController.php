<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;

class CountryController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Country::with('cities')->get(),
        ]);
    }
}
