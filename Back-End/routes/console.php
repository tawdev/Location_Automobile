<?php

use App\Mail\RemindeEndReservation;
use App\Models\Picture;
use App\Models\Reservation;
use App\Models\Vehicle;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('reservations:send-reminders')->dailyAt('08:00');

Artisan::command('reservations:send-reminders {--loop} {--interval=3}', function () {
    $interval = (int) $this->option('interval');

    do {
        $this->info('Sending reminder emails for reservations ending in 24h...');
        $sent = 0;
        $errors = 0;

        $reservations = Reservation::with(['user', 'vehicle'])
            ->where('status', 'Confirmée')
            ->whereDate('end_date', now()->addDay()->toDateString())
            ->get();

        foreach ($reservations as $reservation) {
            try {
                Mail::to($reservation->user->email)->send(new RemindeEndReservation($reservation));
                $sent++;
            } catch (\Throwable $e) {
                $this->warn("  Failed for reservation #{$reservation->id}: {$e->getMessage()}");
                $errors++;
            }
        }

        $this->info("Sent: {$sent}, Errors: {$errors}");

        if ($this->option('loop')) {
            $this->info("Sleeping {$interval}s...");
            sleep($interval);
        }
    } while ($this->option('loop'));
})->purpose('Send reminder emails for reservations ending within 24 hours');

Artisan::command('vehicles:seed-images', function () {
    $images = [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    ];

    $vehicles = Vehicle::whereDoesntHave('pictures')->get();
    $total = $vehicles->count();

    if ($total === 0) {
        $this->info('All vehicles already have images.');
        return;
    }

    $this->info("Seeding images for {$total} vehicles...");

    foreach ($vehicles as $i => $vehicle) {
        $url = $images[$i % count($images)];
        $filename = "vehicle-{$vehicle->id}-" . uniqid() . ".jpg";

        try {
            $response = Http::withoutVerifying()->timeout(30)->get($url);
            if (!$response->successful()) {
                $this->warn("  [{$i}/{$total}] HTTP {$response->status()} for {$vehicle->marque} {$vehicle->model}");
                continue;
            }
            $storedPath = Storage::disk('public')->put("Vehicles/{$filename}", $response->body());
            if ($storedPath) {
                $vehicle->pictures()->create(['path' => "Vehicles/{$filename}"]);
                $this->info("  [{$i}/{$total}] Added image to {$vehicle->marque} {$vehicle->model}");
            }
        } catch (\Exception $e) {
            $msg = $e->getMessage();
            $this->warn("  [{$i}/{$total}] Error for {$vehicle->marque} {$vehicle->model}: {$msg}");
        }
    }

    $this->info('Done!');
})->purpose('Seed Unsplash car images for all vehicles without pictures');
