<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrPermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Non authentifié.',
            ], 401);
        }

        $isAdmin = $user->role && $user->role->name === 'Admin';
        $hasAnyPermission = $user->permissions()->exists();

        if (!$isAdmin && !$hasAnyPermission) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Accès refusé.',
            ], 403);
        }

        return $next($request);
    }
}
