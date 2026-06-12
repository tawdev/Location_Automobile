<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $clientName;
    public string $originalSubject;
    public string $replyMessage;

    public function __construct(string $clientName, string $originalSubject, string $replyMessage)
    {
        $this->clientName = $clientName;
        $this->originalSubject = $originalSubject;
        $this->replyMessage = $replyMessage;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Re: {$this->originalSubject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-reply',
            with: [
                'clientName' => $this->clientName,
                'originalSubject' => $this->originalSubject,
                'replyMessage' => $this->replyMessage,
            ]
        );
    }
}
