<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Fallback to serve storage files when the symlink doesn't work (Windows/WAMP)
Route::get('storage/{path}', function (string $path) {
    $fullPath = Storage::disk('public')->path($path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');
