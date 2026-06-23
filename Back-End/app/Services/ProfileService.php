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

    public function updatePassword(array $data): User|string
    {
        $user = auth()->user();

        if (!Hash::check($data['old_password'], $user->password)) {
            return 'wrong_old_password';
        }

        if ($data['new_password'] !== $data['confirm_password']) {
            return 'passwords_mismatch';
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

        $exists = User::where('email', $data['email'])->where('id', '!=', $user->id)->exists();
        if ($exists) {
            return 'email_taken';
        }

        $user->update(['email' => $data['email']]);

        return $user;
    }







    public function updateDetails(array $data)
    {
        $user = auth()->user();
        $updates = [];

        foreach (['phone', 'address', 'cin_passport', 'date_of_birth', 'driver_license_number', 'license_issue_date', 'license_expiry_date'] as $field) {
            if (array_key_exists($field, $data)) {
                $updates[$field] = $data[$field];
            }
        }

        if (empty($updates)) {
            return $user;
        }

        $user->update($updates);
        return $user;
    }


    public function updateUserCIN($data, $user)
    {
        // i need to return true or false ;


        if ($user->cin_recto || $user->cin_verso) {
            if ($user->cin_recto && Storage::disk('public')->exists($user->cin_recto)) {
                Storage::disk('public')->delete($user->cin_recto);
            }
            if ($user->cin_verso && Storage::disk('public')->exists($user->cin_verso)) {
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



    public function updateUserPermi($data, $user)
    {
        // i need to return true or false to the controller ;

        if ($user->permi_recto || $user->permi_verso) {
            if ($user->permi_recto && Storage::disk('public')->exists($user->permi_recto)) {
                Storage::disk('public')->delete($user->permi_recto);
            }
            if ($user->permi_verso && Storage::disk('public')->exists($user->permi_verso)) {
                Storage::disk('public')->delete($user->permi_verso);
            }
        }

        $permi_verso_path = $data['permi_verso']->store('Vehicles', 'public');

        $permi_recto_path = $data['permi_recto']->store('Vehicles', 'public');

        $isUpdated = $user->update([
            'permi_verso' => $permi_verso_path,
            'permi_recto' => $permi_recto_path
        ]);

        if ($isUpdated) {
            return true;
        }

        return false;
    }



}
