<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use GrahamCampbell\ResultType\Success;
use Illuminate\Http\Request;
use app\Services\CategoryService;

class CategoryController extends Controller
{
    public function __construct(protected CategoryService $categoryService){}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data=$this->categoryService->getAll();
        return response()->json([
            'status'=>'Success',
            'data'=>$data
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
