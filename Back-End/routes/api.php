<?php

use App\Http\Controllers\Api\ReservationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\VehicleController;
use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Container\Attributes\Auth;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('/Vehicles',VehicleController::class);
// Auth 
Route::post('auth/register' , [AuthController::class, 'register']);
Route::post('auth/login' , [AuthController::class, 'login']);
Route::post('auth/logout' , [AuthController::class , 'logout'])->middleware('auth:sanctum');
Route::get('auth/user' , [AuthController::class , 'userinfo'])->middleware('auth:sanctum');



 


Route::post('vehicle' , [VehicleController::class , 'store'])->middleware('auth:sanctum');
// Route::apiResource('/Vehicles', VehicleController::class);
Route::put('Vehicle/{Vehicle}', [VehicleController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/Vehicle/{id}', [VehicleController::class, 'destroy'])->middleware('auth:sanctum');

Route::apiResource('/Reservations', ReservationController::class);
Route::put('/Reservations/{id}', [ReservationController::class, 'annulleMyReservation']);














