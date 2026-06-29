<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['slug' => 'manage_messages',    'name_fr' => 'Répondre aux messages de contact',       'name_en' => 'Answer contact messages',        'name_ar' => 'الرد على رسائل الاتصال',      'group' => 'messages'],
            ['slug' => 'manage_reservations', 'name_fr' => 'Vérifier et accepter les réservations', 'name_en' => 'Check and accept reservations',   'name_ar' => 'التحقق من الحجوزات وقبولها',  'group' => 'reservations'],
            ['slug' => 'cancel_reservations', 'name_fr' => 'Annuler des réservations',              'name_en' => 'Cancel reservations',             'name_ar' => 'إلغاء الحجوزات',              'group' => 'reservations'],
            ['slug' => 'manage_vehicles',    'name_fr' => 'Gérer les véhicules',                   'name_en' => 'Manage vehicles',                 'name_ar' => 'إدارة المركبات',              'group' => 'vehicles'],
            ['slug' => 'manage_categories',  'name_fr' => 'Gérer les catégories et marques',        'name_en' => 'Manage categories and brands',    'name_ar' => 'إدارة الفئات والعلامات التجارية', 'group' => 'vehicles'],
            ['slug' => 'manage_users',       'name_fr' => 'Gérer les utilisateurs',                'name_en' => 'Manage users',                    'name_ar' => 'إدارة المستخدمين',            'group' => 'general'],
            ['slug' => 'manage_settings',    'name_fr' => 'Modifier les paramètres',               'name_en' => 'Change settings',                 'name_ar' => 'تعديل الإعدادات',             'group' => 'general'],
            ['slug' => 'manage_blogs',       'name_fr' => 'Gérer les articles et blogs',           'name_en' => 'Manage blogs and articles',       'name_ar' => 'إدارة المقالات والمدونات',    'group' => 'general'],
        ];

        $inserted = [];
        foreach ($permissions as $perm) {
            $id = DB::table('permissions')->where('slug', $perm['slug'])->value('id');
            if (!$id) {
                $id = DB::table('permissions')->insertGetId([
                    'slug'       => $perm['slug'],
                    'name_fr'    => $perm['name_fr'],
                    'name_en'    => $perm['name_en'],
                    'name_ar'    => $perm['name_ar'],
                    'group'      => $perm['group'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $inserted[] = $id;
        }

        // Give all permissions to every Admin user
        $adminUserIds = DB::table('users')->where('role_id', 1)->pluck('id');
        foreach ($adminUserIds as $userId) {
            $existing = DB::table('permission_user')->where('user_id', $userId)->pluck('permission_id')->toArray();
            $pivot = [];
            foreach ($inserted as $permId) {
                if (!in_array($permId, $existing)) {
                    $pivot[] = [
                        'permission_id' => $permId,
                        'user_id'       => $userId,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ];
                }
            }
            if (!empty($pivot)) {
                DB::table('permission_user')->insert($pivot);
            }
        }
    }

    public function down(): void
    {
        DB::table('permission_user')->delete();
        DB::table('permissions')->delete();
    }
};
