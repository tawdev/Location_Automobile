<?php

use App\Http\Controllers\Api\Admin\BlogController;
use App\Http\Controllers\Api\Admin\CareerController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\MarqueController;
use App\Http\Controllers\Api\Admin\TypeVehiculeController;
use App\Http\Controllers\Api\Admin\PressController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ExtraController;
use App\Http\Controllers\Api\Admin\PermissionController;
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
Route::post('auth/register' , [AuthController::class, 'register'])->middleware('throttle:5,10');
Route::post('auth/login' , [AuthController::class, 'login'])->middleware('throttle:10,10');
Route::post('auth/logout' , [AuthController::class , 'logout'])->middleware('auth:sanctum');
Route::get('auth/user' , [AuthController::class , 'userinfo'])->middleware('auth:sanctum');
Route::post('auth/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:10,10');
Route::post('auth/resend-code', [AuthController::class, 'resendCode'])->middleware('throttle:3,10');
Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('auth/google/callback', [AuthController::class, 'googleCallback']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,10');
Route::post('auth/verify-reset-code', [AuthController::class, 'verifyResetCode'])->middleware('throttle:10,10');
Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,10');

// Public settings
Route::get('settings', [SettingsController::class, 'index']);

// Contact form
Route::post('contact', [\App\Http\Controllers\Api\ContactController::class, 'send']);

// Public blog
Route::get('blogs', [\App\Http\Controllers\Api\BlogController::class, 'index']);
Route::get('blogs/{slug}', [\App\Http\Controllers\Api\BlogController::class, 'show']);

// Public vehicle routes (no auth required)
Route::get('Vehicles' , [VehicleController::class, 'index']);
Route::get('/Vehicles/{id}', [VehicleController::class, 'show']);
Route::get('filterVehicles' , [VehicleController::class , 'filterVehicles']);
Route::get('Categories/public', [CategoryController::class , 'index']);
Route::get('Marques/public', [MarqueController::class, 'index']);
Route::get('type-vehicules/public', [TypeVehiculeController::class, 'index']);

// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/vehicle' , [VehicleController::class , 'store']);
//     Route::put('Vehicle/{Vehicle}', [VehicleController::class, 'update']);
//     Route::delete('/Vehicle/{id}', [VehicleController::class, 'destroy']);
// });



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
    Route::put('/profile/details',[ProfileController::class,'updateUserDetails']);
    Route::get('/Vehicles/{id}/reserved-dates', [ReservationController::class, 'getReservedDates']);
    Route::get('extras', [ExtraController::class, 'index']);

    // Client info
    Route::get('/client', [\App\Http\Controllers\Api\ClientController::class, 'show']);
    Route::post('/client', [\App\Http\Controllers\Api\ClientController::class, 'store']);
});


