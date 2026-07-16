<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
    <meta charset="utf-8">
    <title>Contrat de Location - CARFORFAR</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 9.5px;
            line-height: 1.45;
            color: #1a2a4a;
            background: #fff;
        }
        :root { --dark: #395886; --mid: #638ECB; --light: #D5DEEF; --bg: #F0F3FA; --amber: #ff8d21; --text: #1a2a4a; --muted: #64748b; --white: #ffffff; }
        .page-frame { position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 0; }
        .page-frame .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 7px; background: var(--dark); }
        .page-frame .bottom-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 5px; background: var(--dark); }
        .page-frame .left-stripe { position: absolute; top: 7px; left: 0; bottom: 5px; width: 3px; background: var(--amber); }
        .page-frame .right-stripe { position: absolute; top: 7px; right: 0; bottom: 5px; width: 3px; background: var(--mid); }
        .content { position: relative; z-index: 1; margin: 10px 14px 10px 14px; }
        .header { display: table; width: 100%; border: 1.5px solid var(--dark); border-top: 3.5px solid var(--amber); border-radius: 5px; background: var(--white); margin-bottom: 8px; overflow: hidden; }
        .header-logo-cell { display: table-cell; width: 60px; vertical-align: middle; text-align: center; padding: 8px; border-right: 1px solid var(--light); }
        .header-logo-cell img { width: 52px; height: 52px; object-fit: contain; }
        .header-title-cell { display: table-cell; vertical-align: middle; text-align: center; padding: 8px 12px; }
        .header-title { font-size: 14px; font-weight: bold; color: var(--dark); letter-spacing: 0.5px; margin-bottom: 2px; }
        .header-company { font-size: 11px; font-weight: bold; color: var(--dark); margin-bottom: 4px; }
        .header-meta { font-size: 8px; color: var(--muted); }
        .header-meta span { margin: 0 4px; color: var(--light); }
        .section-header { display: table; width: 100%; background: var(--dark); border-radius: 4px; margin: 8px 0 4px 0; overflow: hidden; }
        .section-num { display: table-cell; width: 22px; text-align: center; vertical-align: middle; font-size: 9px; font-weight: bold; color: var(--amber); padding: 4px 4px 4px 8px; }
        .section-title { display: table-cell; vertical-align: middle; font-size: 9.5px; font-weight: bold; color: var(--white); padding: 4px 8px; }
        table.info { width: 100%; border-collapse: collapse; }
        table.info tr:nth-child(odd) { background: var(--bg); }
        table.info tr:nth-child(even) { background: var(--white); }
        table.info tr { border-bottom: 0.4px solid var(--light); }
        table.info td { padding: 3.5px 8px; vertical-align: middle; }
        td.lbl { width: 30%; font-weight: bold; font-size: 8.5px; color: var(--dark); }
        td.val { width: 70%; font-size: 8.5px; color: var(--muted); }
        td.val .fill { border-bottom: 0.8px solid #b0bcd4; display: inline-block; width: 90%; height: 12px; }
        tr.total-row td { background: var(--dark) !important; color: var(--white) !important; font-weight: bold; }
        .checkbox-row { padding: 3px 8px; font-size: 8.5px; border-bottom: 0.4px solid var(--light); }
        .checkbox-row:nth-child(odd) { background: var(--bg); }
        .checkbox-row .chk { margin-right: 5px; }
        .bilingual-row { padding: 3.5px 8px; font-size: 8.5px; border-bottom: 0.4px solid var(--light); }
        .bilingual-row:nth-child(odd) { background: var(--bg); }
        .bullet { color: var(--amber); margin-right: 4px; }
        .obs-label { font-weight: bold; font-size: 8.5px; padding: 3px 8px; color: var(--dark); }
        .obs-box { border: 0.8px solid var(--light); border-left: 3px solid var(--mid); background: var(--bg); min-height: 22px; margin: 2px 0 6px 0; border-radius: 3px; }
        .mode-label { font-weight: bold; font-size: 8.5px; padding: 3px 8px; color: var(--dark); }
        .signatures { display: table; width: 100%; margin-top: 5px; }
        .sig-box { display: table-cell; width: 48%; border: 1px solid var(--light); border-top: 3px solid var(--amber); border-radius: 4px; background: var(--bg); padding: 8px 10px; vertical-align: top; }
        .sig-gap { display: table-cell; width: 4%; }
        .sig-title { font-weight: bold; font-size: 9px; color: var(--dark); margin-bottom: 4px; }
        .sig-name { font-size: 8.5px; color: var(--muted); margin-bottom: 14px; }
        .sig-line { border-bottom: 0.8px solid var(--dark); margin-bottom: 3px; }
        .sig-hint { font-size: 7px; color: var(--muted); margin-bottom: 5px; }
        .sig-date { font-size: 8.5px; color: var(--muted); }
        .footer { text-align: center; font-size: 7px; color: var(--muted); margin-top: 8px; border-top: 0.5px solid var(--light); padding-top: 4px; }
        .page-break { page-break-before: always; }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            height: 300px;
            opacity: 0.12;
            pointer-events: none;
            z-index: 0;
        }
        .watermark img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: blur(2px);
        }
        .footer-logo {
            text-align: center;
            margin-top: 6px;
        }
        .footer-logo img {
            width: 60px;
            height: 60px;
            object-fit: contain;
            opacity: 0.6;
        }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
