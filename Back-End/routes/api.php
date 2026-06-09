<?php

use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ExtraController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\ReservationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\VehicleController;
use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Container\Attributes\Auth;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\LocationController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth
Route::post('auth/register' , [AuthController::class, 'register']);
Route::post('auth/login' , [AuthController::class, 'login']);
Route::post('auth/logout' , [AuthController::class , 'logout'])->middleware('auth:sanctum');
Route::get('auth/user' , [AuthController::class , 'userinfo'])->middleware('auth:sanctum');
Route::post('auth/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('auth/resend-code', [AuthController::class, 'resendCode']);
Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('auth/google/callback', [AuthController::class, 'googleCallback']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

// Public settings
Route::get('settings', [SettingsController::class, 'index']);

// Public vehicle routes (no auth required)
Route::get('Vehicles' , [VehicleController::class, 'index']);
Route::get('/Vehicles/{id}', [VehicleController::class, 'show']);
Route::get('filterVehicles' , [VehicleController::class , 'filterVehicles']);
Route::get('Categories/public', [CategoryController::class , 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/vehicle' , [VehicleController::class , 'store']);
    Route::put('Vehicle/{Vehicle}', [VehicleController::class, 'update']);
    Route::delete('/Vehicle/{id}', [VehicleController::class, 'destroy']);
});



Route::middleware('auth:sanctum')->group(function () {
    Route::post('/Reservations/vehicle/{id}',[ReservationController::class, 'store']);
    Route::get('/MyReservation/filter',[ReservationController::class,'filterUserReservation']);

    Route::get('/MyReservations',[ReservationController::class, 'index']);
    Route::patch('/MyReservations/{id}/annuler',[ReservationController::class, 'annulleMyReservation']);
    Route::get('/Reservations/{id}',[ReservationController::class, 'show']);
    Route::delete('/Reservations/{id}',[ReservationController::class, 'destroy']);
    Route::get('/profile',[ProfileController::class,'index']);
    Route::put('/profile/password',[ProfileController::class,'updateUserPassword']);
    Route::put('/profile/name',[ProfileController::class,'updateUserName']);
    Route::put('/profile/picture',[ProfileController::class,'updateUserProfilePicture']);
    Route::put('/profile/email',[ProfileController::class,'updateUserEmail']);
    Route::get('/Vehicles/{id}/reserved-dates', [ReservationController::class, 'getReservedDates']);
    Route::get('extras', [ExtraController::class, 'index']);


});


Route::middleware(['auth:sanctum','admin'])->group(function (){
Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);
Route::patch('/Reservations/{id}/confirme',[VehicleController::class,'confirmeReservation']);
Route::get('/Reservations',[VehicleController::class,'displayReservition']);
Route::patch('/Reservations/{id}/annuler',[ReservationController::class, 'annulleReservation']);
Route::post('/Reservations/{id}/finalize',[ReservationController::class, 'finalize']);
Route::get('Reservation/filter',[ReservationController::class,'filterAdminReservation']);

Route::post('/vehicle' , [VehicleController::class , 'store']);
Route::put('Vehicle/{Vehicle}', [VehicleController::class, 'update']);
Route::delete('/Vehicle/{id}', [VehicleController::class, 'destroy']);

Route::get('Categories', [CategoryController::class , 'index']);
Route::post('Category' , [CategoryController::class , 'store']);
Route::put('Categories/{id}' , [CategoryController::class , 'update']);
Route::delete('Categories/{id}', [CategoryController::class , 'destroy']);
Route::get('Categories/{id}', [CategoryController::class , 'show']);
Route::post('Categories/search' , [CategoryController::class , 'FilterByName']);

Route::get('/admin/vehicles/location',        [VehicleController::class, 'locations']);
Route::get ('/location/live/{deviceId}',    [LocationController::class, 'live']);
Route::get ('/location/history/{deviceId}', [LocationController::class, 'history']);

Route::apiResource('admin/extras', ExtraController::class)->parameters(['extras' => 'extra']);

Route::put('admin/settings', [SettingsController::class, 'update']);

Route::get('/admin/users', [UserController::class, 'index']);
Route::get('/admin/users/stats', [UserController::class, 'stats']);
Route::get('/admin/users/{id}', [UserController::class, 'show']);
Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);

});

Route::match(['get','post'],'/gps/data', [LocationController::class, 'store']);



Route::post('/Profile/CIN' , [ProfileController::class , 'addCIN'])->middleware('auth:sanctum');
Route::post('/Profile/Permi' , [ProfileController::class , 'AddPermi'])->middleware('auth:sanctum');













