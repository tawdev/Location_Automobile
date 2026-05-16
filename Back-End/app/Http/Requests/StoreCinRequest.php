<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'cin_recto' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:2048',
            ],
            'cin_verso' => [
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
            'cin_recto.required' => 'La face avant de la CIN (recto) est requise.',
            'cin_recto.image' => 'La face avant doit être une image.',
            'cin_recto.mimes' => 'La face avant doit être un fichier de type : jpeg, png, jpg, webp.',
            'cin_recto.max' => 'L\'image de la face avant ne doit pas dépasser 2 Mo.',

            'cin_verso.required' => 'La face arrière de la CIN (verso) est requise.',
            'cin_verso.image' => 'La face arrière doit être une image.',
            'cin_verso.mimes' => 'La face arrière doit être un fichier de type : jpeg, png, jpg, webp.',
            'cin_verso.max' => 'L\'image de la face arrière ne doit pas dépasser 2 Mo.',
        ];
    }
}