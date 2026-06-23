<?php

namespace App\Http\Controllers\Api\Auth;


use App\Http\Controllers\Controller;
use App\Mail\SendResetCode;
use App\Mail\SendVerificationCode;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $clientRole = Role::query()->where('name', 'Client')->first();

        if (!$clientRole) {
            return response()->json([
                'message' => 'Le rôle client est manquant. Commencez par les rôles de départ.',
            ], 500);
        }

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $clientRole->id,
        ]);

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update(['verification_code' => $code]);

        try {
            Mail::to($user->email)->send(new SendVerificationCode($user, $code));
        } catch (\Throwable $e) {
            Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return response()->json([
            'user_id' => $user->id,
            'message' => 'Un code de vérification vous a été envoyé par email.',
        ], 201);
    }

    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = User::find($validated['user_id']);

        if (!$user || $user->verification_code !== $validated['code']) {
            return response()->json([
                'message' => 'Code de vérification invalide.',
            ], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    public function resendCode(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::find($validated['user_id']);

        if (!$user || $user->email_verified_at) {
            return response()->json([
                'message' => 'Email déjà vérifié.',
            ], 422);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update(['verification_code' => $code]);

        try {
            Mail::to($user->email)->send(new SendVerificationCode($user, $code));
        } catch (\Throwable $e) {
            Log::error('Failed to resend verification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Un nouveau code vous a été envoyé par email.',
        ], 200);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Identifiants invalides',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Déconnexion réussie'], 202);
    }



    public function userinfo(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        return response()->json([
            'message' => 'information du l’utilisateur',
            'data' => $user,
        ], 200);
    }

    public function googleRedirect()
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider = Socialite::driver('google');
        $provider->stateless();
        $provider->redirectUrl(config('services.google.redirect'));
        return $provider->redirect();
    }

    public function googleCallback(Request $request)
    {
        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
            $provider = Socialite::driver('google');
            $provider->stateless();
            $provider->redirectUrl(config('services.google.redirect'));
            $googleUser = $provider->user();
        } catch (\Exception $e) {
            Log::error('Google callback failed: ' . $e->getMessage(), [
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return redirect()->away(env('FRONTEND_URL') . '/login?error=google_auth_failed');
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'google_avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                $clientRole = Role::query()->where('name', 'Client')->first();

                if (!$clientRole) {
                    return redirect()->away(env('FRONTEND_URL') . '/login?error=missing_role');
                }

                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(32)),
                    'role_id' => $clientRole->id,
                    'google_id' => $googleUser->getId(),
                    'google_avatar' => $googleUser->getAvatar(),
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Pass token via session/fragment instead of query param to avoid logging
        return redirect()->away(env('FRONTEND_URL') . '/auth/callback#token=' . $token);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $code,
                'created_at' => now(),
            ]
        );

        try {
            Mail::to($user->email)->send(new SendResetCode($user, $code));
        } catch (\Throwable $e) {
            Log::error('Failed to send reset code: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Un code de réinitialisation vous a été envoyé par email.',
        ], 200);
    }

    public function verifyResetCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$record || $record->token !== $validated['code']) {
            return response()->json([
                'message' => 'Code de réinitialisation invalide.',
            ], 422);
        }

        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->diffInMinutes(now()) > 10) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'message' => 'Le code a expiré. Veuillez en demander un nouveau.',
            ], 422);
        }

        return response()->json([
            'message' => 'Code valide.',
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$record || $record->token !== $validated['code']) {
            return response()->json([
                'message' => 'Code de réinitialisation invalide.',
            ], 422);
        }

        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->diffInMinutes(now()) > 10) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'message' => 'Le code a expiré. Veuillez en demander un nouveau.',
            ], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ], 200);
    }
}
