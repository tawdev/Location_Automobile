<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function show()
    {
        $client = Client::where('user_id', auth()->id())->first();

        if (!$client) {
            return response()->json([
                'status' => 'success',
                'data' => null,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $client,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_prenom' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'cin_passport' => 'required|string|max:255',
            'adresse' => 'required|string',
            'telephone' => 'required|string|max:255',
            'numero_permi' => 'required|string|max:255',
            'date_delivrance' => 'required|date',
            'date_expiration' => 'required|date|after:date_delivrance',
        ]);

        $client = Client::updateOrCreate(
            ['user_id' => auth()->id()],
            $validated
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Informations client enregistrées avec succès',
            'data' => $client,
        ], 201);
    }
}
