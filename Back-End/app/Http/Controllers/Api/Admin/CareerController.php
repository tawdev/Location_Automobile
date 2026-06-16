<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Career;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CareerController extends Controller
{
    public function index()
    {
        $careers = Career::orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $careers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'salary_range' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();

        $career = Career::create($validated);

        return response()->json(['status' => 'success', 'data' => $career], 201);
    }

    public function show(string $id)
    {
        $career = Career::find($id);
        if (!$career) {
            return response()->json(['status' => 'error', 'message' => 'Career not found'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $career]);
    }

    public function update(Request $request, string $id)
    {
        $career = Career::find($id);
        if (!$career) {
            return response()->json(['status' => 'error', 'message' => 'Career not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'salary_range' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $career->update($validated);

        return response()->json(['status' => 'success', 'data' => $career]);
    }

    public function destroy(string $id)
    {
        $career = Career::find($id);
        if (!$career) {
            return response()->json(['status' => 'error', 'message' => 'Career not found'], 404);
        }
        $career->delete();
        return response()->json(['status' => 'success', 'message' => 'Career deleted']);
    }
}
