<?php

namespace Database\Seeders;

use App\Models\Role;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
        ]);
        Role::updateOrCreate(['name' => 'Admin']);
        Role::updateOrCreate(['name' => 'Client']);
    }
}
