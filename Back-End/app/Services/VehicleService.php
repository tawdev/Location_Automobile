<?php

namespace app\Services;

use App\Models\Picture;
use App\Models\Vehicle;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class VehicleService
{
    public function getAll()
    {
        return Vehicle::all();
    }

    public function CreateVehicle($request)
    {
        
        $validated = $request->validated();
        $vehicle = Vehicle::create($validated);
        $files = $request->file('images');
        if (!empty($files)) {
            if ($files instanceof UploadedFile) {
                $files = [$files];
            } elseif (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $image) {
                if (!$image instanceof UploadedFile) {
                    continue;
                }
                $path = $image->store('Vehicles', 'public');
                $vehicle->pictures()->create([
                    'path' => $path,
                ]);
            }
        }
        return $vehicle;
    }

    public function UpdateVehicle($vehicleId, array $data)
    {
        $vehicle = Vehicle::findOrFail($vehicleId);
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
