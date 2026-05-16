<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
class ProfileService
{
    public function displayMyProfile($id)
    {
        return User::findOrFail($id);
    }

    public function updateInformations($data)
    {
        $user = User::findOrFail(auth()->id());



        if (isset($data['profile_pic'])) {
            if ($user->profile_pic) {
                $oldPath = public_path('image/' . $user->profile_pic);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $filename = time() . '.' . $data['profile_pic']->getClientOriginalExtension();
            $data['profile_pic']->move(public_path('image'), $filename);
            $updateData['profile_pic'] = $filename;
        }


        if (!empty($data['new_password'])) {
            if (!Hash::check($data['old_password'], $user->password)||$data['new_password'] !== $data['confirme_password']) {
            return false;
            }
                }

        $user->update([
            'name'=>$data['name'],
            'email'=>$data['email'],
            'profile_pic'=>$data['profile_pic'],
            "password"=>hash('sha256', $data['new_password'])
        ]);
        return $user;
    }
}
