<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PressRelease extends Model
{
    protected $fillable = ['title', 'slug', 'excerpt', 'content', 'featured_image', 'category', 'published_at', 'status'];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected $table = 'press_releases';
}
