<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DepartureCondition extends Model
{
    protected $fillable = ['name'];

    public function vehicles(): BelongsToMany
    {
        return $this->belongsToMany(Vehicle::class, 'departure_condition_vehicle');
    }

    public function reservations(): BelongsToMany
    {
        return $this->belongsToMany(Reservation::class, 'departure_condition_reservation')
            ->withPivot('checked');
    }
}
