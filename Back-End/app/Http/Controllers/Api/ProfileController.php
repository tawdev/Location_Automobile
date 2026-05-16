<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreCinRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ProfileService;

class ProfileController extends Controller
{
    public function __construct(protected ProfileService $profileService)
    {
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->profileService->displayMyProfile(auth()->id());
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,',
            'profile_pic' => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',
            'new_password' => 'sometimes|string|min:8',
            'confirme_password' => 'sometimes|string|min:8'
        ]);

        $data = $this->profileService->updateInformations(auth()->id(), $request->all());

        if (!$data) {
            return response()->json([
                'message' => 'Ancien mot de passe incorrect ou Les mots de passe ne correspondent pas'
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profile mise à jour avec succès',
            'data' => $data,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }







    public function addCIN(StoreCinRequest $request)
    {
        $isStored = $this->profileService->updateUserCIN($request->validated(), $request->user());

        if ($isStored) {
            return response()->json([
                'message' => 'succès',
                'data' => 'Profil CIN mis à jour avec succès'
            ], 201);
        }

        return response()->json([
            'message' => 'error',
            'data' => 'Une erreur s\'est produite.'
        ], 200);

    }

    
}
