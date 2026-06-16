<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationPicture extends Model
{
    protected $fillable = ['reservation_id', 'type', 'path'];

    protected $table = 'reservation_pictures';

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
