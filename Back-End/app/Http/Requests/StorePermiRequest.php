<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePermiRequest extends FormRequest
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
            'permi_recto' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:2048',
            ],
            'permi_verso' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:2048',
            ],
        ];
    }


    public function messages(): array
    {
        return [
            'permi_recto.required' => 'La face avant de le Permi (recto) est requise.',
            'permi_recto.image' => 'La face avant doit être une image.',
            'permi_recto.mimes' => 'La face avant doit être un fichier de type : jpeg, png, jpg, webp.',
            'permi_recto.max' => 'L\'image de la face avant ne doit pas dépasser 2 Mo.',

            'permi_verso.required' => 'La face arrière de le Permi (verso) est requise.',
            'permi_verso.image' => 'La face arrière doit être une image.',
            'permi_verso.mimes' => 'La face arrière doit être un fichier de type : jpeg, png, jpg, webp.',
            'permi_verso.max' => 'L\'image de la face arrière ne doit pas dépasser 2 Mo.',
        ];
    }
}