Route::middleware(['auth:sanctum','admin_or_permission'])->group(function () {
    // Dashboard (accessible to all admin users)
    Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);

    // ── Messages (manage_messages) ──
    Route::middleware('permission:manage_messages')->group(function () {
        Route::get('admin/messages', [\App\Http\Controllers\Api\Admin\MessageController::class, 'index']);
        Route::get('admin/messages/unread-count', [\App\Http\Controllers\Api\Admin\MessageController::class, 'unreadCount']);
        Route::get('admin/messages/{message}', [\App\Http\Controllers\Api\Admin\MessageController::class, 'show']);
        Route::post('admin/messages/{message}/reply', [\App\Http\Controllers\Api\Admin\MessageController::class, 'reply']);
        Route::delete('admin/messages/{message}', [\App\Http\Controllers\Api\Admin\MessageController::class, 'destroy']);
    });

    // ── Reservations (manage_reservations) ──
    Route::middleware('permission:manage_reservations')->group(function () {
        Route::patch('/Reservations/{id}/confirme', [VehicleController::class, 'confirmeReservation']);
        Route::get('/Reservations', [VehicleController::class, 'displayReservition']);
        Route::patch('/Reservations/{id}/annuler', [ReservationController::class, 'annulleReservation']);
        Route::post('/Reservations/{id}/finalize', [ReservationController::class, 'finalize']);
        Route::get('/Reservations/{id}/contract', [ReservationController::class, 'downloadContract']);
        Route::post('/Reservations/{id}/contract/scans', [ReservationController::class, 'uploadContractScans']);
        Route::get('Reservation/filter', [ReservationController::class, 'filterAdminReservation']);
        Route::get('/admin/reservations/{reservation}/pictures', [\App\Http\Controllers\Api\Admin\ReservationPictureController::class, 'index']);
        Route::post('/admin/reservations/{reservation}/pictures', [\App\Http\Controllers\Api\Admin\ReservationPictureController::class, 'store']);
        Route::delete('/admin/reservations/pictures/{picture}', [\App\Http\Controllers\Api\Admin\ReservationPictureController::class, 'destroy']);
    });

    // ── Vehicles (manage_vehicles) ──
    Route::middleware('permission:manage_vehicles')->group(function () {
        Route::post('/vehicle', [VehicleController::class, 'store']);
        Route::put('Vehicle/{Vehicle}', [VehicleController::class, 'update']);
        Route::delete('/Vehicle/{id}', [VehicleController::class, 'destroy']);
        Route::get('/admin/vehicles/location', [VehicleController::class, 'locations']);
        Route::get('/location/live/{deviceId}', [LocationController::class, 'live']);
        Route::get('/location/history/{deviceId}', [LocationController::class, 'history']);
        Route::apiResource('admin/extras', ExtraController::class)->parameters(['extras' => 'extra']);
        Route::apiResource('admin/departure-conditions', \App\Http\Controllers\Api\Admin\DepartureConditionController::class)->parameters(['departure_conditions' => 'departure_condition']);
        Route::post('admin/vehicles/{vehicle}/conditions', [\App\Http\Controllers\Api\Admin\VehicleController::class, 'syncConditions']);
        Route::get('admin/vehicles/{vehicle}/conditions', [\App\Http\Controllers\Api\Admin\VehicleController::class, 'getConditions']);
    });

    // ── Categories / Marques / Type Vehicules ──
    Route::get('Categories', [CategoryController::class, 'index']);
    Route::post('Category', [CategoryController::class, 'store']);
    Route::put('Categories/{id}', [CategoryController::class, 'update']);
    Route::delete('Categories/{id}', [CategoryController::class, 'destroy']);
    Route::get('Categories/{id}', [CategoryController::class, 'show']);
    Route::post('Categories/search', [CategoryController::class, 'FilterByName']);
    Route::get('Marques', [MarqueController::class, 'index']);
    Route::post('Marque', [MarqueController::class, 'store']);
    Route::post('Marques/bulk', [MarqueController::class, 'bulkStore']);
    Route::get('Marques/{id}', [MarqueController::class, 'show']);
    Route::match(['post', 'put'], 'Marques/{id}', [MarqueController::class, 'update']);
    Route::delete('Marques/{id}', [MarqueController::class, 'destroy']);
    Route::get('type-vehicules', [TypeVehiculeController::class, 'index']);
    Route::post('type-vehicule', [TypeVehiculeController::class, 'store']);
    Route::put('type-vehicules/{id}', [TypeVehiculeController::class, 'update']);
    Route::delete('type-vehicules/{id}', [TypeVehiculeController::class, 'destroy']);
    Route::get('type-vehicules/{id}', [TypeVehiculeController::class, 'show']);
    Route::post('type-vehicules/search', [TypeVehiculeController::class, 'FilterByName']);

    // ── Blog / Press / Careers (manage_blogs) ──
    Route::middleware('permission:manage_blogs')->group(function () {
        Route::apiResource('admin/blogs', BlogController::class)->parameters(['blogs' => 'blog']);
        Route::apiResource('admin/press', PressController::class)->parameters(['press' => 'press_release']);
        Route::apiResource('admin/careers', CareerController::class)->parameters(['careers' => 'career']);
    });

    // ── Strict admin only (users, settings, permissions) ──
    Route::middleware('admin')->group(function () {
        Route::put('admin/settings', [SettingsController::class, 'update']);
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::get('/admin/users/all', [UserController::class, 'all']);
        Route::get('/admin/users/stats', [UserController::class, 'stats']);
        Route::get('/admin/users/{id}', [UserController::class, 'show']);
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
        Route::get('/admin/permissions', [PermissionController::class, 'index']);
        Route::get('/admin/users/{user}/permissions', [PermissionController::class, 'userPermissions']);
        Route::put('/admin/users/{user}/permissions', [PermissionController::class, 'updateUserPermissions']);
    });
});
Route::match(['get','post'],'/gps/data', [LocationController::class, 'store']);



Route::post('/Profile/CIN' , [ProfileController::class , 'addCIN'])->middleware('auth:sanctum');
Route::post('/Profile/Permi' , [ProfileController::class , 'AddPermi'])->middleware('auth:sanctum');













