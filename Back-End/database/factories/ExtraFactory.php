<?php

namespace Database\Factories;

use App\Models\Extra;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExtraFactory extends Factory
{
    protected $model = Extra::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Dashcamera', 'GPS', 'Holiday Box', 'Baby Seat', 'WiFi Hotspot']),
            'price_per_day' => fake()->randomElement([30, 50, 70, 100, 150]),
        ];
    }
}
