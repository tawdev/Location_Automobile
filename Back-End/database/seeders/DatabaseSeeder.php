<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Database\Factories\CategoryFactory;
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
      
        User::updateOrCreate(['email' => 'admin@example.com'], [
            'name' => 'admin',
            'role_id' => 1,
            'password' => bcrypt('password'),
        ]);
        User::factory(20)->create([
            'role_id' => 2
        ]);


        $this->call([
            CategorySeeder::class,
            RoleSeeder::class,
            ExtraSeeder::class,
            PermissionSeeder::class,
        ]);


    }
}
