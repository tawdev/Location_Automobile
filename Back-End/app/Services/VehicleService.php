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
        return Vehicle::with('pictures', 'category', 'typeVehicule', 'departureConditions')->orderBy('pricePerDay', 'asc')->get();
    }

    public function getById($id)
    {
        return Vehicle::with('pictures', 'category', 'typeVehicule', 'departureConditions')->find($id);
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

    public function UpdateVehicle($Vehicle, array $data, $pictures = null)
    {
        $Vehicle->update($data);

        if (!empty($pictures)) {
            $newPaths = [];
            foreach ($pictures as $pic) {
                if ($pic instanceof UploadedFile) {
                    $newPaths[] = $pic->store('Vehicles', 'public');
                }
            }

            // Only delete old records/files after new ones are safely stored
            if (!empty($newPaths)) {
                $oldPaths = $Vehicle->pictures->pluck('path')->toArray();

                DB::transaction(function() use ($Vehicle, $newPaths) {
                    $Vehicle->pictures()->delete();
                    foreach ($newPaths as $p) {
                        $Vehicle->pictures()->create(['path' => $p]);
                    }
                });

                foreach ($oldPaths as $path) {
                    if ($path && Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }
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




    public function filterVehicles($request) {
        $query = Vehicle::query();

        
        $query->when($request->filled('marque'), function ($q) use ($request) {
            $q->where('marque', 'LIKE',  "%{$request->marque}%");
        });
        $query->when($request->filled('Occupants'), function ($q) use ($request) {
            $q->where('Occupants',  $request->Occupants);
        });

        $query->when($request->filled('model'), function ($q) use ($request) {
            $q->where('model', 'LIKE' , "%{$request->model}%");
        });

        $query->when($request->filled('fuelType'), function ($q) use ($request) {
            $q->where('fuelType', $request->fuelType);
        });
  
        $query->when($request->filled('min_price'), function ($q) use ($request) {
            $q->where('pricePerDay', '>=', $request->min_price);
        });

        $query->when($request->filled('max_price'), function ($q) use ($request) {
            $q->where('pricePerDay', '<=', $request->max_price);
        });

        $query->when($request->filled('pickup_date') && $request->filled('return_date'), function ($q) use ($request) {
            $q->whereDoesntHave('reservations', function ($q) use ($request) {
                $q->whereIn('status', ['En_Attente', 'Confirmée'])
                  ->where('start_date', '<=', $request->return_date)
                  ->where('end_date', '>=', $request->pickup_date);
            });
        });

        $Vehicles = $query->with('pictures', 'category', 'typeVehicule', 'departureConditions')->orderBy('order', 'asc')->get();
        
        return $Vehicles;

    }
}
