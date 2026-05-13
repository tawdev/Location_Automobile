<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Category;
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Role::updateOrCreate(['name' => 'Admin']);
        Role::updateOrCreate(['name' => 'Client']);
        Category::updateOrInsert(['name' => 'isovi']);
    }
}
