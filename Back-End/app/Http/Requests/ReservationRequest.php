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
        $minBirthDate = now()->subYears(18)->format('Y-m-d');
        $minLicenseDate = now()->subYears(2)->format('Y-m-d');

        return [
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'extra_ids' => 'sometimes|array',
            'extra_ids.*' => 'exists:extras,id',

            // Client info
            'nom_prenom' => 'sometimes|required|string|max:255',
            'date_naissance' => 'sometimes|required|date|before_or_equal:' . $minBirthDate,
            'cin_passport' => 'sometimes|required|string|max:255',
            'adresse' => 'sometimes|required|string',
            'telephone' => 'sometimes|required|string|max:255',
            'numero_permi' => 'sometimes|required|string|max:255',
            'date_delivrance' => 'sometimes|required|date|before_or_equal:' . $minLicenseDate,
            'date_expiration' => 'sometimes|required|date|after:date_delivrance',

            // Second driver
            'driver2_nom_prenom' => 'sometimes|nullable|string|max:255',
            'driver2_date_naissance' => 'sometimes|nullable|date|before_or_equal:' . $minBirthDate,
            'driver2_cin_passport' => 'sometimes|nullable|string|max:255',
            'driver2_adresse' => 'sometimes|nullable|string',
            'driver2_telephone' => 'sometimes|nullable|string|max:255',
            'driver2_numero_permi' => 'sometimes|nullable|string|max:255',
            'driver2_date_delivrance' => 'sometimes|nullable|date|before_or_equal:' . $minLicenseDate,
            'driver2_date_expiration' => 'sometimes|nullable|date|after:driver2_date_delivrance',

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

            // Cross-field: license issue date must be at least 16 years after birth
            $this->validateLicenseVsBirth($validator, 'date_naissance', 'date_delivrance');
            $this->validateLicenseVsBirth($validator, 'driver2_date_naissance', 'driver2_date_delivrance');
        });
    }

    private function validateLicenseVsBirth($validator, $birthField, $licenseField)
    {
        $birth = $this->input($birthField);
        $license = $this->input($licenseField);
        if ($birth && $license) {
            $ageAtLicense = (new \DateTime($birth))->diff(new \DateTime($license))->y;
            if ($ageAtLicense < 16) {
                $validator->errors()->add($licenseField, 'Vous devez avoir au moins 16 ans pour obtenir un permis.');
            }
        }
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

            'date_naissance.before_or_equal' => 'Vous devez avoir au moins 18 ans pour réserver.',
            'date_delivrance.before_or_equal' => 'Le permis doit avoir au moins 2 ans.',
            'date_expiration.after' => 'La date d\'expiration doit être après la date de délivrance.',
            'driver2_date_naissance.before_or_equal' => 'Le second conducteur doit avoir au moins 18 ans.',
            'driver2_date_delivrance.before_or_equal' => 'Le permis du second conducteur doit avoir au moins 2 ans.',
            'driver2_date_expiration.after' => 'La date d\'expiration du second conducteur doit être après la date de délivrance.',
        ];
    }
}
