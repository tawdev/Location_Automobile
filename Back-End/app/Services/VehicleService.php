<?php

namespace App\Services;

use App\Models\Vehicle;

class VehicleService
{
    /**
     * Create a new class instance.
     */
    public function getAll(){
        return Vehicle::all();
    }

    public function CreateVehicle(array $data){
        return Vehicle::create($data);
    }

   public function UpdateVehicle($vehicleId,array $data){
    $vehicle=Vehicle::findOrFail($vehicleId);
    $vehicle->update($data);
    return $vehicle;
   }

   public function DeleteVehicle($vehicleId){
    $vehicle=Vehicle::findOrFail($vehicleId);
    return $vehicle->delete();
   }
}
