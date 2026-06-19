<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $blogs]);
    }

    public function show(string $slug)
    {
        $blog = Blog::where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (!$blog) {
            return response()->json(['status' => 'error', 'message' => 'Blog not found'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $blog]);
    }
}
