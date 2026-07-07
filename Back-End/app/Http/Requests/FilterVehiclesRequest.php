<?php



namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FilterVehiclesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'marque' => 'nullable|string|max:50',
            'model' => 'nullable|string|max:50',
            'fuel_type' => 'nullable|in:Electricity,Diesel,Gasoline,hybrid,LPG,CNG,biofuels',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|gte:min_price',
            'pickup_date' => 'nullable|date',
            'return_date' => 'nullable|date|after_or_equal:pickup_date',
            'country_id' => 'nullable|exists:countries,id',
            'city_id' => 'nullable|exists:cities,id',
            'pickup_country_id' => 'nullable|exists:countries,id',
            'pickup_city_id' => 'nullable|exists:cities,id',
        ];
    }
}