<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Messages group
            [
                'slug' => 'manage_messages',
                'name_fr' => 'Répondre aux messages de contact',
                'name_en' => 'Answer contact messages',
                'name_ar' => 'الرد على رسائل الاتصال',
                'group' => 'messages',
            ],
            // Reservations group
            [
                'slug' => 'manage_reservations',
                'name_fr' => 'Vérifier et accepter les réservations',
                'name_en' => 'Check and accept reservations',
                'name_ar' => 'التحقق من الحجوزات وقبولها',
                'group' => 'reservations',
            ],
            [
                'slug' => 'cancel_reservations',
                'name_fr' => 'Annuler des réservations',
                'name_en' => 'Cancel reservations',
                'name_ar' => 'إلغاء الحجوزات',
                'group' => 'reservations',
            ],
            // Vehicles group
            [
                'slug' => 'manage_vehicles',
                'name_fr' => 'Gérer les véhicules',
                'name_en' => 'Manage vehicles',
                'name_ar' => 'إدارة المركبات',
                'group' => 'vehicles',
            ],
            [
                'slug' => 'manage_categories',
                'name_fr' => 'Gérer les catégories et marques',
                'name_en' => 'Manage categories and brands',
                'name_ar' => 'إدارة الفئات والعلامات التجارية',
                'group' => 'vehicles',
            ],
            // General group
            [
                'slug' => 'manage_users',
                'name_fr' => 'Gérer les utilisateurs',
                'name_en' => 'Manage users',
                'name_ar' => 'إدارة المستخدمين',
                'group' => 'general',
            ],
            [
                'slug' => 'manage_settings',
                'name_fr' => 'Modifier les paramètres',
                'name_en' => 'Change settings',
                'name_ar' => 'تعديل الإعدادات',
                'group' => 'general',
            ],
            [
                'slug' => 'manage_blogs',
                'name_fr' => 'Gérer les articles et blogs',
                'name_en' => 'Manage blogs and articles',
                'name_ar' => 'إدارة المقالات والمدونات',
                'group' => 'general',
            ],
            // Extras group
            [
                'slug' => 'manage_extras',
                'name_fr' => 'Gérer les extras',
                'name_en' => 'Manage extras',
                'name_ar' => 'إدارة الإضافات',
                'group' => 'extras',
            ],
            // Departure conditions group
            [
                'slug' => 'manage_departure_conditions',
                'name_fr' => 'Gérer les conditions de départ',
                'name_en' => 'Manage departure conditions',
                'name_ar' => 'إدارة شروط المغادرة',
                'group' => 'departure_conditions',
            ],
            // Countries / Cities group
            [
                'slug' => 'manage_countries',
                'name_fr' => 'Gérer les pays et villes',
                'name_en' => 'Manage countries and cities',
                'name_ar' => 'إدارة البلدان والمدن',
                'group' => 'countries',
            ],
            // Map group
            [
                'slug' => 'manage_map',
                'name_fr' => 'Gérer la carte de localisation',
                'name_en' => 'Manage location map',
                'name_ar' => 'إدارة خريطة الموقع',
                'group' => 'map',
            ],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }

        // Give all permissions to all Admin users
        $adminRole = Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $allPermissionIds = Permission::pluck('id');
            $adminRole->users()->each(function ($admin) use ($allPermissionIds) {
                $admin->permissions()->syncWithoutDetaching($allPermissionIds);
            });
        }
    }
}
