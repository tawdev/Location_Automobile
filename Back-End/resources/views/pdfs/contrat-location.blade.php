<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
    <meta charset="utf-8">
    <title>Contrat de Location - CARFORFAR</title>
    <style>
        /* ── Reset & Base ── */
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Noto Sans Arabic', 'DejaVu Sans', Arial, sans-serif;
            font-size: 9.5px;
            line-height: 1.45;
            color: #1a2a4a;
            background: #fff;
        }

        /* ── Brand Colors ── */
        :root {
            --dark:  #395886;
            --mid:   #638ECB;
            --light: #D5DEEF;
            --bg:    #F0F3FA;
            --amber: #ff8d21;
            --text:  #1a2a4a;
            --muted: #64748b;
            --white: #ffffff;
        }

        /* ══════════════════════════════
           WATERMARK BACKGROUND
        ══════════════════════════════ */
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

        /* ══════════════════════════════
           PAGE FRAME
        ══════════════════════════════ */
        .page-frame {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 0;
        }
        /* Top dark bar */
        .page-frame .top-bar {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 7px;
            background: var(--dark);
        }
        /* Bottom dark bar */
        .page-frame .bottom-bar {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 5px;
            background: var(--dark);
        }
        /* Left amber stripe */
        .page-frame .left-stripe {
            position: absolute;
            top: 7px; left: 0; bottom: 5px;
            width: 3px;
            background: var(--amber);
        }
        /* Right mid-blue stripe */
        .page-frame .right-stripe {
            position: absolute;
            top: 7px; right: 0; bottom: 5px;
            width: 3px;
            background: var(--mid);
        }

        /* ══════════════════════════════
           MAIN CONTENT WRAPPER
        ══════════════════════════════ */
        .content {
            position: relative;
            z-index: 1;
            margin: 10px 14px 10px 14px;
        }

        /* ══════════════════════════════
           HEADER
        ══════════════════════════════ */
        .header {
            display: table;
            width: 100%;
            border: 1.5px solid var(--dark);
            border-top: 3.5px solid var(--amber);
            border-radius: 5px;
            background: var(--white);
            margin-bottom: 8px;
            overflow: hidden;
        }
        .header-logo-cell {
            display: table-cell;
            width: 60px;
            vertical-align: middle;
            text-align: center;
            padding: 8px;
            border-right: 1px solid var(--light);
        }
        .header-logo-cell img {
            width: 52px;
            height: 52px;
            object-fit: contain;
        }
        .header-title-cell {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 8px 12px;
        }
        .header-title-fr {
            font-size: 14px;
            font-weight: bold;
            color: var(--dark);
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .header-title-ar {
            font-size: 12px;
            font-weight: bold;
            color: var(--amber);
            direction: rtl;
            margin-bottom: 4px;
        }
        .header-company {
            font-size: 11px;
            font-weight: bold;
            color: var(--dark);
            margin-bottom: 4px;
        }
        .header-meta {
            font-size: 8px;
            color: var(--muted);
        }
        .header-meta span {
            margin: 0 4px;
            color: var(--light);
        }

        /* ══════════════════════════════
           SECTION HEADER
        ══════════════════════════════ */
        .section-header {
            display: table;
            width: 100%;
            background: var(--dark);
            border-radius: 4px;
            margin: 8px 0 4px 0;
            overflow: hidden;
        }
        .section-num {
            display: table-cell;
            width: 22px;
            text-align: center;
            vertical-align: middle;
            font-size: 9px;
            font-weight: bold;
            color: var(--amber);
            padding: 4px 4px 4px 8px;
        }
        .section-title-fr {
            display: table-cell;
            vertical-align: middle;
            font-size: 9.5px;
            font-weight: bold;
            color: var(--white);
            padding: 4px 8px;
        }
        .section-title-ar {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            font-size: 10px;
            font-weight: bold;
            color: var(--amber);
            padding: 4px 10px 4px 8px;
            direction: rtl;
        }

        /* ══════════════════════════════
           INFO TABLE (bilingual rows)
        ══════════════════════════════ */
        table.info {
            width: 100%;
            border-collapse: collapse;
        }
        table.info tr:nth-child(odd) { background: var(--bg); }
        table.info tr:nth-child(even) { background: var(--white); }
        table.info tr {
            border-bottom: 0.4px solid var(--light);
        }
        table.info td {
            padding: 3.5px 8px;
            vertical-align: middle;
        }
        /* French label — left, 30% */
        td.lbl-fr {
            width: 28%;
            font-weight: bold;
            font-size: 8.5px;
            color: var(--dark);
        }
        /* Value — center, 40% */
        td.val {
            width: 42%;
            font-size: 8.5px;
            color: var(--muted);
            text-align: center;
            border-left: 0.5px dashed var(--light);
            border-right: 0.5px dashed var(--light);
        }
        /* Value fill line */
        td.val .fill {
            border-bottom: 0.8px solid #b0bcd4;
            display: inline-block;
            width: 90%;
            height: 12px;
        }
        /* Arabic label — right, 30% */
        td.lbl-ar {
            width: 30%;
            text-align: right;
            direction: rtl;
            font-size: 9px;
            font-weight: bold;
            color: var(--dark);
        }

        /* Total row highlight */
        tr.total-row td { background: var(--dark) !important; color: var(--white) !important; }
        tr.total-row td.lbl-ar { color: var(--amber) !important; }

        /* ══════════════════════════════
           CHECKBOX ROW
        ══════════════════════════════ */
        .checkbox-row {
            display: table;
            width: 100%;
            padding: 3px 0;
            border-bottom: 0.4px solid var(--light);
        }
        .checkbox-fr {
            display: table-cell;
            width: 50%;
            padding: 3px 8px;
            font-size: 8.5px;
            vertical-align: middle;
        }
        .checkbox-ar {
            display: table-cell;
            width: 50%;
            text-align: right;
            direction: rtl;
            padding: 3px 8px;
            font-size: 9px;
            vertical-align: middle;
        }
        .chk { margin-right: 5px; font-size: 10px; }
        .chk-ar { margin-left: 5px; font-size: 10px; }

        /* ══════════════════════════════
           OBLIGATIONS / STEPS
        ══════════════════════════════ */
        .bilingual-row {
            display: table;
            width: 100%;
            border-bottom: 0.4px solid var(--light);
        }
        .bilingual-row:nth-child(odd) { background: var(--bg); }
        .bilingual-row:nth-child(even) { background: var(--white); }
        .bil-fr {
            display: table-cell;
            width: 50%;
            padding: 3.5px 8px;
            font-size: 8.5px;
            vertical-align: middle;
        }
        .bil-ar {
            display: table-cell;
            width: 50%;
            text-align: right;
            direction: rtl;
            padding: 3.5px 8px;
            font-size: 9px;
            vertical-align: middle;
        }
        .bullet { color: var(--amber); margin-right: 4px; }

        /* ══════════════════════════════
           OBSERVATION BOX
        ══════════════════════════════ */
        .obs-label {
            display: table;
            width: 100%;
            padding: 3px 0;
        }
        .obs-label .fr { display: table-cell; font-weight: bold; font-size: 8.5px; padding: 2px 8px; color: var(--dark); }
        .obs-label .ar { display: table-cell; text-align: right; direction: rtl; font-weight: bold; font-size: 9px; padding: 2px 8px; color: var(--dark); }
        .obs-box {
            border: 0.8px solid var(--light);
            border-left: 3px solid var(--mid);
            background: var(--bg);
            min-height: 22px;
            margin: 2px 0 6px 0;
            border-radius: 3px;
        }

        /* ══════════════════════════════
           SECTION: MODE DE GARANTIE
        ══════════════════════════════ */
        .mode-label {
            display: table;
            width: 100%;
            padding: 3px 8px;
        }
        .mode-label .fr { display: table-cell; font-weight: bold; font-size: 8.5px; color: var(--dark); }
        .mode-label .ar { display: table-cell; text-align: right; direction: rtl; font-weight: bold; font-size: 9px; color: var(--dark); }

        /* ══════════════════════════════
           SIGNATURES
        ══════════════════════════════ */
        .signatures {
            display: table;
            width: 100%;
            margin-top: 5px;
        }
        .sig-box {
            display: table-cell;
            width: 48%;
            border: 1px solid var(--light);
            border-top: 3px solid var(--amber);
            border-radius: 4px;
            background: var(--bg);
            padding: 8px 10px;
            vertical-align: top;
        }
        .sig-gap { display: table-cell; width: 4%; }
        .sig-title {
            display: table;
            width: 100%;
            margin-bottom: 4px;
        }
        .sig-title .fr { display: table-cell; font-weight: bold; font-size: 9px; color: var(--dark); }
        .sig-title .ar { display: table-cell; text-align: right; direction: rtl; font-weight: bold; font-size: 9.5px; color: var(--dark); }
        .sig-name { font-size: 8.5px; color: var(--muted); margin-bottom: 14px; }
        .sig-line {
            border-bottom: 0.8px solid var(--dark);
            margin-bottom: 3px;
        }
        .sig-hint { font-size: 7px; color: var(--muted); margin-bottom: 5px; }
        .sig-date { font-size: 8.5px; color: var(--muted); }

        /* ══════════════════════════════
           FOOTER
        ══════════════════════════════ */
        .footer {
            text-align: center;
            font-size: 7px;
            color: var(--muted);
            margin-top: 8px;
            border-top: 0.5px solid var(--light);
            padding-top: 4px;
        }

        /* ══════════════════════════════
           PAGE BREAK
        ══════════════════════════════ */
        .page-break { page-break-before: always; }

        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>

{{-- ══ WATERMARK ══ --}}
<div class="watermark">
    <img src="{{ $logoBase64 }}" alt="CARFORFAR">
</div>

{{-- ══ PAGE FRAME ══ --}}
<div class="page-frame">
    <div class="top-bar"></div>
    <div class="bottom-bar"></div>
    <div class="left-stripe"></div>
    <div class="right-stripe"></div>
</div>

{{-- ══ MAIN CONTENT ══ --}}
<div class="content">

    {{-- ══ HEADER ══ --}}
    <div class="header">
        <div class="header-logo-cell">
            <img src="{{ $logoBase64 }}" alt="CARFORFAR">
        </div>
        <div class="header-title-cell">
            <div class="header-title-fr">CONTRAT DE LOCATION DE VÉHICULE</div>
            <div class="header-title-ar">عقد تأجير سيارة</div>
            <div class="header-company">CARFORFAR</div>
            <div class="header-meta">
                Contrat N° :
                <strong>{{ str_pad($reservation->id, 6, '0', STR_PAD_LEFT) }}</strong>
                <span>|</span>
                Date : <strong>{{ \Carbon\Carbon::now()->format('d/m/Y') }}</strong>
                <span>|</span>
                Lieu / المكان : <strong>Marrakech / مراكش</strong>
            </div>
        </div>
        <div class="header-logo-cell">
            <img src="{{ $logoBase64 }}" alt="CARFORFAR">
        </div>
    </div>

    {{-- ══════════════════════════════
         SECTION 1 — LOCATAIRE
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">1</div>
        <div class="section-title-fr">IDENTIFICATION DU LOCATAIRE</div>
        <div class="section-title-ar">تعريف المستأجر</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Nom et prénom</td>
            <td class="val">{{ $reservation->user->name }}</td>
            <td class="lbl-ar">الاسم الكامل</td>
        </tr>
        <tr>
            <td class="lbl-fr">Date de naissance</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">تاريخ الازدياد</td>
        </tr>
        <tr>
            <td class="lbl-fr">N° CIN / Passeport</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">رقم البطاقة / جواز السفر</td>
        </tr>
        <tr>
            <td class="lbl-fr">Adresse</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">العنوان</td>
        </tr>
        <tr>
            <td class="lbl-fr">Téléphone</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">الهاتف</td>
        </tr>
        <tr>
            <td class="lbl-fr">Email</td>
            <td class="val">{{ $reservation->user->email }}</td>
            <td class="lbl-ar">البريد الإلكتروني</td>
        </tr>
        <tr>
            <td class="lbl-fr">N° Permis de conduire</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">رقم رخصة السياقة</td>
        </tr>
        <tr>
            <td class="lbl-fr">Date de délivrance</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">تاريخ الإصدار</td>
        </tr>
        <tr>
            <td class="lbl-fr">Date d'expiration</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">تاريخ الانتهاء</td>
        </tr>
    </table>

    {{-- ══════════════════════════════
         SECTION 2 — CONDUCTEUR SUPP.
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">2</div>
        <div class="section-title-fr">CONDUCTEUR SUPPLÉMENTAIRE (OPTIONNEL)</div>
        <div class="section-title-ar">السائق الإضافي (اختياري)</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Nom et prénom</td>
            <td class="val">{{ $reservation->driver2_name ?? '' }}<span class="fill"></span></td>
            <td class="lbl-ar">الاسم الكامل</td>
        </tr>
        <tr>
            <td class="lbl-fr">N° CIN</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">رقم بطاقة التعريف</td>
        </tr>
        <tr>
            <td class="lbl-fr">N° Permis</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">رقم الرخصة</td>
        </tr>
        <tr>
            <td class="lbl-fr">Téléphone</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">الهاتف</td>
        </tr>
    </table>

    {{-- ══════════════════════════════
         SECTION 3 — VÉHICULE
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">3</div>
        <div class="section-title-fr">INFORMATIONS DU VÉHICULE</div>
        <div class="section-title-ar">معلومات السيارة</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Marque</td>
            <td class="val">{{ $reservation->vehicle->marque }}</td>
            <td class="lbl-ar">الماركة</td>
        </tr>
        <tr>
            <td class="lbl-fr">Modèle</td>
            <td class="val">{{ $reservation->vehicle->model }}</td>
            <td class="lbl-ar">الموديل</td>
        </tr>
        <tr>
            <td class="lbl-fr">Immatriculation</td>
            <td class="val">{{ $reservation->vehicle->registration }}</td>
            <td class="lbl-ar">رقم التسجيل</td>
        </tr>
        <tr>
            <td class="lbl-fr">Couleur</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">اللون</td>
        </tr>
        <tr>
            <td class="lbl-fr">Kilométrage départ</td>
            <td class="val">{{ $reservation->vehicle->km }} km</td>
            <td class="lbl-ar">عدد الكيلومترات عند الانطلاق</td>
        </tr>
        <tr>
            <td class="lbl-fr">Niveau carburant départ</td>
            <td class="val">{{ $reservation->vehicle->fuelType ?? '' }}<span class="fill"></span></td>
            <td class="lbl-ar">مستوى الوقود عند الانطلاق</td>
        </tr>
        <tr>
            <td class="lbl-fr">Date mise en circulation</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">تاريخ أول تسجيل</td>
        </tr>
    </table>

    {{-- ══════════════════════════════
         SECTION 4 — DURÉE
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">4</div>
        <div class="section-title-fr">DURÉE DE LOCATION</div>
        <div class="section-title-ar">مدة التأجير</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Date et heure de départ</td>
            <td class="val">{{ \Carbon\Carbon::parse($reservation->start_date)->format('d/m/Y') }}</td>
            <td class="lbl-ar">تاريخ ووقت الانطلاق</td>
        </tr>
        <tr>
            <td class="lbl-fr">Date et heure de retour</td>
            <td class="val">{{ \Carbon\Carbon::parse($reservation->end_date)->format('d/m/Y') }}</td>
            <td class="lbl-ar">تاريخ ووقت الإرجاع</td>
        </tr>
        <tr>
            <td class="lbl-fr">Lieu de départ</td>
            <td class="val">Marrakech / مراكش</td>
            <td class="lbl-ar">مكان الانطلاق</td>
        </tr>
        <tr>
            <td class="lbl-fr">Lieu de retour</td>
            <td class="val">Marrakech / مراكش</td>
            <td class="lbl-ar">مكان الإرجاع</td>
        </tr>
    </table>

    {{-- ══════════════════════════════
         SECTION 5 — TARIFICATION
    ══════════════════════════════ --}}
    @php
        $startDate = \Carbon\Carbon::parse($reservation->start_date);
        $endDate   = \Carbon\Carbon::parse($reservation->end_date);
        $days      = max(1, $startDate->diffInDays($endDate));
        $extrasTotalPerDay = $reservation->extras ? $reservation->extras->sum('price_per_day') : 0;
        $extrasTotal = $extrasTotalPerDay * $days;
    @endphp
    <div class="section-header">
        <div class="section-num">5</div>
        <div class="section-title-fr">TARIFICATION</div>
        <div class="section-title-ar">التسعيرة</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Prix journalier</td>
            <td class="val">{{ number_format($reservation->vehicle->pricePerDay, 2) }} DH</td>
            <td class="lbl-ar">السعر اليومي</td>
        </tr>
        <tr>
            <td class="lbl-fr">Nombre de jours</td>
            <td class="val">{{ $days }}</td>
            <td class="lbl-ar">عدد الأيام</td>
        </tr>
        <tr>
            <td class="lbl-fr">Montant location</td>
            <td class="val">{{ number_format($reservation->vehicle->pricePerDay * $days, 2) }} DH</td>
            <td class="lbl-ar">مبلغ التأجير</td>
        </tr>
        <tr>
            <td class="lbl-fr">Options supplémentaires</td>
            <td class="val">
                @if($reservation->extras && $reservation->extras->count() > 0)
                    @foreach($reservation->extras as $extra)
                        {{ $extra->name }} : {{ number_format($extra->price_per_day * $days, 2) }} DH<br>
                    @endforeach
                @else
                    0.00 DH
                @endif
            </td>
            <td class="lbl-ar">خيارات إضافية</td>
        </tr>
        <tr>
            <td class="lbl-fr">Assurance complémentaire</td>
            <td class="val">0.00 DH</td>
            <td class="lbl-ar">التأمين التكميلي</td>
        </tr>
        <tr class="total-row">
            <td class="lbl-fr">Montant total TTC</td>
            <td class="val">{{ number_format($reservation->TotalPrice, 2) }} DH</td>
            <td class="lbl-ar">المبلغ الإجمالي شامل الضريبة</td>
        </tr>
    </table>

    {{-- ══════════════════════════════
         SECTION 6 — CAUTION
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">6</div>
        <div class="section-title-fr">CAUTION</div>
        <div class="section-title-ar">وديعة الضمان</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Montant de la caution</td>
            <td class="val"><span class="fill"></span> DH</td>
            <td class="lbl-ar">مبلغ الوديعة</td>
        </tr>
    </table>
    <div class="mode-label">
        <div class="fr">Mode de garantie :</div>
        <div class="ar">طريقة الضمان :</div>
    </div>
    <div class="checkbox-row">
        <div class="checkbox-fr">
            <span class="chk">&#9744;</span> Carte bancaire &nbsp;&nbsp;
            <span class="chk">&#9744;</span> Espèces &nbsp;&nbsp;
            <span class="chk">&#9744;</span> Chèque &nbsp;&nbsp;
            <span class="chk">&#9744;</span> Autre
        </div>
        <div class="checkbox-ar">
            بطاقة بنكية <span class="chk-ar">&#9744;</span> &nbsp;&nbsp;
            نقداً <span class="chk-ar">&#9744;</span> &nbsp;&nbsp;
            شيك <span class="chk-ar">&#9744;</span> &nbsp;&nbsp;
            أخرى <span class="chk-ar">&#9744;</span>
        </div>
    </div>

    {{-- ══════════════════════════════
         SECTION 7 — ÉTAT DÉPART
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">7</div>
        <div class="section-title-fr">ÉTAT DU VÉHICULE AU DÉPART</div>
        <div class="section-title-ar">حالة السيارة عند الانطلاق</div>
    </div>
    @php $conditions = $reservation->departureConditions ?? null; @endphp
    @if($conditions && $conditions->count() > 0)
        @foreach($conditions->chunk(2) as $chunk)
        <div class="checkbox-row">
            <div class="checkbox-fr">
            @foreach($chunk as $cond)
                <span class="chk">{!! $cond->pivot->checked ? '&#9746;' : '&#9744;' !!}</span> {{ $cond->name }}&nbsp;&nbsp;
            @endforeach
            </div>
            <div class="checkbox-ar">
            @foreach($chunk as $cond)
                {{ $cond->name }} <span class="chk-ar">{!! $cond->pivot->checked ? '&#9746;' : '&#9744;' !!}</span>&nbsp;&nbsp;
            @endforeach
            </div>
        </div>
        @endforeach
    @else
    <div class="checkbox-row">
        <div class="checkbox-fr"><span class="chk">&#9744;</span> Véhicule propre &nbsp;&nbsp; <span class="chk">&#9744;</span> Pneus en bon état</div>
        <div class="checkbox-ar">السيارة نظيفة <span class="chk-ar">&#9744;</span> &nbsp;&nbsp; الإطارات سليمة <span class="chk-ar">&#9744;</span></div>
    </div>
    <div class="checkbox-row">
        <div class="checkbox-fr"><span class="chk">&#9744;</span> Roue de secours présente &nbsp;&nbsp; <span class="chk">&#9744;</span> Gilet de sécurité présent</div>
        <div class="checkbox-ar">العجلة الاحتياطية موجودة <span class="chk-ar">&#9744;</span> &nbsp;&nbsp; سترة الأمان موجودة <span class="chk-ar">&#9744;</span></div>
    </div>
    <div class="checkbox-row">
        <div class="checkbox-fr"><span class="chk">&#9744;</span> Triangle présent &nbsp;&nbsp; <span class="chk">&#9744;</span> Documents présents</div>
        <div class="checkbox-ar">مثلث التحذير موجود <span class="chk-ar">&#9744;</span> &nbsp;&nbsp; الوثائق موجودة <span class="chk-ar">&#9744;</span></div>
    </div>
    <div class="checkbox-row">
        <div class="checkbox-fr"><span class="chk">&#9744;</span> Post radio &nbsp;&nbsp; <span class="chk">&#9744;</span> Allume cigare</div>
        <div class="checkbox-ar">الراديو <span class="chk-ar">&#9744;</span> &nbsp;&nbsp; ولاعة السجائر <span class="chk-ar">&#9744;</span></div>
    </div>
    <div class="checkbox-row">
        <div class="checkbox-fr"><span class="chk">&#9744;</span> Extincteur (poudre)</div>
        <div class="checkbox-ar">طفاية الحريق (مسحوق) <span class="chk-ar">&#9744;</span></div>
    </div>
    @endif
    <div class="obs-label">
        <div class="fr">Observations :</div>
        <div class="ar">ملاحظات :</div>
    </div>
    <div class="obs-box"></div>

    {{-- ══════════════════════════════
         SECTION 8 — OBLIGATIONS
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">8</div>
        <div class="section-title-fr">OBLIGATIONS DU LOCATAIRE</div>
        <div class="section-title-ar">التزامات المستأجر</div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">•</span> Respecter le Code de la Route marocain</div>
        <div class="bil-ar">احترام قانون المرور المغربي <span class="bullet">•</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">•</span> Utiliser le véhicule en bon père de famille</div>
        <div class="bil-ar">استخدام السيارة باعتدال وحذر <span class="bullet">•</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">•</span> Ne pas conduire sous l'effet d'alcool ou de drogues</div>
        <div class="bil-ar">عدم القيادة تحت تأثير الكحول أو المخدرات <span class="bullet">•</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">•</span> Ne pas sous-louer le véhicule</div>
        <div class="bil-ar">عدم إعادة تأجير السيارة <span class="bullet">•</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">•</span> Ne pas utiliser pour des compétitions</div>
        <div class="bil-ar">عدم استخدامها في المسابقات <span class="bullet">•</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">•</span> Informer immédiatement le loueur en cas d'accident</div>
        <div class="bil-ar">إبلاغ المؤجر فوراً في حالة الحادث <span class="bullet">•</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">•</span> Restituer le véhicule à la date convenue</div>
        <div class="bil-ar">إرجاع السيارة في التاريخ المتفق عليه <span class="bullet">•</span></div>
    </div>

    {{-- ══════════════════════════════
         SECTION 9 — ASSURANCE
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">9</div>
        <div class="section-title-fr">ASSURANCE</div>
        <div class="section-title-ar">التأمين</div>
    </div>
    <div class="mode-label">
        <div class="fr">Formule choisie :</div>
        <div class="ar">الخطة المختارة :</div>
    </div>
    <div class="checkbox-row">
        <div class="checkbox-fr">
            <span class="chk">&#9744;</span> Protection Basic &nbsp;&nbsp;
            <span class="chk">&#9744;</span> Protection Gold &nbsp;&nbsp;
            <span class="chk">&#9744;</span> Protection Platinum
        </div>
        <div class="checkbox-ar">
            الحماية الأساسية <span class="chk-ar">&#9744;</span> &nbsp;&nbsp;
            الحماية الذهبية <span class="chk-ar">&#9744;</span> &nbsp;&nbsp;
            الحماية البلاتينية <span class="chk-ar">&#9744;</span>
        </div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Franchise applicable</td>
            <td class="val"><span class="fill"></span> DH</td>
            <td class="lbl-ar">الخصم المطبق</td>
        </tr>
    </table>

    {{-- ══════════════════════════════
         SECTION 10 — ACCIDENT
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">10</div>
        <div class="section-title-fr">EN CAS D'ACCIDENT OU PANNE</div>
        <div class="section-title-ar">في حالة الحادث أو العطل</div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">1.</span> Informer immédiatement CARFORFAR</div>
        <div class="bil-ar">الإبلاغ الفوري عن CARFORFAR <span class="bullet">١.</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">2.</span> Prévenir les autorités compétentes</div>
        <div class="bil-ar">إبلاغ السلطات المختصة <span class="bullet">٢.</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">3.</span> Établir un constat amiable</div>
        <div class="bil-ar">تحرير محضر ودي للحادث <span class="bullet">٣.</span></div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr"><span class="bullet">4.</span> Transmettre tous les documents sous 24h</div>
        <div class="bil-ar">إرسال جميع الوثائق في غضون 24 ساعة <span class="bullet">٤.</span></div>
    </div>

    {{-- ══════════════════════════════
         SECTION 11 — RESTITUTION
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">11</div>
        <div class="section-title-fr">RESTITUTION DU VÉHICULE</div>
        <div class="section-title-ar">إرجاع السيارة</div>
    </div>
    <table class="info">
        <tr>
            <td class="lbl-fr">Date de retour</td>
            <td class="val">{{ \Carbon\Carbon::parse($reservation->end_date)->format('d/m/Y') }}</td>
            <td class="lbl-ar">تاريخ الإرجاع</td>
        </tr>
        <tr>
            <td class="lbl-fr">Heure de retour</td>
            <td class="val">______ h ______</td>
            <td class="lbl-ar">وقت الإرجاع</td>
        </tr>
        <tr>
            <td class="lbl-fr">Kilométrage retour</td>
            <td class="val"><span class="fill"></span> km</td>
            <td class="lbl-ar">عدد الكيلومترات عند الإرجاع</td>
        </tr>
        <tr>
            <td class="lbl-fr">Niveau carburant retour</td>
            <td class="val"><span class="fill"></span></td>
            <td class="lbl-ar">مستوى الوقود عند الإرجاع</td>
        </tr>
    </table>
    <div class="obs-label">
        <div class="fr">Observations :</div>
        <div class="ar">ملاحظات :</div>
    </div>
    <div class="obs-box"></div>

    {{-- ══════════════════════════════
         SECTION 12 — DROIT APPLICABLE
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">12</div>
        <div class="section-title-fr">DROIT APPLICABLE</div>
        <div class="section-title-ar">القانون المنطبق</div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr">Le présent contrat est régi par le droit marocain.</div>
        <div class="bil-ar">يخضع هذا العقد للقانون المغربي.</div>
    </div>
    <div class="bilingual-row">
        <div class="bil-fr">Tout litige relève des tribunaux de Marrakech.</div>
        <div class="bil-ar">يختص القضاء بمحاكم مراكش في أي نزاع.</div>
    </div>

    {{-- ══════════════════════════════
         SIGNATURES
    ══════════════════════════════ --}}
    <div class="section-header">
        <div class="section-num">&#9998;</div>
        <div class="section-title-fr">SIGNATURES</div>
        <div class="section-title-ar">التوقيعات</div>
    </div>
    <div class="signatures" style="margin-top:6px;">
        <div class="sig-box">
            <div class="sig-title">
                <div class="fr">Le Loueur (CARFORFAR)</div>
                <div class="ar">المؤجر (CARFORFAR)</div>
            </div>
            <div class="sig-name">Nom / الاسم : CARFORFAR</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature / التوقيع</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
        <div class="sig-gap"></div>
        <div class="sig-box">
            <div class="sig-title">
                <div class="fr">Le Locataire</div>
                <div class="ar">المستأجر</div>
            </div>
            <div class="sig-name">Nom / الاسم : {{ $reservation->user->name }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">Signature / التوقيع</div>
            <div class="sig-date">Date : ____ / ____ / ______</div>
        </div>
    </div>

    {{-- ══ FOOTER ══ --}}
    <div class="footer">
        &copy; {{ date('Y') }} CARFORFAR &mdash; Location de voitures à Marrakech &nbsp;|&nbsp;
        Contrat généré le {{ \Carbon\Carbon::now()->format('d/m/Y \à H:i') }} &nbsp;|&nbsp;
        contact@carforfar.com
    </div>

    {{-- ══ FOOTER LOGO ══ --}}
    <div class="footer-logo">
        <img src="{{ $logoBase64 }}" alt="CARFORFAR">
    </div>

</div>{{-- /content --}}
</body>
</html>
