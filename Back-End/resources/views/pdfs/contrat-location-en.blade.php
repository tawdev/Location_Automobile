<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <title>Vehicle Rental Contract - CARFORFAR</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 9.5px;
            line-height: 1.45;
            color: #1a2a4a;
            background: #fff;
        }
        :root { --dark: #395886; --mid: #638ECB; --light: #D5DEEF; --bg: #F0F3FA; --amber: #f39c12; --text: #1a2a4a; --muted: #64748b; --white: #ffffff; }
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
            <img src="{{ $logoBase64 }}" alt="CARFORFAR"/>        </div>
        <div class="header-title-cell">
            <div class="header-title">VEHICLE RENTAL CONTRACT</div>
            <div class="header-company">CARFORFAR</div>
            <div class="header-meta">
                Contract N&deg; : <strong>{{ str_pad($reservation->id, 6, '0', STR_PAD_LEFT) }}</strong>
                <span>|</span> Date : <strong>{{ \Carbon\Carbon::now()->format('d/m/Y') }}</strong>
                <span>|</span> Place : <strong>Marrakech</strong>
            </div>
        </div>
        <div class="header-logo-cell">
            <img src="{{ $logoBase64 }}" alt="CARFORFAR"/>        </div>
    </div>

    @php $u = $reservation->user; @endphp
    <div class="section-header">
        <div class="section-num">1</div>
        <div class="section-title">IDENTIFICATION OF THE TENANT</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Full name</td><td class="val">{{ $u->name }}</td></tr>
        <tr><td class="lbl">Date of birth</td><td class="val">{{ $u->date_of_birth ? \Carbon\Carbon::parse($u->date_of_birth)->format('d/m/Y') : '' }}</td></tr>
        <tr><td class="lbl">ID / Passport N&deg;</td><td class="val">{{ $u->cin_passport ?? '' }}</td></tr>
        <tr><td class="lbl">Address</td><td class="val">{{ $u->address ?? '' }}</td></tr>
        <tr><td class="lbl">Phone</td><td class="val">{{ $u->phone ?? '' }}</td></tr>
        <tr><td class="lbl">Email</td><td class="val">{{ $u->email }}</td></tr>
        <tr><td class="lbl">Driving license N&deg;</td><td class="val">{{ $u->driver_license_number ?? '' }}</td></tr>
        <tr><td class="lbl">Issue date</td><td class="val">{{ $u->license_issue_date ? \Carbon\Carbon::parse($u->license_issue_date)->format('d/m/Y') : '' }}</td></tr>
        <tr><td class="lbl">Expiry date</td><td class="val">{{ $u->license_expiry_date ? \Carbon\Carbon::parse($u->license_expiry_date)->format('d/m/Y') : '' }}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">2</div>
        <div class="section-title">ADDITIONAL DRIVER (OPTIONAL)</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Full name</td><td class="val">{{ $reservation->driver2_name ?? '' }}</td></tr>
        <tr><td class="lbl">ID N&deg;</td><td class="val">{{ $reservation->driver2_cin ?? '' }}</td></tr>
        <tr><td class="lbl">License N&deg;</td><td class="val">{{ $reservation->driver2_license ?? '' }}</td></tr>
        <tr><td class="lbl">Phone</td><td class="val">{{ $reservation->driver2_phone ?? '' }}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">3</div>
        <div class="section-title">VEHICLE INFORMATION</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Make</td><td class="val">{{ $reservation->vehicle->marque }}</td></tr>
        <tr><td class="lbl">Model</td><td class="val">{{ $reservation->vehicle->model }}</td></tr>
        <tr><td class="lbl">Registration</td><td class="val">{{ $reservation->vehicle->registration }}</td></tr>
        <tr><td class="lbl">Starting mileage</td><td class="val">{{ $reservation->vehicle->km }} km</td></tr>
        <tr><td class="lbl">Fuel level at start</td><td class="val">{{ $reservation->vehicle->fuelType ?? '' }}<span class="fill"></span></td></tr>
        <tr><td class="lbl">First registration date</td><td class="val"><span class="fill"></span></td></tr>
    </table>

    @php $startDate = \Carbon\Carbon::parse($reservation->start_date); $endDate = \Carbon\Carbon::parse($reservation->end_date); $days = max(1, $startDate->diffInDays($endDate)); $extrasTotalPerDay = $reservation->extras ? $reservation->extras->sum('price_per_day') : 0; @endphp

    <div class="section-header">
        <div class="section-num">4</div>
        <div class="section-title">RENTAL PERIOD</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Start date</td><td class="val">{{ $startDate->format('d/m/Y') }}</td></tr>
        <tr><td class="lbl">Start time</td><td class="val">{{ $reservation->start_time ? \Carbon\Carbon::parse($reservation->start_time)->format('H:i') : '______' }}</td></tr>
        <tr><td class="lbl">Return date</td><td class="val">{{ $endDate->format('d/m/Y') }}</td></tr>
        <tr><td class="lbl">Return time</td><td class="val">{{ $reservation->end_time ? \Carbon\Carbon::parse($reservation->end_time)->format('H:i') : '______' }}</td></tr>
        <tr><td class="lbl">Pick-up location</td><td class="val">{{ $reservation->departure_location ?? 'Marrakech' }}</td></tr>
        <tr><td class="lbl">Return location</td><td class="val">{{ $reservation->return_location ?? 'Marrakech' }}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">5</div>
        <div class="section-title">DEPOSIT</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Deposit amount</td><td class="val">{{ $reservation->caution_amount ? number_format($reservation->caution_amount, 2) : '______' }} DH</td></tr>
    </table>
    <div class="mode-label">Guarantee method :</div>
    @php $cm = $reservation->caution_mode; @endphp
    <div class="checkbox-row">
        <span class="chk">{{ $cm === 'carte_bancaire' ? '&#9746;' : '&#9744;' }}</span> Bank card&nbsp;&nbsp;
        <span class="chk">{{ $cm === 'especes' ? '&#9746;' : '&#9744;' }}</span> Cash&nbsp;&nbsp;
        <span class="chk">{{ $cm === 'passport' ? '&#9746;' : '&#9744;' }}</span> Passport&nbsp;&nbsp;
        <span class="chk">{{ $cm === 'autre' ? '&#9746;' : '&#9744;' }}</span> Other
    </div>

    <div class="section-header">
        <div class="section-num">6</div>
        <div class="section-title">VEHICLE CONDITION AT DEPARTURE</div>
    </div>
    @if(false)
        @foreach($reservation->departureConditions as $cond)
            <div class="checkbox-row"><span class="chk">&#9746;</span> {{ $cond->name }}</div>
        @endforeach
    @else
        <div class="checkbox-row"><span class="chk">&#9744;</span> Clean vehicle&nbsp;&nbsp; <span class="chk">&#9744;</span> Tires in good condition</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> Spare wheel present&nbsp;&nbsp; <span class="chk">&#9744;</span> Safety vest present</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> Warning triangle present&nbsp;&nbsp; <span class="chk">&#9744;</span> Documents present</div>
    @endif
    <div class="obs-label">Observations :</div>
    <div class="obs-box">{{ $reservation->observations ?? '' }}</div>

    <div class="section-header">
        <div class="section-num">7</div>
        <div class="section-title">TENANT'S OBLIGATIONS</div>
    </div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Comply with the Moroccan Highway Code</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Use the vehicle responsibly</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Do not drive under the influence of alcohol or drugs</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Do not sub-rent the vehicle</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Do not use for competitions</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Immediately inform the lessor in case of accident</div>
    <div class="bilingual-row"><span class="bullet">&bull;</span> Return the vehicle on the agreed date</div>

    <div class="section-header">
        <div class="section-num">8</div>
        <div class="section-title">INSURANCE</div>
    </div>
    <div class="mode-label">Selected plan :</div>
    <div class="checkbox-row"><span class="chk">&#9744;</span> Basic Protection&nbsp;&nbsp; <span class="chk">&#9744;</span> Gold Protection&nbsp;&nbsp; <span class="chk">&#9744;</span> Platinum Protection</div>
    <table class="info">
        <tr><td class="lbl">Applicable deductible</td><td class="val"><span class="fill"></span> DH</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">9</div>
        <div class="section-title">EXTRA OPTIONS</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl">Selected options</td>
            <td class="val">
                @if($reservation->extras && $reservation->extras->count() > 0)
                    @foreach($reservation->extras as $extra)
                        {{ $extra->name }} : {{ number_format($extra->price_per_day, 2) }} DH/day<br>
                    @endforeach
                @else
                    No extra options selected
                @endif
            </td>
        </tr>
        <tr>
            <td class="lbl">Total extras</td>
            <td class="val">{{ number_format($extrasTotalPerDay * $days, 2) }} DH</td>
        </tr>
    </table>

    <div class="section-header">
        <div class="section-num">10</div>
        <div class="section-title">IN CASE OF ACCIDENT OR BREAKDOWN</div>
    </div>
    <div class="bilingual-row"><span class="bullet">1.</span> Immediately inform CARFORFAR</div>
    <div class="bilingual-row"><span class="bullet">2.</span> Notify the competent authorities</div>
    <div class="bilingual-row"><span class="bullet">3.</span> Fill out an accident report</div>
    <div class="bilingual-row"><span class="bullet">4.</span> Submit all documents within 24 hours</div>

    <div class="section-header">
        <div class="section-num">11</div>
        <div class="section-title">RETURN OF THE VEHICLE</div>
    </div>
    <table class="info">
        <tr><td class="lbl">Return date</td><td class="val">{{ $endDate->format('d/m/Y') }}</td></tr>
        <tr><td class="lbl">Return time</td><td class="val">______ h ______</td></tr>
        <tr><td class="lbl">Return mileage</td><td class="val"><span class="fill"></span> km</td></tr>
        <tr><td class="lbl">Fuel level at return</td><td class="val"><span class="fill"></span></td></tr>
    </table>
    <div class="obs-label">Observations :</div>
    <div class="obs-box"></div>

    <div class="section-header">
        <div class="section-num">12</div>
        <div class="section-title">APPLICABLE LAW</div>
    </div>
    <div class="bilingual-row">This contract is governed by Moroccan law.</div>
    <div class="bilingual-row">Any dispute falls under the jurisdiction of the courts of Marrakech.</div>

    @php $hasExtra = $reservation->driver2_name ? true : false; @endphp
    <div class="section-header">
        <div class="section-num">&#9998;</div>
        <div class="section-title">SIGNATURES</div>
    </div>
    <div class="signatures" style="margin-top:6px;">
        <div class="sig-box" style="width:{{ $hasExtra ? '31%' : '48%' }};">
            <div class="sig-title">The Lessor (CARFORFAR)</div>
            <div class="sig-name">Name : CARFORFAR</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        <div class="sig-gap" style="width:{{ $hasExtra ? '2%' : '4%' }};"></div>
        <div class="sig-box" style="width:{{ $hasExtra ? '31%' : '48%' }};">
            <div class="sig-title">The Tenant</div>
            <div class="sig-name">Name : {{ $reservation->user->name }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        @if($hasExtra)
        <div class="sig-gap" style="width:2%;"></div>
        <div class="sig-box" style="width:31%;">
            <div class="sig-title">Additional Driver</div>
            <div class="sig-name">Name : {{ $reservation->driver2_name }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        @endif
    </div>

    <div class="footer">
        &copy; {{ date('Y') }} CARFORFAR &mdash; Car rental in Marrakech &nbsp;|&nbsp;
        Contract generated on {{ \Carbon\Carbon::now()->format('d/m/Y \à H:i') }} &nbsp;|&nbsp;
        contact@carforfar.com
    </div>

    <div class="footer-logo">
        <img src="{{ $logoBase64 }}" alt="CARFORFAR">
    </div>

</div>
</body>
</html>
