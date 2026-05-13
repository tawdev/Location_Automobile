<?php

namespace app\Services;

use App\Models\Picture;
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
    $vehicle=Vehicle::findOrFail($vehicleId)->with('Pictures');
   // $vehiclePicture=Picture::where('vehicle_id',$vehicleId);

   foreach($vehicle->pictures as $picture){
    $picture->delete();
   }

   foreach($vehicle->pictures as $picture){
    if ($picture && file_exists(public_path('Vehicles/' . $picture))) {
        unlink(public_path('Vehicles/' . $picture));
        }
    }
        $vehicle->delete();

     return true;
   }
}
