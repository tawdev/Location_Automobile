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
            'extra_ids' => 'sometimes|array',
            'extra_ids.*' => 'exists:extras,id',

            // Client info
            'nom_prenom' => 'sometimes|required|string|max:255',
            'date_naissance' => 'sometimes|required|date',
            'cin_passport' => 'sometimes|required|string|max:255',
            'adresse' => 'sometimes|required|string',
            'telephone' => 'sometimes|required|string|max:255',
            'numero_permi' => 'sometimes|required|string|max:255',
            'date_delivrance' => 'sometimes|required|date',
            'date_expiration' => 'sometimes|required|date',

            // Second driver
            'driver2_nom_prenom' => 'sometimes|nullable|string|max:255',
            'driver2_date_naissance' => 'sometimes|nullable|date',
            'driver2_cin_passport' => 'sometimes|nullable|string|max:255',
            'driver2_adresse' => 'sometimes|nullable|string',
            'driver2_telephone' => 'sometimes|nullable|string|max:255',
            'driver2_numero_permi' => 'sometimes|nullable|string|max:255',
            'driver2_date_delivrance' => 'sometimes|nullable|date',
            'driver2_date_expiration' => 'sometimes|nullable|date',

            // Caution
            'caution_montant' => 'sometimes|nullable|numeric|min:0',
            'caution_mode' => 'sometimes|nullable|string|in:carte_bancaire,especes,passport,autre',

            // Location
            'lieu_depart' => 'sometimes|nullable|string|max:255',
            'lieu_retour' => 'sometimes|nullable|string|max:255',
            'date_heure_depart' => 'sometimes|nullable|date',
            'date_heure_retour' => 'sometimes|nullable|date|after:date_heure_depart',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $start = $this->input('start_date');
            $end = $this->input('end_date');
            if ($start && $end) {
                $days = (new \DateTime($start))->diff(new \DateTime($end))->days;
                if ($days < 3) {
                    $validator->errors()->add('end_date', 'La durée minimale de réservation est de 3 jours.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'La date de début est obligatoire.',
            'start_date.date' => 'La date de début doit être une date valide.',
            'start_date.after_or_equal' => 'La date de début doit être aujourd\'hui ou une date future.',

            'end_date.required' => 'La date de fin est obligatoire.',
            'end_date.date' => 'La date de fin doit être une date valide.',
            'end_date.after' => 'La date de fin doit être après la date de début.',

            'user_id.required' => 'L\'utilisateur est obligatoire.',
            'user_id.exists' => 'L\'utilisateur sélectionné n\'existe pas.',

            'vehicle_id.required' => 'Le véhicule est obligatoire.',
            'vehicle_id.exists' => 'Le véhicule sélectionné n\'existe pas.',
        ];
    }
}
