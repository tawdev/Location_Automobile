<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Extra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExtraController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Extra::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price_per_day' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('Extras', 'public');
        }

        $extra = Extra::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Extra créé avec succès',
            'data' => $extra,
        ], 201);
    }

    public function show(Extra $extra)
    {
        return response()->json([
            'status' => 'success',
            'data' => $extra,
        ]);
    }

    public function update(Request $request, Extra $extra)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price_per_day' => 'sometimes|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($extra->image) {
                Storage::disk('public')->delete($extra->image);
            }
            $validated['image'] = $request->file('image')->store('Extras', 'public');
        }

        $extra->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Extra mis à jour avec succès',
            'data' => $extra,
        ]);
    }

    public function destroy(Extra $extra)
    {
        if ($extra->image) {
            Storage::disk('public')->delete($extra->image);
        }

        $extra->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Extra supprimé avec succès',
        ]);
    }
}
