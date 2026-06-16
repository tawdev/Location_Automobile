<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PressRelease;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PressController extends Controller
{
    public function index()
    {
        $press = PressRelease::orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $press]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'category' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'status' => 'required|in:draft,published',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();

        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('press', 'public');
        }

        $press = PressRelease::create($validated);

        return response()->json(['status' => 'success', 'data' => $press], 201);
    }

    public function show(string $id)
    {
        $press = PressRelease::find($id);
        if (!$press) {
            return response()->json(['status' => 'error', 'message' => 'Press release not found'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $press]);
    }

    public function update(Request $request, string $id)
    {
        $press = PressRelease::find($id);
        if (!$press) {
            return response()->json(['status' => 'error', 'message' => 'Press release not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'category' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'status' => 'required|in:draft,published',
        ]);

        if ($request->hasFile('featured_image')) {
            if ($press->featured_image) {
                Storage::disk('public')->delete($press->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('press', 'public');
        }

        $press->update($validated);

        return response()->json(['status' => 'success', 'data' => $press]);
    }

    public function destroy(string $id)
    {
        $press = PressRelease::find($id);
        if (!$press) {
            return response()->json(['status' => 'error', 'message' => 'Press release not found'], 404);
        }
        if ($press->featured_image) {
            Storage::disk('public')->delete($press->featured_image);
        }
        $press->delete();
        return response()->json(['status' => 'success', 'message' => 'Press release deleted']);
    }
}
