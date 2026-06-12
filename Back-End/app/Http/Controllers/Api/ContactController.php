<?php

namespace App\Http\Controllers\Api;

use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        Mail::to(config('mail.from.address'))
            ->send(new ContactFormMail(
                $data['name'],
                $data['email'],
                $data['subject'],
                $data['message'],
            ));

        return response()->json(['message' => 'Message sent successfully']);
    }
}
