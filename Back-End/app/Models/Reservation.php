<?php

namespace App\Models;

use Database\Factories\ReservationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Reservation extends Model
{
    protected $fillable = ['start_date' , 'end_date','user_id' , 'vehicle_id', 'status','TotalPrice','driver2_name','driver2_cin_recto','driver2_cin_verso','driver2_permi_recto','driver2_permi_verso','contract_pdf'];
    /** @use HasFactory<ReservationFactory> */
    use HasFactory;

    protected $with = ['extras'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
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
}
