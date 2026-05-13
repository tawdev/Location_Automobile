<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([

                'Berline',
                'SUV',
                'Coupé',
                'Hatchback',
                'Cabriolet',
                'Pick-up',
                'Monospace',
                'Voiture de sport',
                'Électrique',
                'Hybride',
                'Luxe',
                'Tout-terrain',
                'Crossover',
                'Break',
                'Microvoiture',

            ]),
        ];
    }
}
