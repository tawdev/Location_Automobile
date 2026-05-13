<?php

namespace app\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class VehicleRequest extends FormRequest
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
            'marque' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'registration' => 'required|string|max:255|unique:vehicles,registration',
            'km' => 'required|numeric|min:0',
            'pricePerDay' => 'required|numeric|min:0',
            'fuelType' => 'required|string|max:100',
            'category_id' => 'required|exists:categories,id',
        ];
    }

     public function messages(): array
    {
       return [
            'marque.required' => 'La marque est obligatoire.',
            'model.required' => 'Le modèle du véhicule est obligatoire.',
            'year.required' => 'Veuillez fournir l’année de fabrication.',
            'year.integer' => 'L’année doit être un nombre valide.',
            'registration.required' => 'Le numéro d’immatriculation est obligatoire.',
            'registration.unique' => 'Cette immatriculation existe déjà.',
            'registration.exists' => 'Cette immatriculation existe déjà.',
            'km.required' => 'Le kilométrage est obligatoire.',
            'km.numeric' => 'Le kilométrage doit être un nombre.',
            'pricePerDay.required' => 'Le prix par jour est obligatoire.',
            'pricePerDay.numeric' => 'Le prix doit être un nombre valide.',
            'fuelType.required' => 'Le type de carburant est obligatoire.',
            'category_id.required' => 'La catégorie est obligatoire.',
            'category_id.exists' => 'La catégorie sélectionnée n’existe pas.',
];
    }
}
