<?php

namespace App\Services;

use App\Models\Category;

class CategoryService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }



    public function getAll()
    {
        return Category::all();
    }




    public function ValidateCategory($request)
    {
        $CategoryName = $request->validate([
            'name' => ['required', 'string', 'max:255']
        ]);
        return $CategoryName;
    }


    public function findById($id)
    {
        $Category = Category::find($id);
        return $Category;
    }


    public function getErrorResponse()
    {
        return response()->json([
            'message' => 'error',
            'data' => 'Aucune catégorie trouvée'
        ]);
    }


    public function getExistingError()
    {
        return response()->json([
            'message' => 'error',
            'data' => 'category déja exists'
        ]);
    }
}
