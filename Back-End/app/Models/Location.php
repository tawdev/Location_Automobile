<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'device_id', 'latitude',
        'longitude', 'speed', 'accuracy', 'heading', 'address',
    ];

    protected $casts = [
        'latitude'  => 'float',
        'longitude' => 'float',
        'speed'     => 'float',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'device_id', 'device_id');
    }

}
