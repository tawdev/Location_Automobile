<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ProfileRequest;
use App\Http\Requests\StoreCinRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ProfileService;
use App\Http\Requests\StorePermiRequest;

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
    public function updateUserPassword(Request $request)
    {
        $request->validate([
        'old_password'     => 'required|string|min:8',
        'new_password'     => 'required|string|min:8',
        'confirm_password'=> 'required|string|min:8',
        ]);

        $data = $this->profileService->updatePassword(
            $request->only('old_password','new_password','confirm_password')
        );

        if ($data === 'wrong_old_password') {
            return response()->json([
                'message' => 'Ancien mot de passe incorrect'
            ], 422);
        }

        if ($data === 'passwords_mismatch') {
            return response()->json([
                'message' => 'Les mots de passe ne correspondent pas'
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'mot de passe mise à jour avec succès',
            'data' => $data,
        ]);
    }

    public function updateUserName(Request $request){
        $request->validate([
            'new_name'=>'required|string|max:255',
        ]);
        $data=$this->profileService->updateName($request->only('new_name'));
        if(!$data){
            return response()->json([
                'status'=>'error',
                'message'=>'Le nom ne peut pas être vide.',
                'data'=>$data
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'le nom mise à jour avec succès',
            'data'=>$data
        ]);
    }

    public function updateUserEmail(Request $request){
        $request->validate([
            'email'=>'required|email'
        ]);
        $data=$this->profileService->updateEmail($request->only('email'));
        if ($data === 'email_taken') {
            return response()->json([
                'status'=>'error',
                'message'=>'Cet email est déjà utilisé par un autre compte.'
            ], 422);
        }
        return response()->json([
            'status'=>'success',
            'data'=>$data
        ]);

    }

   public function updateUserDetails(Request $request)
   {
       $request->validate([
           'phone'                => 'nullable|string|max:20',
           'address'              => 'nullable|string|max:500',
           'cin_passport'         => 'nullable|string|max:50',
           'date_of_birth'        => 'nullable|date',
           'driver_license_number'=> 'nullable|string|max:50',
           'license_issue_date'   => 'nullable|date',
           'license_expiry_date'  => 'nullable|date',
       ]);

       $data = $this->profileService->updateDetails(
           $request->only('phone', 'address', 'cin_passport', 'date_of_birth', 'driver_license_number', 'license_issue_date', 'license_expiry_date')
       );

       return response()->json([
           'status'  => 'success',
           'message' => 'Profil mis à jour avec succès',
           'data'    => $data,
       ]);
   }


   public function updateUserProfilePicture(Request $request)
{
    $request->validate([
        'profile_pic' => 'sometimes|nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $data = $this->profileService->updateProfilePicture([
        'profile_pic' => $request->file('profile_pic')
    ]);

    return response()->json([
        'status'  => 'success',
        'message' => 'Photo de profil mise à jour avec succès',
        'data'    => $data
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



    public function  addPermi(StorePermiRequest $request) {

        $isUpdated = $this->profileService->updateUserPermi($request->validated(), $request->user());

        if (!$isUpdated) {
            return response()->json([
                'status' => 'error',
                'data' => 'Une erreur s\'est produite.'
            ]);

        }

        return response()->json([
            'message' => 'succès',
            'data' => 'Profil permi mis à jour avec succès'
        ]);

    }


}
