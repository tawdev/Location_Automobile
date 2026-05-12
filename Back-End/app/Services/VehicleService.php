<?php

namespace App\Services;

use App\Models\User;

class VehicleService
{
    /**
     * Create a new class instance.
     */
    // public function __construct()
    // {
    //     //
    // }
    public function getAll(){
        return User::all();
    }
    
}
