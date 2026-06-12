<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $name;
    public string $email;
    public string $contactMessage;

    public function __construct(string $name, string $email, string $subject, string $contactMessage)
    {
        $this->name = $name;
        $this->email = $email;
        $this->subject = $subject;
        $this->contactMessage = $contactMessage;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Contact Form: {$this->subject}",
            replyTo: $this->email,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-form',
            with: [
                'name' => $this->name,
                'email' => $this->email,
                'subject' => $this->subject,
                'contactMessage' => $this->contactMessage,
            ]
        );
    }
}
