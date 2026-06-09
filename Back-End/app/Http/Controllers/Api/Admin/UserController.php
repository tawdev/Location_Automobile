<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount('reservations')
            ->with('role')
            ->where('role_id', 2)
            ->orderBy('created_at', 'desc')
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

        return response()->json([
            'status' => 'success',
            'data' => [
                'totalClients' => $totalClients,
                'activeClients' => $activeClients,
                'newThisMonth' => $newThisMonth,
                'withDocuments' => $withDocuments,
                'verified' => $verified,
                'monthlyRegistrations' => $monthlyRegistrations,
            ],
        ]);
    }

    public function show($id)
    {
        $user = User::withCount('reservations')
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
