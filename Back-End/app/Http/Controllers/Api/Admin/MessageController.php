<?php

namespace App\Http\Controllers\Api\Admin;

use App\Mail\ContactReplyMail;
use App\Models\ContactMessage;
use App\Models\Setting;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::latest();

        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->whereNull('read_at');
            } elseif ($request->status === 'replied') {
                $query->whereNotNull('admin_reply');
            } elseif ($request->status === 'read') {
                $query->whereNotNull('read_at')->whereNull('admin_reply');
            }
        }

        $messages = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'status' => 'success',
            'data'   => $messages,
        ]);
    }

    public function show(ContactMessage $message)
    {
        $message->markAsRead();

        return response()->json([
            'status' => 'success',
            'data'   => $message,
        ]);
    }

    public function reply(Request $request, ContactMessage $message)
    {
        $request->validate([
            'reply' => 'required|string|max:5000',
        ]);

        $adminEmail = Setting::where('key', 'email')->value('value');

        $message->update([
            'admin_reply' => $request->reply,
            'read_at'     => $message->read_at ?? now(),
        ]);

        Mail::to($message->email)
            ->send(new ContactReplyMail(
                $message->name,
                $message->subject,
                $request->reply,
            ));

        return response()->json([
            'status'  => 'success',
            'message' => 'Reply sent successfully',
            'data'    => $message,
        ]);
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Message deleted',
        ]);
    }

    public function unreadCount()
    {
        $count = ContactMessage::whereNull('read_at')->count();

        return response()->json([
            'status' => 'success',
            'data'   => ['count' => $count],
        ]);
    }
}
