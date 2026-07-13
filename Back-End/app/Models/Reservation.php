<?php

namespace App\Models;

use Database\Factories\ReservationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Reservation extends Model
{
    protected $fillable = [
        'start_date', 'end_date', 'user_id', 'vehicle_id', 'status', 'TotalPrice',
        'client_id',
        'driver2_name', 'driver2_cin_recto', 'driver2_cin_verso', 'driver2_permi_recto', 'driver2_permi_verso',
        'driver2_nom_prenom', 'driver2_date_naissance', 'driver2_cin_passport', 'driver2_adresse',
        'driver2_telephone', 'driver2_numero_permi', 'driver2_date_delivrance', 'driver2_date_expiration',
        'caution_montant', 'caution_mode',
        'lieu_depart', 'lieu_retour', 'date_heure_depart', 'date_heure_retour',
        'depart_country_id', 'depart_city_id', 'return_country_id', 'return_city_id',
        'observations',
        'depart_location_type',
        'return_location_type',
        'return_location_name',
        'return_location_supplement',
    ];
    /** @use HasFactory<ReservationFactory> */
    use HasFactory;

    protected $with = ['extras'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'date_heure_depart' => 'datetime',
            'date_heure_retour' => 'datetime',
            'driver2_date_naissance' => 'date',
            'driver2_date_delivrance' => 'date',
            'driver2_date_expiration' => 'date',
            'caution_montant' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, Reservation>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Vehicle, Reservation>
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * @return BelongsToMany<Extra>
     */
    public function extras(): BelongsToMany
    {
        return $this->belongsToMany(Extra::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function departureConditions(): BelongsToMany
    {
        return $this->belongsToMany(DepartureCondition::class, 'departure_condition_reservation')
            ->withPivot('checked');
    }

    public function pictures(): HasMany
    {
        return $this->hasMany(ReservationPicture::class);
    }

    public function departCountry(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'depart_country_id');
    }

    public function departCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'depart_city_id');
    }

    public function returnCountry(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'return_country_id');
    }

    public function returnCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'return_city_id');
    }
}
