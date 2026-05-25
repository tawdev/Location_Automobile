<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$r = Illuminate\Support\Facades\DB::table('reservations')
    ->where('status', 'Confirmée')
    ->select('id','vehicle_id','start_date','end_date')
    ->get();
foreach ($r as $v) {
    echo "#{$v->id} vehicle={$v->vehicle_id} {$v->start_date} -> {$v->end_date}\n";
}
echo 'Total: ' . count($r) . "\n";
