<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Seeder;

class CountryCitySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            'Maroc' => ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'],
            'France' => ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse'],
            'Espagne' => ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Bilbao'],
            'Italie' => ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
            'Allemagne' => ['Berlin', 'Munich', 'Hambourg', 'Francfort', 'Cologne'],
        ];

        foreach ($countries as $countryName => $cityNames) {
            $country = Country::create(['name' => $countryName]);
            foreach ($cityNames as $cityName) {
                City::create(['country_id' => $country->id, 'name' => $cityName]);
            }
        }
    }
}
