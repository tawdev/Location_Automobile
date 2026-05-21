<?php

namespace App\Observers;

use App\Mail\ReservationConfirmed;
use App\Models\Reservation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReservationObserver
{
    public function updated(Reservation $reservation): void
    {
        if ($reservation->wasChanged('status') && $reservation->status === 'Confirmée') {
            try {
                $reservation->loadMissing(['user', 'vehicle']);
                Mail::to($reservation->user->email)->send(new ReservationConfirmed($reservation));
                Log::info('Observer: Confirmation email sent to ' . $reservation->user->email);
            } catch (\Throwable $e) {
                Log::error('Observer: Failed to send confirmation email: ' . $e->getMessage());
            }
        }
    }
}
