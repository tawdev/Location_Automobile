<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;


class ProfileService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }
    public function displayMyProfile($id){
     return User::findOrFail($id);

    }

    public function updateInformations($id,$data){
       $user = User::findOrFail($id);

    if (isset($data['profile_pic']) && $data['profile_pic'] instanceof \Illuminate\Http\UploadedFile) {

        if ($user->profile_pic) {
            $oldPath = public_path('image/' . $user->profile_pic);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }


            $filename = time() . '.' . $data['profile_pic']->getClientOriginalExtension();
            $data['profile_pic']->move(public_path('image'), $filename);
            $data['profile_pic'] = $filename;
        }
        if(!Hash::check($data['new_password'], $user->password) || $data['new_password'] !== $data['confirme_password']){
            return false;
            }

        $user->update($data);
        return $user;
        }







        public function updateUserCIN($data) {
            // i need to return true or false ;

            $user = Auth()->user();
            $cin_recto_path = $data['cin_recto']->store('Vehicles', 'public');
            $cin_verson_path = $data['cin_verso']->store('Vehicles', 'public');
            $isUpdated  = $user->update([
                'cin_recto' => $cin_recto_path ,
                'cin_verso' => $cin_verson_path
            ]);
            if($isUpdated) {
                return true;
            }
            return false ;
        }


}
