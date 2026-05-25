<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réinitialisation de mot de passe</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #F0F3FA; color: #1a2a4a; }
        .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(57,88,134,0.12); }
        .header { background: #395886; padding: 32px 40px; text-align: center; }
        .header h1 { color: #F0F3FA; margin: 0; font-size: 22px; font-weight: 800; }
        .header p { color: #D5DEEF; margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px 40px; text-align: center; }
        .code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #395886; background: #F0F3FA; padding: 16px 24px; border-radius: 12px; display: inline-block; margin: 16px 0; }
        .footer { background: #F0F3FA; padding: 20px 40px; text-align: center; font-size: 12px; color: #638ECB; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Réinitialisation de mot de passe</h1>
            <p>Bonjour {{ $user->name }} !</p>
        </div>
        <div class="body">
            <p style="font-size: 15px; font-weight: 600; color: #1a2a4a; margin-bottom: 8px;">
                Utilisez le code ci-dessous pour réinitialiser votre mot de passe :
            </p>
            <div class="code">{{ $code }}</div>
            <p style="font-size: 13px; color: #638ECB; margin-top: 20px;">
                Ce code expirera dans 10 minutes. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CARFORFAR &mdash; Location de voitures à Marrakech
        </div>
    </div>
</body>
</html>
