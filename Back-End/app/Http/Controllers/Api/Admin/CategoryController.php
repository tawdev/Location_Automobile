<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use GrahamCampbell\ResultType\Success;
use Illuminate\Http\Request;
use App\Services\CategoryService;

class CategoryController extends Controller
{
    public function __construct(protected CategoryService $categoryService)
    {
    }

    public function index()
    {

        $data = $this->categoryService->getAll();
        if (!$data) {
            return $this->categoryService->getErrorResponse();
        }
        return response()->json([
            'status' => 'succès',
            'data' => $data
        ]);

    }

    public function store(Request $request)
    {
        $CategoryName = $this->categoryService->ValidateCategory($request);


        $isFound = Category::where('name', $CategoryName['name'])->exists();
        if ($isFound) {
            return $this->categoryService->getExistingError();
        }
        $Category = Category::create($CategoryName);

        return response()->json([
            'message' => 'succès',
            'data' => $Category
        ]);

    }


    public function show(string $id)
    {
        $Category = Category::find($id);

        if (!$Category) {
            return $this->categoryService->getErrorResponse();
        }

        return response()->json([
            'message' => 'succès',
            'data' => $Category
        ]);
    }


    public function update(Request $request, string $id)
    {
        $CategoryName = $this->categoryService->ValidateCategory($request);

        $Category = Category::find($id);

        if (!$Category) {
            return $this->categoryService->getErrorResponse();
        }

        $isFound = Category::where('name', $CategoryName['name'])->exists();

        if ($isFound) {
            return $this->categoryService->getExistingError();
        }

        $Category->update($CategoryName);

        return response()->json([
            'message' => 'succès',
            'data' => $Category
        ]);

    }


    public function destroy(string $id)
    {
        $Category = $this->categoryService->findById($id);

        if ($Category) {
            $Category->delete();
            return response()->json([
                'message' => 'succès',
                'data' => 'Catégorie supprimée avec succès'
            ]);
        }

        return $this->categoryService->getErrorResponse();
    }





    public function FilterByName(Request $request)
    {
        $Category = $this->categoryService->ValidateCategory($request);
       
        $Categoryies = Category::where('name', 'LIKE', "%{$Category['name']}%")->get();

        if (!$Categoryies) {
            return $this->categoryService->getErrorResponse();
        }

        return response()->json([
            'message' => 'succès',
            'data' => $Categoryies
        ]);
    }
}
