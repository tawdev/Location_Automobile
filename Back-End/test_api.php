<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dates = Illuminate\Support\Facades\DB::table('reservations')
    ->where('status', 'Confirmée')
    ->where('vehicle_id', 2)
    ->select('id', 'vehicle_id', 'start_date', 'end_date', 'status')
    ->get();

echo json_encode(['data' => $dates], JSON_PRETTY_PRINT) . "\n";
