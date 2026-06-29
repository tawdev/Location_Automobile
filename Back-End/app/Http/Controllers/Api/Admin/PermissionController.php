<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::orderBy('group')->orderBy('name_fr')->get();

        return response()->json([
            'status' => 'success',
            'data' => $permissions,
        ]);
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
