<?php

namespace Database\Seeders;

use App\Models\Extra;
use Illuminate\Database\Seeder;

class ExtraSeeder extends Seeder
{
    public function run(): void
    {
        Extra::updateOrCreate(['name' => 'Dashcamera'], ['price_per_day' => 30]);
        Extra::updateOrCreate(['name' => 'Holiday Box'], ['price_per_day' => 50]);
        Extra::updateOrCreate(['name' => 'GPS'], ['price_per_day' => 70]);
    }
}
