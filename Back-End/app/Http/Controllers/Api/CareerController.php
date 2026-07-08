<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Career;
use Illuminate\Http\Request;

class CareerController extends Controller
{
    public function index()
    {
        $careers = Career::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $careers]);
    }

    public function show(string $slug)
    {
        $career = Career::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$career) {
            return response()->json(['status' => 'error', 'message' => 'Career not found'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $career]);
    }
}
