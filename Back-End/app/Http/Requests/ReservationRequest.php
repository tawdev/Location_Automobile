<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',

            // 'user_id' => 'required|exists:users,id',
            // 'vehicle_id' => 'required|exists:vehicles,id',
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'La date de début est obligatoire.',
            'start_date.date' => 'La date de début doit être une date valide.',
            'start_date.after_or_equal' => 'La date de début doit être aujourd’hui ou une date future.',

            'end_date.required' => 'La date de fin est obligatoire.',
            'end_date.date' => 'La date de fin doit être une date valide.',
            'end_date.after' => 'La date de fin doit être après la date de début.',

            'user_id.required' => 'L’utilisateur est obligatoire.',
            'user_id.exists' => 'L’utilisateur sélectionné n’existe pas.',

            'vehicle_id.required' => 'Le véhicule est obligatoire.',
            'vehicle_id.exists' => 'Le véhicule sélectionné n’existe pas.',
        ];
    }
}
