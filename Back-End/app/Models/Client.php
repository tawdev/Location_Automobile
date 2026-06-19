<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'user_id',
        'nom_prenom',
        'date_naissance',
        'cin_passport',
        'adresse',
        'telephone',
        'numero_permi',
        'date_delivrance',
        'date_expiration',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'date_delivrance' => 'date',
            'date_expiration' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
