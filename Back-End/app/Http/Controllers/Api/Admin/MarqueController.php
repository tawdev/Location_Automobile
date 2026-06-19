<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Marque;
use App\Models\Vehicle;
use App\Services\MarqueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MarqueController extends Controller
{
    public function __construct(protected MarqueService $marqueService)
    {
    }

    public function index()
    {
        $data = $this->marqueService->getAll();
        if ($data->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:marques,name',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $isFound = Marque::where('name', $validated['name'])->exists();
        if ($isFound) {
            return $this->marqueService->getExistingError();
        }

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('Marques', 'public');
        }

        $marque = Marque::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Marque créée avec succès',
            'data' => $marque
        ], 201);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'names' => 'required|array|min:1',
            'names.*' => 'required|string|max:255|distinct',
        ]);

        $created = [];
        $errors = [];

        foreach ($validated['names'] as $name) {
            $existing = Marque::where('name', $name)->exists();
            if ($existing) {
                $errors[] = "« {$name} » existe déjà";
                continue;
            }
            $created[] = Marque::create(['name' => $name]);
        }

        return response()->json([
            'status' => 'success',
            'message' => count($created) . ' marque(s) créée(s)',
            'data' => $created,
            'errors' => $errors,
        ], 201);
    }

    public function show(string $id)
    {
        $marque = $this->marqueService->findById($id);

        if (!$marque) {
            return $this->marqueService->getErrorResponse();
        }

        return response()->json([
            'status' => 'success',
            'data' => $marque
        ]);
    }

    public function update(Request $request, string $id)
    {
        $marque = $this->marqueService->findById($id);

        if (!$marque) {
            return $this->marqueService->getErrorResponse();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:marques,name,' . $id,
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $isFound = Marque::where('name', $validated['name'])->where('id', '!=', $id)->exists();
        if ($isFound) {
            return $this->marqueService->getExistingError();
        }

        if ($request->hasFile('logo')) {
            if ($marque->logo) {
                Storage::disk('public')->delete($marque->logo);
            }
            $validated['logo'] = $request->file('logo')->store('Marques', 'public');
        }

        $oldName = $marque->name;
        $marque->update($validated);

        if ($oldName !== $marque->name) {
            Vehicle::where('marque', $oldName)->update(['marque' => $marque->name]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Marque mise à jour avec succès',
            'data' => $marque
        ]);
    }

    public function destroy(string $id)
    {
        $marque = $this->marqueService->findById($id);

        if (!$marque) {
            return $this->marqueService->getErrorResponse();
        }

        if ($marque->logo) {
            Storage::disk('public')->delete($marque->logo);
        }

        $marque->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Marque supprimée avec succès'
        ]);
    }
}
