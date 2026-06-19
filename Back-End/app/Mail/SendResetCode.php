<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendResetCode extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $code;

    public function __construct(User $user, string $code)
    {
        $this->user = $user;
        $this->code = $code;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Code de réinitialisation de mot de passe CARFORFAR',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-code',
            with: [
                'user' => $this->user,
                'code' => $this->code,
            ]
        );
    }
}
