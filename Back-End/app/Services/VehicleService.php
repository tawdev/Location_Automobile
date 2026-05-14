<?php

namespace app\Services;

use App\Models\Picture;
use App\Models\Vehicle;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
class VehicleService
{
    public function getAll()
    {
        return Vehicle::with('pictures')->get();
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

    public function UpdateVehicle($Vehicle, array $data, $pictures)
    {
        $imagesPaths = [];
        $images = $Vehicle->pictures();
        foreach ($images as $image) {
            $imagesPaths[] = $image->path;
        }

        DB::transaction(function() use ($Vehicle) {
            $Vehicle->pictures()->delete();
        });

        foreach ($imagesPaths as $path) {
           if($path && Storage::disk('public')->exists($path)) {
                 Storage::disk('public')->delete($path);
           };
        }

        $Vehicle->update($data);

        foreach($pictures as $pic) {
            $path = $pic->store('Vehicles' , 'public');
            $Vehicle->pictures()->create([
                "path" => $path
            ]);
        }

        return $Vehicle;
    }


    public function DeleteVehicle($vehicleId)
    {
        
        $imagesPaths = [];
        
        $vehicle = Vehicle::with('pictures')->findOrFail($vehicleId);
       
        if(!$vehicle) {
            return false;
        }

        foreach($vehicle->pictures as $pic) {
            $imagesPaths[] = $pic->path;
        }

        $vehicle->pictures()->delete();


        foreach($imagesPaths as $path) {
          
            if($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $vehicle->delete();

        return true;
    }
}
