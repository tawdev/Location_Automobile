<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['slug' => 'manage_extras',              'name_fr' => 'Gérer les extras',              'name_en' => 'Manage extras',             'name_ar' => 'إدارة الإضافات',                'group' => 'extras'],
            ['slug' => 'manage_departure_conditions', 'name_fr' => 'Gérer les conditions de départ', 'name_en' => 'Manage departure conditions', 'name_ar' => 'إدارة شروط المغادرة',          'group' => 'departure_conditions'],
            ['slug' => 'manage_map',                  'name_fr' => 'Gérer la carte de localisation', 'name_en' => 'Manage location map',       'name_ar' => 'إدارة خريطة الموقع',            'group' => 'map'],
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

        // Give new permissions to every Admin user
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
        DB::table('permissions')->whereIn('slug', [
            'manage_extras',
            'manage_departure_conditions',
            'manage_map',
        ])->delete();
    }
};
