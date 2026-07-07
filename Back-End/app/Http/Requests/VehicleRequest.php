<?php
namespace app\Http\Requests;


use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
     */
    public function rules(): array
    {
        // This gets the vehicle ID from the route (e.g., /vehicles/{vehicle})
        // It will be null on 'create' and have an ID on 'update'
        $vehicleId = $this->route('Vehicle');

        return [
            'Occupants' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'registration' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicles', 'registration')->ignore($vehicleId),
            ],
            'km' => 'required|numeric|min:0',
            'pricePerDay' => 'required|numeric|min:0',
            'fuelType' => 'required|string|max:100',
            'category_id' => 'required|exists:categories,id',
            'type_vehicule_id' => 'nullable|exists:type_vehicules,id',
            'air_conditioner' => 'sometimes|boolean',
            'gps' => 'sometimes|boolean',
            'order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'country_id' => 'nullable|exists:countries,id',
            'city_id' => 'nullable|exists:cities,id',
            'pickup_country_id' => 'nullable|exists:countries,id',
            'pickup_city_id' => 'nullable|exists:cities,id',
            'current_country_id' => 'nullable|exists:countries,id',
            'current_city_id' => 'nullable|exists:cities,id',

            'images' => 'sometimes|array',
            'images.*' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:5120',
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
            
            'km.required' => 'Le kilométrage est obligatoire.',
            'km.numeric' => 'Le kilométrage doit être un nombre.',
            'pricePerDay.required' => 'Le prix par jour est obligatoire.',
            'pricePerDay.numeric' => 'Le prix doit être un nombre valide.',
            'fuelType.required' => 'Le type de carburant est obligatoire.',
            'category_id.required' => 'La catégorie est obligatoire.',
            'category_id.exists' => 'La catégorie sélectionnée n’existe pas.',
            'order.unique' => 'Cet ordre est déjà attribué à un autre véhicule.',

            // Images véhicule
            'images.array' => 'Les images doivent être envoyées sous forme de tableau.',
            'images.*.image' => 'Chaque fichier doit être une image valide.',
            'images.*.mimes' => 'Les images doivent être au format : jpg, jpeg, png ou webp.',
            'images.*.max' => 'La taille de chaque image ne doit pas dépasser 5 Mo.',
        ];
    }
}