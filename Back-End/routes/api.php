<?php

<<<<<<< HEAD
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\VehicleController;
=======
use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
>>>>>>> d9d26c0bd57ad9d4e216c4e071f2b6ee4ac1d506

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

<<<<<<< HEAD
Route::apiResource('/Vehicles',VehicleController::class);
=======

Route::post('auth/register' , [AuthController::class, 'register']);
Route::post('auth/login' , [AuthController::class, 'login']);
Route::post('auth/logout' , [AuthController::class , 'logout'])->middleware('auth:sanctum');
Route::get('auth/user' , [AuthController::class , 'userinfo'])->middleware('auth:sanctum');
>>>>>>> d9d26c0bd57ad9d4e216c4e071f2b6ee4ac1d506
