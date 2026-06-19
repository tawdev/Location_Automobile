<?php

namespace App\Http\Controllers\Api;

use App\Mail\ContactFormMail;
use App\Models\ContactMessage;
use App\Models\Setting;
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

        $message = ContactMessage::create([
            'name'    => $data['name'],
            'email'   => $data['email'],
            'subject' => $data['subject'],
            'message' => $data['message'],
        ]);

        $adminEmail = Setting::where('key', 'email')->value('value') ?? config('mail.from.address');

        Mail::to($adminEmail)
            ->send(new ContactFormMail(
                $data['name'],
                $data['email'],
                $data['subject'],
                $data['message'],
            ));

        return response()->json([
            'message' => 'Message sent successfully',
            'data'    => $message,
        ]);
    }
}
