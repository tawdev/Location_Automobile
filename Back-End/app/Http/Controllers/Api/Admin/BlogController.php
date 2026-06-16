<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $blogs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'author' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'status' => 'required|in:draft,published',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();

        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('blogs', 'public');
        }

        $blog = Blog::create($validated);

        return response()->json(['status' => 'success', 'data' => $blog], 201);
    }

    public function show(string $id)
    {
        $blog = Blog::find($id);
        if (!$blog) {
            return response()->json(['status' => 'error', 'message' => 'Blog not found'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $blog]);
    }

    public function update(Request $request, string $id)
    {
        $blog = Blog::find($id);
        if (!$blog) {
            return response()->json(['status' => 'error', 'message' => 'Blog not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'author' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'status' => 'required|in:draft,published',
        ]);

        if ($request->hasFile('featured_image')) {
            if ($blog->featured_image) {
                Storage::disk('public')->delete($blog->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('blogs', 'public');
        }

        $blog->update($validated);

        return response()->json(['status' => 'success', 'data' => $blog]);
    }

    public function destroy(string $id)
    {
        $blog = Blog::find($id);
        if (!$blog) {
            return response()->json(['status' => 'error', 'message' => 'Blog not found'], 404);
        }
        if ($blog->featured_image) {
            Storage::disk('public')->delete($blog->featured_image);
        }
        $blog->delete();
        return response()->json(['status' => 'success', 'message' => 'Blog deleted']);
    }
}
