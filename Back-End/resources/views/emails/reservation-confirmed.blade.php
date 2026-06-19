<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réservation Confirmée</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #F0F3FA; color: #1a2a4a; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(57,88,134,0.12); }
        .header { background: #395886; padding: 32px 40px; text-align: center; }
        .header h1 { color: #F0F3FA; margin: 0; font-size: 24px; font-weight: 800; }
        .header p { color: #D5DEEF; margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px 40px; }
        .details { width: 100%; border-collapse: collapse; }
        .details td { padding: 10px 0; border-bottom: 1px solid #eef0f4; font-size: 14px; }
        .details td:first-child { color: #638ECB; font-weight: 600; width: 40%; }
        .details td:last-child { color: #1a2a4a; font-weight: 700; text-align: right; }
        .total { font-size: 18px; font-weight: 800; color: #f39c12; text-align: right; padding-top: 16px; }
        .footer { background: #F0F3FA; padding: 20px 40px; text-align: center; font-size: 12px; color: #638ECB; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Réservation Confirmée</h1>
            <p>Merci pour votre réservation, {{ $reservation->user->name }} !</p>
        </div>
        <div class="body">
            <table class="details">
                <tr>
                    <td>Véhicule</td>
                    <td>{{ $reservation->vehicle->marque }} {{ $reservation->vehicle->model }} ({{ $reservation->vehicle->year }})</td>
                </tr>
                <tr>
                    <td>Date de début</td>
                    <td>{{ \Carbon\Carbon::parse($reservation->start_date)->format('d/m/Y') }}</td>
                </tr>
                <tr>
                    <td>Date de fin</td>
                    <td>{{ \Carbon\Carbon::parse($reservation->end_date)->format('d/m/Y') }}</td>
                </tr>
                <tr>
                    <td>Statut</td>
                    <td>Confirmée</td>
                </tr>
            </table>

            <div class="total">Total : {{ number_format($reservation->TotalPrice, 2) }} DH</div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CARFORFAR &mdash; Location de voitures &agrave; Marrakech
        </div>
    </div>
</body>
</html>
