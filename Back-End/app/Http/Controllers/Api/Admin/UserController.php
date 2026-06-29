<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::withCount('reservations')
            ->withSum(['reservations as total_spent' => function ($q) {
                $q->whereIn('status', ['Confirmée', 'Terminée']);
            }], 'TotalPrice')
            ->with('role')
            ->where('role_id', 2);

        if ($search = $request->query('search')) {
            $users->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $users->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    public function all(Request $request)
    {
        $users = User::with('role:id,name')
            ->with('permissions:id,slug,name_fr')
            ->where('role_id', '!=', 1);

        if ($search = $request->query('search')) {
            $users->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $users->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    public function stats()
    {
        $totalClients = User::where('role_id', 2)->count();

        $activeClients = User::where('role_id', 2)
            ->has('reservations')
            ->count();

        $newThisMonth = User::where('role_id', 2)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $withDocuments = User::where('role_id', 2)
            ->where(function ($q) {
                $q->whereNotNull('cin_recto')
                  ->orWhereNotNull('permi_recto');
            })
            ->count();

        $verified = User::where('role_id', 2)
            ->whereNotNull('email_verified_at')
            ->count();

        $monthlyRegistrations = User::where('role_id', 2)
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topUsers = User::where('role_id', 2)
            ->withCount('reservations')
            ->withSum(['reservations as total_spent' => function ($q) {
                $q->whereIn('status', ['Confirmée', 'Terminée']);
            }], 'TotalPrice')
            ->having('reservations_count', '>', 0)
            ->orderBy('reservations_count', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'totalClients' => $totalClients,
                'activeClients' => $activeClients,
                'newThisMonth' => $newThisMonth,
                'withDocuments' => $withDocuments,
                'verified' => $verified,
                'monthlyRegistrations' => $monthlyRegistrations,
                'topUsers' => $topUsers,
            ],
        ]);
    }

    public function show($id)
    {
        $user = User::withCount('reservations')
            ->withSum(['reservations as total_spent' => function ($q) {
                $q->whereIn('status', ['Confirmée', 'Terminée']);
            }], 'TotalPrice')
            ->with('role')
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $user,
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Utilisateur supprimé',
        ]);
    }
}
