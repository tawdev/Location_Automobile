<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function __construct(
        protected VehicleService $vehicleService
    ) {}

    public function index()
    {
        return $this->vehicleService->getAll();
    }

    public function store(Request $request)
    {
        return $this->vehicleService->create($request->all());
    }
}
