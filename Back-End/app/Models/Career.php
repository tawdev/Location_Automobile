<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Career extends Model
{
    protected $fillable = ['title', 'slug', 'location', 'type', 'department', 'description', 'requirements', 'salary_range', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
