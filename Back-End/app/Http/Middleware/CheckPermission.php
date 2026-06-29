<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Non authentifié.',
            ], 401);
        }

        // Check if user has the specific permission
        $hasPermission = $user->permissions()
            ->where('slug', $permission)
            ->exists();

        if (!$hasPermission) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Accès refusé. Permission requise : ' . $permission,
            ], 403);
        }

        return $next($request);
    }
}
