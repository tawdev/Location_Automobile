<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Rappel de fin de réservation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #F0F3FA; color: #1a2a4a; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(57,88,134,0.12); }
        .header { background: #ff8d21; padding: 32px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }
        .header p { color: #fff3e0; margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px 40px; }
        
        .details { width: 100%; border-collapse: collapse; }
        .details td { padding: 10px 0; border-bottom: 1px solid #eef0f4; font-size: 14px; }
        .details td:first-child { color: #638ECB; font-weight: 600; width: 40%; }
        .details td:last-child { color: #1a2a4a; font-weight: 700; text-align: right; }
        .footer { background: #F0F3FA; padding: 20px 40px; text-align: center; font-size: 12px; color: #638ECB; }
        .highlight { background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 16px; margin-top: 20px; font-size: 13px; color: #795548; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rappel de fin de réservation</h1>
            <p>Bonjour {{ $customerName }},</p>
        </div>
        <div class="body">
            <p>Ceci est un rappel que votre réservation pour le véhicule suivant se termine bientôt :</p>
            <table class="details">
                <tr>
                    <td>Véhicule</td>
                    <td>{{ $reservation->vehicle->marque }} {{ $reservation->vehicle->model }}</td>
                </tr>
                <tr>
                    <td>Date de début</td>
                    <td>{{ \Carbon\Carbon::parse($reservation->start_date)->format('d/m/Y') }}</td>
                </tr>
                <tr>
                    <td>Date de fin</td>
                    <td>{{ $endDate }}</td>
                </tr>
            </table>
            <div class="highlight">
                Merci de ramener le véhicule à l'agence à la date de fin prévue.<br>
                En cas de besoin, contactez notre service conciergerie.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CARFORFAR &mdash; Location de voitures &agrave; Marrakech
        </div>
    </div>
</body>
</html>
