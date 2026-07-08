<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PressRelease;
use Illuminate\Http\Request;

class PressController extends Controller
{
    public function index()
    {
        $press = PressRelease::where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $press]);
    }

    public function show(string $slug)
    {
        $press = PressRelease::where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (!$press) {
            return response()->json(['status' => 'error', 'message' => 'Press release not found'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $press]);
    }
}
