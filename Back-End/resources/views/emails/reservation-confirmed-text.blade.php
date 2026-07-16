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
    $pp = $reservation->vehicle->protection_percentage ?? 0;
    $goldPerDay = round(($reservation->vehicle->pricePerDay ?? 0) * $pp / 100);
    $protectionPerDay = $reservation->protection_level === 'gold' ? $goldPerDay : round($goldPerDay * 2);
@endphp
Protection {{ ucfirst($reservation->protection_level) }} : {{ number_format($protectionPerDay, 0) }} DH / jour
@endif
Statut : Confirmée
Total : {{ number_format($reservation->TotalPrice, 2) }} DH

Le contrat de location est joint en pièce jointe.

© {{ date('Y') }} CARFORFAR — Location de voitures à Marrakech