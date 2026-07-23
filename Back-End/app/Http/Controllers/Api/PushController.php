<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Minishlink\WebPush\Subscription as WebPushSubscription;
use Minishlink\WebPush\WebPush;

class PushController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
            'p256dh'   => 'required|string',
            'auth'     => 'required|string',
        ]);

        $user = $request->user();

        PushSubscription::updateOrCreate(
            ['user_id' => $user->id, 'endpoint' => $validated['endpoint']],
            [
                'p256dh_key' => $validated['p256dh'],
                'auth_key'   => $validated['auth'],
            ]
        );

        return response()->json(['status' => 'success', 'message' => 'Subscribed to push notifications']);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
        ]);

        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        return response()->json(['status' => 'success', 'message' => 'Unsubscribed from push notifications']);
    }

    public function vapidKey(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => ['key' => config('services.webpush.vapid.public_key')],
        ]);
    }

    public static function sendNotification($user, string $title, string $body, string $url = '/vehicules'): void
    {
        $subscriptions = PushSubscription::where('user_id', $user->id)->get();

        if ($subscriptions->isEmpty()) {
            return;
        }

        $auth = [
            'VAPID' => [
                'subject'    => config('services.webpush.vapid.subject'),
                'publicKey'  => config('services.webpush.vapid.public_key'),
                'privateKey' => config('services.webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);

        $payload = json_encode([
            'title' => $title,
            'body'  => $body,
            'url'   => $url,
            'icon'  => '/pwa-icon-192.png',
        ]);

        foreach ($subscriptions as $sub) {
            $webPushSubscription = WebPushSubscription::create([
                'endpoint' => $sub->endpoint,
                'keys'     => [
                    'p256dh' => $sub->p256dh_key,
                    'auth'   => $sub->auth_key,
                ],
            ]);

            $report = $webPush->sendOneNotification($webPushSubscription, $payload);

            if ($report->isSent() && $report->statusCode === 410) {
                $sub->delete();
            }
        }

        $webPush->flush();
    }

    public static function notifyAllClients(string $title, string $body, string $url = '/vehicules'): void
    {
        $subscribers = PushSubscription::whereHas('user', function ($q) {
            $q->where('role_id', '!=', 1);
        })->with('user')->get()->unique('user_id');

        foreach ($subscribers as $sub) {
            self::sendNotification($sub->user, $title, $body, $url);
        }
    }
}