<div class="watermark">
    <img src="{{ $logoBase64 }}" alt="CARFORFAR">
</div>
<div class="page-frame">
    <div class="top-bar"></div>
    <div class="bottom-bar"></div>
    <div class="left-stripe"></div>
    <div class="right-stripe"></div>
</div>
<div class="content">

    <div class="header">
        <div class="header-logo-cell">
        <img src="{{ $logoBase64 }}" alt="CARFORFAR">
    </div>
        <div class="header-title-cell">
            <div class="header-title">CONTRAT DE LOCATION DE V&Eacute;HICULE</div>
            <div class="header-company">CARFORFAR</div>
            <div class="header-meta">
                Contrat N&deg; : <strong>{{ str_pad($reservation->id, 6, '0', STR_PAD_LEFT) }}</strong>
                <span>|</span> Date : <strong>{{ \Carbon\Carbon::now()->format('d/m/Y') }}</strong>
                <span>|</span> Lieu : <strong>Marrakech</strong>
                <span>|</span> Statut : <strong>{{ $reservation->status ?? 'En attente' }}</strong>
                <span>|</span> Total : <strong>{{ $reservation->TotalPrice ? number_format($reservation->TotalPrice, 2) . ' DH' : 'N/C' }}</strong>
            </div>
        </div>
        <div class="header-logo-cell">
            <img src="{{ $logoBase64 }}" alt="CARFORFAR"/>        </div>
    </div>

    <div class="section-header">
        <div class="section-num">1</div>
        <div class="section-title">IDENTIFICATION DU LOCATAIRE</div>
    </div>
    @php $u = $reservation->user; @endphp
    <table class="info">
        <tr><td class="lbl">Nom et pr&eacute;nom</td><td class="val">{{ $u->name }}</td></tr>
        <tr><td class="lbl">Date de naissance</td><td class="val">{{ $u->date_of_birth ? \Carbon\Carbon::parse($u->date_of_birth)->format('d/m/Y') : '' }}</td></tr>
        <tr><td class="lbl">N&deg; CIN / Passeport</td><td class="val">{{ $u->cin_passport ?? '' }}</td></tr>
        <tr><td class="lbl">Adresse</td><td class="val">{{ $u->address ?? '' }}</td></tr>
        <tr><td class="lbl">T&eacute;l&eacute;phone</td><td class="val">{{ $u->phone ?? '' }}</td></tr>
        <tr><td class="lbl">Email</td><td class="val">{{ $u->email }}</td></tr>
        <tr><td class="lbl">N&deg; Permis de conduire</td><td class="val">{{ $u->driver_license_number ?? '' }}</td></tr>
        <tr><td class="lbl">Date de d&eacute;livrance</td><td class="val">{{ $u->license_issue_date ? \Carbon\Carbon::parse($u->license_issue_date)->format('d/m/Y') : '' }}</td></tr>
        <tr><td class="lbl">Date d'expiration</td><td class="val">{{ $u->license_expiry_date ? \Carbon\Carbon::parse($u->license_expiry_date)->format('d/m/Y') : '' }}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">2</div>
        <div class="section-title">CONDUCTEUR SUPPL&Eacute;MENTAIRE (OPTIONNEL)</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Nom et pr&eacute;nom</td><td class="val">{{ $reservation->driver2_nom_prenom ?? $reservation->driver2_name ?? '' }}</td></tr>
        <tr><td class="lbl">Date de naissance</td><td class="val">{{ $reservation->driver2_date_naissance ? \Carbon\Carbon::parse($reservation->driver2_date_naissance)->format('d/m/Y') : '' }}</td></tr>
        <tr><td class="lbl">N&deg; CIN / Passeport</td><td class="val">{{ $reservation->driver2_cin_passport ?? '' }}</td></tr>
        <tr><td class="lbl">Adresse</td><td class="val">{{ $reservation->driver2_adresse ?? '' }}</td></tr>
        <tr><td class="lbl">T&eacute;l&eacute;phone</td><td class="val">{{ $reservation->driver2_telephone ?? '' }}</td></tr>
        <tr><td class="lbl">N&deg; Permis de conduire</td><td class="val">{{ $reservation->driver2_numero_permi ?? '' }}</td></tr>
        <tr><td class="lbl">Date de d&eacute;livrance</td><td class="val">{{ $reservation->driver2_date_delivrance ? \Carbon\Carbon::parse($reservation->driver2_date_delivrance)->format('d/m/Y') : '' }}</td></tr>
        <tr><td class="lbl">Date d'expiration</td><td class="val">{{ $reservation->driver2_date_expiration ? \Carbon\Carbon::parse($reservation->driver2_date_expiration)->format('d/m/Y') : '' }}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">3</div>
        <div class="section-title">INFORMATIONS DU V&Eacute;HICULE</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Marque</td><td class="val">{{ $reservation->vehicle->marque }}</td></tr>
        <tr><td class="lbl">Mod&egrave;le</td><td class="val">{{ $reservation->vehicle->model }}</td></tr>
        <tr><td class="lbl">Cat&eacute;gorie</td><td class="val">{{ $reservation->vehicle->category->name ?? '' }}</td></tr>
        <tr><td class="lbl">Type</td><td class="val">{{ $reservation->vehicle->typeVehicule->name ?? '' }}</td></tr>
        <tr><td class="lbl">Immatriculation</td><td class="val">{{ $reservation->vehicle->registration }}</td></tr>
        <tr><td class="lbl">Kilom&eacute;trage d&eacute;part</td><td class="val">{{ $reservation->vehicle->km }} km</td></tr>
        <tr><td class="lbl">Niveau carburant d&eacute;part</td><td class="val">{{ $reservation->vehicle->fuelType ?? '' }}</td></tr>
        <tr><td class="lbl">Date mise en circulation</td><td class="val">{{ $reservation->vehicle->year }}</td></tr>
        <tr><td class="lbl">Climatisation</td><td class="val">{{ $reservation->vehicle->air_conditioner ? 'Oui' : 'Non' }}</td></tr>
        <tr><td class="lbl">GPS</td><td class="val">{{ $reservation->vehicle->gps ? 'Oui' : 'Non' }}</td></tr>
        <tr><td class="lbl">Nombre de places</td><td class="val">{{ $reservation->vehicle->Occupants ?? '' }}</td></tr>
    </table>

    @php $startDate = \Carbon\Carbon::parse($reservation->start_date); $endDate = \Carbon\Carbon::parse($reservation->end_date); $days = max(1, $startDate->diffInDays($endDate)); $extrasTotalPerDay = $reservation->extras ? $reservation->extras->sum('price_per_day') : 0; @endphp

    <div class="section-header">
        <div class="section-num">4</div>
        <div class="section-title">DUR&Eacute;E DE LOCATION</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Date et heure de d&eacute;part</td><td class="val">{{ $reservation->date_heure_depart ? \Carbon\Carbon::parse($reservation->date_heure_depart)->format('d/m/Y H:i') : $startDate->format('d/m/Y') }}</td></tr>
        <tr><td class="lbl">Date et heure de retour</td><td class="val">{{ $reservation->date_heure_retour ? \Carbon\Carbon::parse($reservation->date_heure_retour)->format('d/m/Y H:i') : $endDate->format('d/m/Y') }}</td></tr>
        <tr><td class="lbl">Type de lieu de d&eacute;part</td><td class="val">{{ $reservation->depart_location_type ?? '' }}</td></tr>
        <tr><td class="lbl">Lieu de d&eacute;part</td><td class="val">{{ $reservation->lieu_depart ?? '' }}{{ $reservation->lieu_depart ? ', ' : '' }}{{ $reservation->departCity?->name ?? '' }}{{ $reservation->departCity?->name && $reservation->departCountry?->name ? ', ' : '' }}{{ $reservation->departCountry?->name ?? 'Marrakech' }}</td></tr>
        <tr><td class="lbl">Type de lieu de retour</td><td class="val">{{ $reservation->return_location_type ?? '' }}</td></tr>
        <tr><td class="lbl">Lieu de retour</td><td class="val">{{ $reservation->lieu_retour ?? '' }}{{ $reservation->lieu_retour ? ', ' : '' }}{{ $reservation->returnCity?->name ?? '' }}{{ $reservation->returnCity?->name && $reservation->returnCountry?->name ? ', ' : '' }}{{ $reservation->returnCountry?->name ?? 'Marrakech' }}</td></tr>
        <tr><td class="lbl">Dur&eacute;e totale</td><td class="val">{{ $days }} jour{{ $days > 1 ? 's' : '' }}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">5</div>
        <div class="section-title">CAUTION</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Montant de la caution</td><td class="val">{{ $reservation->caution_montant ? number_format($reservation->caution_montant, 2) : '______' }} DH</td></tr>
    </table>
    <div class="mode-label">Mode de garantie :</div>
    <div class="checkbox-row">
        <span class="chk">{!! $reservation->caution_mode === 'carte_bancaire' ? '&#9746;' : '&#9744;' !!}</span> Carte bancaire&nbsp;&nbsp;
        <span class="chk">{!! $reservation->caution_mode === 'especes' ? '&#9746;' : '&#9744;' !!}</span> Esp&egrave;ces&nbsp;&nbsp;
        <span class="chk">{!! $reservation->caution_mode === 'passport' ? '&#9746;' : '&#9744;' !!}</span> Passeport&nbsp;&nbsp;
        <span class="chk">{!! $reservation->caution_mode === 'autre' ? '&#9746;' : '&#9744;' !!}</span> Autre
    </div>

    <div class="section-header">
        <div class="section-num">6</div>
        <div class="section-title">&Eacute;TAT DU V&Eacute;HICULE AU D&Eacute;PART</div>
    </div>
    @php $conditions = $reservation->departureConditions ?? null; @endphp
    @if($conditions && $conditions->count() > 0)
        @foreach($conditions->chunk(2) as $chunk)
        <div class="checkbox-row">
            @foreach($chunk as $cond)
                <span class="chk">{!! $cond->pivot->checked ? '&#9746;' : '&#9744;' !!}</span> {{ $cond->name }}&nbsp;&nbsp;
            @endforeach
        </div>
        @endforeach
    @else
        <div class="checkbox-row"><span class="chk">&#9744;</span> V&eacute;hicule propre&nbsp;&nbsp; <span class="chk">&#9744;</span> Pneus en bon &eacute;tat</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> Roue de secours pr&eacute;sente&nbsp;&nbsp; <span class="chk">&#9744;</span> Gilet de s&eacute;curit&eacute; pr&eacute;sent</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> Triangle pr&eacute;sent&nbsp;&nbsp; <span class="chk">&#9744;</span> Documents pr&eacute;sents</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> Post radio&nbsp;&nbsp; <span class="chk">&#9744;</span> Allume cigare</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> Extincteur (poudre)</div>
    @endif
    <div class="obs-label">Observations :</div>
    <div class="obs-box">{{ $reservation->observations ?? '' }}</div>

    <div class="section-header">
        <div class="section-num">7</div>
        <div class="section-title">OBLIGATIONS DU LOCATAIRE</div>
    </div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Respecter le Code de la Route marocain</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Utiliser le v&eacute;hicule en bon p&egrave;re de famille</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Ne pas conduire sous l'effet d'alcool ou de drogues</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Ne pas sous-louer le v&eacute;hicule</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Ne pas utiliser pour des comp&eacute;titions</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Informer imm&eacute;diatement le loueur en cas d'accident</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Restituer le v&eacute;hicule &agrave; la date convenue</div>

    <div class="section-header">
        <div class="section-num">8</div>
        <div class="section-title">ASSURANCE</div>
    </div>
    @php
        $protectionLevel = $reservation->protection_level ?? 'basic';
        $pp = $reservation->vehicle->protection_percentage ?? 0;
        $goldPerDay = round(($reservation->vehicle->pricePerDay ?? 0) * $pp / 100);
        $platinumPerDay = round($goldPerDay * 2);
        $checkBasic = $protectionLevel === 'basic' ? '&#9745;' : '&#9744;';
        $checkGold = $protectionLevel === 'gold' ? '&#9745;' : '&#9744;';
        $checkPlatinum = $protectionLevel === 'platinum' ? '&#9745;' : '&#9744;';
        $franchise = match($protectionLevel) {
            'platinum' => '0',
            'gold' => round(($reservation->vehicle->pricePerDay ?? 0) * 0.35),
            default => ($reservation->vehicle->pricePerDay ?? 0) * 2,
        };
    @endphp
    <div class="mode-label">Formule choisie :</div>
    <div class="checkbox-row"><span class="chk">{!! $checkBasic !!}</span> Protection Basic&nbsp;&nbsp; <span class="chk">{!! $checkGold !!}</span> Protection Gold ({{ number_format($goldPerDay, 0) }} DH/jour)&nbsp;&nbsp; <span class="chk">{!! $checkPlatinum !!}</span> Protection Platinum ({{ number_format($platinumPerDay, 0) }} DH/jour)</div>
    <table class="info">
        <tr><td class="lbl">Formule s&eacute;lectionn&eacute;e</td><td class="val">{{ ucfirst($protectionLevel) }}</td></tr>
        <tr><td class="lbl">Co&ucirc;t par jour</td><td class="val">{{ $protectionLevel === 'basic' ? 'Inclus' : number_format($protectionLevel === 'gold' ? $goldPerDay : $platinumPerDay, 0) . ' DH' }}</td></tr>
        <tr><td class="lbl">Franchise applicable</td><td class="val">{{ number_format($franchise, 0) }} DH</td></tr>
        <tr><td class="lbl">D&eacute;p&ocirc;t de garantie</td><td class="val">{{ $protectionLevel === 'platinum' ? '0' : ($protectionLevel === 'gold' ? '5 000' : '15 000') }} DH</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">9</div>
        <div class="section-title">OPTIONS SUPPL&Eacute;MENTAIRES</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl">Options choisies</td>
            <td class="val">
                @if($reservation->extras && $reservation->extras->count() > 0)
                    @foreach($reservation->extras as $extra)
                        {{ $extra->name }} : {{ number_format($extra->price_per_day, 2) }} DH/jour<br>
                    @endforeach
                @else
                    Aucune option suppl&eacute;mentaire
                @endif
            </td>
        </tr>
        <tr>
            <td class="lbl">Total options</td>
            <td class="val">{{ number_format($extrasTotalPerDay * $days, 2) }} DH</td>
        </tr>
    </table>

    @php
        $pricePerDay = $reservation->vehicle->pricePerDay ?? 0;
        $baseRentalCost = $pricePerDay * $days;
        $extrasTotalCost = $extrasTotalPerDay * $days;
        $protectionCost = 0;
        if ($protectionLevel === 'gold') {
            $protectionCost = $goldPerDay * $days;
        } elseif ($protectionLevel === 'platinum') {
            $protectionCost = $platinumPerDay * $days;
        }
        $grandTotal = $reservation->TotalPrice ?? ($baseRentalCost + $extrasTotalCost + $protectionCost);
    @endphp

    <div class="section-header">
        <div class="section-num">10</div>
        <div class="section-title">R&Eacute;CAPITULATIF FINANCIER</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Statut de la r&eacute;servation</td><td class="val">{{ $reservation->status ?? 'En attente' }}</td></tr>
        <tr><td class="lbl">Prix par jour</td><td class="val">{{ number_format($pricePerDay, 2) }} DH</td></tr>
        <tr><td class="lbl">Nombre de jours</td><td class="val">{{ $days }} jour{{ $days > 1 ? 's' : '' }}</td></tr>
        <tr><td class="lbl">Co&ucirc;t total de location</td><td class="val">{{ number_format($baseRentalCost, 2) }} DH</td></tr>
        <tr><td class="lbl">Co&ucirc;t des options suppl&eacute;mentaires</td><td class="val">{{ number_format($extrasTotalCost, 2) }} DH</td></tr>
        @if($protectionCost > 0)
        <tr><td class="lbl">Co&ucirc;t protection {{ ucfirst($protectionLevel) }}</td><td class="val">{{ number_format($protectionCost, 2) }} DH ({{ $days }} jours × {{ number_format($protectionLevel === 'gold' ? $goldPerDay : $platinumPerDay, 0) }} DH)</td></tr>
        @endif
        @if($reservation->caution_montant)
        <tr><td class="lbl">Caution</td><td class="val">{{ number_format($reservation->caution_montant, 2) }} DH</td></tr>
        @endif
        <tr class="total-row"><td class="lbl">TOTAL G&Eacute;N&Eacute;RAL</td><td class="val">{{ number_format($grandTotal, 2) }} DH</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">11</div>
        <div class="section-title">EN CAS D'ACCIDENT OU PANNE</div>
    </div>
    <div class="bilingual-row"><span class="bullet">1.</span> Informer imm&eacute;diatement CARFORFAR</div>
    <div class="bilingual-row"><span class="bullet">2.</span> Pr&eacute;venir les autorit&eacute;s comp&eacute;tentes</div>
    <div class="bilingual-row"><span class="bullet">3.</span> &Eacute;tablir un constat amiable</div>
    <div class="bilingual-row"><span class="bullet">4.</span> Transmettre tous les documents sous 24h</div>

    <div class="section-header">
        <div class="section-num">12</div>
        <div class="section-title">RESTITUTION DU V&Eacute;HICULE</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Date de retour</td><td class="val">{{ $endDate->format('d/m/Y') }}</td></tr>
        <tr><td class="lbl">Heure de retour</td><td class="val">______ h ______</td></tr>
        <tr><td class="lbl">Kilom&eacute;trage retour</td><td class="val"><span class="fill"></span> km</td></tr>
        <tr><td class="lbl">Niveau carburant retour</td><td class="val"><span class="fill"></span></td></tr>
    </table>
    <div class="obs-label">Observations :</div>
    <div class="obs-box"></div>

    <div class="section-header">
        <div class="section-num">13</div>
        <div class="section-title">DROIT APPLICABLE</div>
    </div>
    <div class="bilingual-row">Le pr&eacute;sent contrat est r&eacute;gi par le droit marocain.</div>
    <div class="bilingual-row">Tout litige rel&egrave;ve des tribunaux de Marrakech.</div>

    @php $hasExtra = $reservation->driver2_nom_prenom || $reservation->driver2_name ? true : false; $hasClient = $reservation->client && $reservation->client->nom_prenom !== $reservation->user->name; @endphp
    <div class="section-header">
        <div class="section-num">&#9998;</div>
        <div class="section-title">SIGNATURES</div>
    </div>
    <div class="signatures" style="margin-top:6px;">
        <div class="sig-box" style="width:{{ ($hasExtra || $hasClient) ? '31%' : '48%' }};">
            <div class="sig-title">Le Loueur (CARFORFAR)</div>
            <div class="sig-name">Nom : CARFORFAR</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        <div class="sig-gap" style="width:{{ ($hasExtra || $hasClient) ? '2%' : '4%' }};"></div>
        <div class="sig-box" style="width:{{ ($hasExtra || $hasClient) ? '31%' : '48%' }};">
            <div class="sig-title">Le Locataire</div>
            <div class="sig-name">Nom : {{ $reservation->user->name }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        @if($hasExtra)
        <div class="sig-gap" style="width:2%;"></div>
        <div class="sig-box" style="width:31%;">
            <div class="sig-title">Conducteur Suppl&eacute;mentaire</div>
            <div class="sig-name">Nom : {{ $reservation->driver2_nom_prenom ?? $reservation->driver2_name }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        @endif
        @if($hasClient)
        <div class="sig-gap" style="width:2%;"></div>
        <div class="sig-box" style="width:31%;">
            <div class="sig-title">Le Client</div>
            <div class="sig-name">Nom : {{ $reservation->client->nom_prenom }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        @endif
    </div>

    <div class="footer">
        &copy; {{ date('Y') }} CARFORFAR &mdash; Location de voitures &agrave; Marrakech &nbsp;|&nbsp;
        Contrat g&eacute;n&eacute;r&eacute; le {{ \Carbon\Carbon::now()->format('d/m/Y \à H:i') }} &nbsp;|&nbsp;
        contact@carforfar.com
    </div>

    <div class="footer-logo">
        <img src="{{ $logoBase64 }}" alt="CARFORFAR">
    </div>

</div>
</body>
</html>
