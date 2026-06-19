<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Reservation;

class RemindeEndReservation extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public Reservation $reservation;
    public function __construct(Reservation $reservation)
    {
            $this->reservation=$reservation;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rappel - Votre réservation se termine bientôt',
        );
    }

    /**
     * Get the message content definition.
     */
       public function content(): Content
    {
        return new Content(
            view: 'emails.reminder-end-reservation',
            with: [
                'reservation'  => $this->reservation,
                'customerName' => $this->reservation->user->name,
                'endDate'      => $this->reservation->end_date->format('d/m/Y'),
                'endTime'      => $this->reservation->end_date->format('H:i'),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
