Réservation Confirmée
Merci pour votre réservation, {{ $reservation->user->name }} !

Véhicule : {{ $reservation->vehicle->marque }} {{ $reservation->vehicle->model }} ({{ $reservation->vehicle->year }})
Date de début : {{ \Carbon\Carbon::parse($reservation->start_date)->format('d/m/Y') }}
Date de fin : {{ \Carbon\Carbon::parse($reservation->end_date)->format('d/m/Y') }}
@if($reservation->return_location_name)
Lieu de retour : {{ $reservation->return_location_name }}
@endif
@if($reservation->return_location_supplement && $reservation->return_location_supplement > 0)
Supplément retour : {{ number_format($reservation->return_location_supplement, 2) }} DH
@endif
@if($reservation->protection_level && $reservation->protection_level !== 'basic')
@php
    $v = $reservation->vehicle;
    $pct = ($v->protection_price_percentage ?? 0) / 100;
    $goldPerDay = round(150 + 150 * $pct);
    $platinumPerDay = round(300 + 300 * $pct);
    $protectionPerDay = $reservation->protection_level === 'gold' ? $goldPerDay : $platinumPerDay;
@endphp
Protection {{ ucfirst($reservation->protection_level) }} : {{ number_format($protectionPerDay, 0) }} DH / jour
@endif
Statut : Confirmée
Total : {{ number_format($reservation->TotalPrice, 2) }} DH

Le contrat de location est joint en pièce jointe.

© {{ date('Y') }} CARFORFAR — Location de voitures à Marrakech