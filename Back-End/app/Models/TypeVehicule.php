<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeVehicule extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    protected $table = 'type_vehicules';

    /**
     * @return HasMany<Vehicle>
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }
}
