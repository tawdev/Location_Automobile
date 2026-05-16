<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
   public function rules(): array
{
    return [
        'name'             => 'sometimes|nullable|string|max:255',
        'email'            => 'sometimes|nullable|email',
        'old_password'     => 'sometimes|nullable|string|min:8',
        'new_password'     => 'sometimes|nullable|string|min:8',
        'confirme_password'=> 'sometimes|nullable|string|min:8',
        'profile_pic'      => 'sometimes|nullable|image|mimes:jpg,jpeg,png|max:2048',
    ];
}


 public function messages(): array
{
    return [
        'name.string'              => 'Le nom doit être une chaîne de caractères valide.',
        'name.max'                 => 'Le nom ne doit pas dépasser 255 caractères.',

        'email.sometimes'          => 'Le champ email est optionnel.',
        'email.email'              => 'Veuillez fournir une adresse email valide.',

        'old_password.string'      => 'L\'ancien mot de passe doit être une chaîne de caractères valide.',
        'old_password.min'         => 'L\'ancien mot de passe doit contenir au moins 8 caractères.',

        'new_password.string'      => 'Le nouveau mot de passe doit être une chaîne de caractères valide.',
        'new_password.min'         => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',

        'confirme_password.string' => 'La confirmation du mot de passe doit être une chaîne de caractères valide.',
        'confirme_password.min'    => 'La confirmation du mot de passe doit contenir au moins 8 caractères.',

        'profile_pic.image'        => 'La photo de profil doit être un fichier image.',
        'profile_pic.mimes'        => 'La photo de profil doit être au format JPG, JPEG ou PNG.',
        'profile_pic.max'          => 'La photo de profil ne doit pas dépasser 2 Mo.',
    ];
}
}
