<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        // Auto-seed default permissions if the table is empty
        if (DB::table('permissions')->count() === 0) {
            $this->seedDefaults();
        }

        $permissions = Permission::orderBy('group')->orderBy('name_fr')->get();

        return response()->json([
            'status' => 'success',
            'data' => $permissions,
        ]);
    }

    private function seedDefaults(): void
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
            $inserted[] = DB::table('permissions')->insertGetId([
                'slug'       => $perm['slug'],
                'name_fr'    => $perm['name_fr'],
                'name_en'    => $perm['name_en'],
                'name_ar'    => $perm['name_ar'],
                'group'      => $perm['group'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Give all permissions to every Admin user
        $adminUserIds = DB::table('users')->where('role_id', 1)->pluck('id');
        foreach ($adminUserIds as $userId) {
            $pivot = [];
            foreach ($inserted as $permId) {
                $pivot[] = [
                    'permission_id' => $permId,
                    'user_id'       => $userId,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];
            }
            DB::table('permission_user')->insert($pivot);
        }
    }

    public function userPermissions(User $user): JsonResponse
    {
        $user->load('permissions');

        return response()->json([
            'status' => 'success',
            'data' => $user->permissions->pluck('id'),
        ]);
    }

    public function updateUserPermissions(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'permission_ids' => 'array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $newIds = collect($request->input('permission_ids', []));
        $oldIds = $user->permissions()->pluck('permission_id');

        $addedIds = $newIds->diff($oldIds);
        $removedIds = $oldIds->diff($newIds);

        $user->permissions()->sync($newIds);

        // Update role based on permissions
        if ($newIds->isNotEmpty()) {
            $secondeAdminRole = Role::where('name', 'Seconde_Admin')->first();
            if ($secondeAdminRole) {
                $user->role_id = $secondeAdminRole->id;
                $user->save();
            }
        } else {
            $clientRole = Role::where('name', 'Client')->first();
            if ($clientRole && $user->role_id !== 1) {
                $user->role_id = $clientRole->id;
                $user->save();
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Permissions mises à jour',
        ]);
    }
}
