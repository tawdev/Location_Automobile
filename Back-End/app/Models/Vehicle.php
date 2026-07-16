<?php

namespace App\Models;

use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Vehicle extends Model
{

    protected $fillable = ['marque', 'model', 'year', 'registration', 'km', 'pricePerDay', 'fuelType', 'transmission', 'protection_percentage', 'protection_price_percentage', 'category_id', 'type_vehicule_id', 'Occupants', 'device_id', 'air_conditioner', 'gps', 'order', 'country_id', 'city_id', 'pickup_country_id', 'pickup_city_id', 'current_country_id', 'current_city_id', 'location_type'];
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

    public function departureConditions(): BelongsToMany
    {
        return $this->belongsToMany(DepartureCondition::class, 'departure_condition_vehicle');
    }

    /**
     * @return BelongsTo<TypeVehicule, Vehicle>
     */
    public function typeVehicule(): BelongsTo
    {
        return $this->belongsTo(TypeVehicule::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function pickupCountry(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'pickup_country_id');
    }

    public function pickupCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'pickup_city_id');
    }

    public function currentCountry(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'current_country_id');
    }

    public function currentCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'current_city_id');
    }
}
