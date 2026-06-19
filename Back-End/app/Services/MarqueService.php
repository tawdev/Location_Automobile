<?php

namespace App\Services;

use App\Models\Marque;

class MarqueService
{
    public function getAll()
    {
        return Marque::all();
    }

    public function findById($id)
    {
        return Marque::find($id);
    }

    public function getErrorResponse()
    {
        return response()->json([
            'message' => 'error',
            'data' => 'Aucune marque trouvée'
        ]);
    }

    public function getExistingError()
    {
        return response()->json([
            'message' => 'error',
            'data' => 'Cette marque existe déjà'
        ]);
    }
}
