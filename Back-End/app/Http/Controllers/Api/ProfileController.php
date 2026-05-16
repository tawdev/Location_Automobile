<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ProfileRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ProfileService;

class ProfileController extends Controller
{
    public function __construct(protected ProfileService $profileService){}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data=$this->profileService->displayMyProfile(auth()->id());
        return response()->json([
            'status'=>'success',
            'data'=>$data
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
    public function update(ProfileRequest $request)
    {
        $data=$this->profileService->updateInformations($request);

        if(!$data){
            return response()->json([
                'message'=>'Ancien mot de passe incorrect ou Les mots de passe ne correspondent pas'
            ],422);
        }

        return response()->json([
            'status'=>'success',
            'message'=>'Profile mise à jour avec succès',
            'data'=>$data,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
