<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
class ProfileService
{
    public function displayMyProfile($id)
    {
        return User::findOrFail($id);
    }

       public function updateProfilePicture(array $data)
    {
        $user = auth()->user();

        if (isset($data['profile_pic'])) {
            // Supprimer l'ancienne image si elle existe
            if ($user->profile_pic) {
                $oldPath = public_path('image/' . $user->profile_pic);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $filename = time() . '.' . $data['profile_pic']->getClientOriginalExtension();
            $data['profile_pic']->move(public_path('image'), $filename);

            $user->update(['profile_pic' => $filename]);
        }

        return $user;
    }

    public function updatePassword(array $data)
    {
        $user = auth()->user();

        if (empty($data['new_password']) || empty($data['old_password']) || empty($data['confirme_password'])) {
            return false;
        }

        if (!Hash::check($data['old_password'], $user->password)) {
            return false;
        }

        if ($data['new_password'] !== $data['confirme_password']) {
            return false;
        }

        $user->update([
            'password' => Hash::make($data['new_password'])
        ]);

        return $user;
    }

    public function updateName(array $data)
    {
        $user = auth()->user();

        if (!$data['new_name']) {
            return false;
        }

        $user->update(['name' => $data['new_name']]);

        return $user;
    }

    public function updateEmail(array $data)
    {
        $user = auth()->user();

        if (empty($data['email'])) {
            return false;
        }

        $user->update(['email' => $data['email']]);

        return $user;
    }







    public function updateUserCIN($data, $user)
    {
        // i need to return true or false ;



        if ($user->cin_verso || $user->cin_verso) {

            $doesRectoExists = Storage::disk('public')->exists($user->cin_recto);
            $doesVersoExists = Storage::disk('public')->exists($user->cin_verso);

            if ($doesRectoExists) {
                Storage::disk('public')->delete($user->cin_recto);
            } else if ($doesVersoExists) {
                Storage::disk('public')->delete($user->cin_verso);
            }
        }
        $cin_recto_path = $data['cin_recto']->store('Vehicles', 'public');
        $cin_verson_path = $data['cin_verso']->store('Vehicles', 'public');
        $isUpdated = $user->update([
            'cin_recto' => $cin_recto_path,
            'cin_verso' => $cin_verson_path
        ]);
        if ($isUpdated) {
            return true;
        }
        return false;
    }


}
