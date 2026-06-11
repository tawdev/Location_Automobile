<?php

namespace App\Mail;

use App\Models\Reservation;
use App\Services\ContractPdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public Reservation $reservation;

    private ?array $pdfPaths = null;

    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Réservation Confirmée - Contrat de Location',
            replyTo: config('mail.from.address'),
            tags: ['reservation-confirmed'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-confirmed',
            text: 'emails.reservation-confirmed-text',
        );
    }

    public function attachments(): array
    {
        if (!$this->pdfPaths) {
            $this->pdfPaths = app(ContractPdfService::class)->generateAll($this->reservation);
        }

        $locales = [
            'fr' => 'FR',
            'en' => 'EN',
            'ar' => 'AR',
        ];

        $attachments = [];
        foreach ($locales as $code => $label) {
            $attachments[] = Attachment::fromPath($this->pdfPaths[$code])
                ->as('contrat-location-' . $label . '-' . $this->reservation->id . '.pdf')
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
