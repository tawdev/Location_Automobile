<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\CityLocation;
use Illuminate\Database\Seeder;

class CityLocationSeeder extends Seeder
{
    public function run(): void
    {
        $cities = City::all();

        foreach ($cities as $city) {
            // Create airport location
            CityLocation::firstOrCreate(
                ['city_id' => $city->id, 'type' => 'airport'],
                ['name' => $city->name . ' Aéroport', 'price' => 0]
            );

            // Create city center location
            CityLocation::firstOrCreate(
                ['city_id' => $city->id, 'type' => 'citycenter'],
                ['name' => $city->name . ' Centre Ville', 'price' => 0]
            );
        }

        $this->command->info('City locations seeded successfully!');
    }
}
