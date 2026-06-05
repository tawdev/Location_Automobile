<?php

namespace App\Models;

use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Vehicle extends Model
{

    protected $fillable = ['marque', 'model', 'year', 'registration', 'km', 'pricePerDay', 'fuelType', 'category_id', 'Occupants', 'device_id', 'air_conditioner', 'gps'];
    /** @use HasFactory<VehicleFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Category, Vehicle>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<Reservation>
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * @return HasMany<Picture>
     */
    public function pictures(): HasMany
    {
        return $this->hasMany(Picture::class);
    }

    public function latestLocation()
    {
        return $this->hasOne(Location::class, 'device_id', 'device_id')
            ->latestOfMany();
    }
}
