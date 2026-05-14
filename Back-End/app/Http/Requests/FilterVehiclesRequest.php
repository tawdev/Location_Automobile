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
        ];
    }
}