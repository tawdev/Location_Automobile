<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="utf-8">
    <title>{!! arabic('عقد تأجير سيارة - CARFORFAR') !!}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Noto Sans Arabic', 'dejavu sans', 'DejaVu Sans', sans-serif;
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
        .header-logo-cell { display: table-cell; width: 60px; vertical-align: middle; text-align: center; padding: 8px; border-left: 1px solid var(--light); }
        .header-logo-cell img { width: 52px; height: 52px; object-fit: contain; }
        .header-title-cell { display: table-cell; vertical-align: middle; text-align: center; padding: 8px 12px; }
        .header-title { font-size: 14px; font-weight: bold; color: var(--dark); letter-spacing: 0.5px; margin-bottom: 2px; }
        .header-company { font-size: 11px; font-weight: bold; color: var(--dark); margin-bottom: 4px; }
        .header-meta { font-size: 8px; color: var(--muted); }
        .header-meta span { margin: 0 4px; color: var(--light); }
        .section-header { display: table; width: 100%; background: var(--dark); border-radius: 4px; margin: 8px 0 4px 0; overflow: hidden; }
        .section-num { display: table-cell; width: 22px; text-align: center; vertical-align: middle; font-size: 9px; font-weight: bold; color: var(--amber); padding: 4px 8px 4px 4px; }
        .section-title { display: table-cell; vertical-align: middle; font-size: 9.5px; font-weight: bold; color: var(--white); padding: 4px 8px; text-align: right; }
        table.info { width: 100%; border-collapse: collapse; }
        table.info tr:nth-child(odd) { background: var(--bg); }
        table.info tr:nth-child(even) { background: var(--white); }
        table.info tr { border-bottom: 0.4px solid var(--light); }
        table.info td { padding: 3.5px 8px; vertical-align: middle; }
        td.lbl { width: 30%; font-weight: bold; font-size: 8.5px; color: var(--dark); text-align: right; padding-left: 4px; }
        td.val { width: 70%; font-size: 8.5px; color: var(--muted); text-align: left; }
        td.val .fill { border-bottom: 0.8px solid #b0bcd4; display: inline-block; width: 90%; height: 12px; }
        tr.total-row td { background: var(--dark) !important; color: var(--white) !important; font-weight: bold; }
        .checkbox-row { padding: 3px 8px; font-size: 8.5px; border-bottom: 0.4px solid var(--light); text-align: right; }
        .checkbox-row:nth-child(odd) { background: var(--bg); }
        .checkbox-row .chk { margin-left: 5px; }
        .bilingual-row { padding: 3.5px 8px; font-size: 8.5px; border-bottom: 0.4px solid var(--light); text-align: right; }
        .bilingual-row:nth-child(odd) { background: var(--bg); }
        .bullet { color: var(--amber); margin-left: 4px; }
        .obs-label { font-weight: bold; font-size: 8.5px; padding: 3px 8px; color: var(--dark); text-align: right; }
        .obs-box { border: 0.8px solid var(--light); border-right: 3px solid var(--mid); background: var(--bg); min-height: 22px; margin: 2px 0 6px 0; border-radius: 3px; }
        .mode-label { font-weight: bold; font-size: 8.5px; padding: 3px 8px; color: var(--dark); text-align: right; }
        .signatures { display: table; width: 100%; margin-top: 5px; }
        .sig-box { display: table-cell; width: 48%; border: 1px solid var(--light); border-top: 3px solid var(--amber); border-radius: 4px; background: var(--bg); padding: 8px 10px; vertical-align: top; }
        .sig-gap { display: table-cell; width: 4%; }
        .sig-title { font-weight: bold; font-size: 9px; color: var(--dark); margin-bottom: 4px; text-align: right; }
        .sig-name { font-size: 8.5px; color: var(--muted); margin-bottom: 14px; text-align: right; }
        .sig-line { border-bottom: 0.8px solid var(--dark); margin-bottom: 3px; }
        .sig-hint { font-size: 7px; color: var(--muted); margin-bottom: 5px; text-align: right; }
        .sig-date { font-size: 8.5px; color: var(--muted); text-align: right; }
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
            <div class="header-title">{!! arabic('عقد تأجير سيارة') !!}</div>
            <div class="header-company">CARFORFAR</div>
            <div class="header-meta">
                {!! arabic('رقم العقد :') !!} <strong>{{ str_pad($reservation->id, 6, '0', STR_PAD_LEFT) }}</strong>
                <span>|</span> {!! arabic('التاريخ :') !!} <strong>{{ \Carbon\Carbon::now()->format('d/m/Y') }}</strong>
                <span>|</span> {!! arabic('المكان :') !!} <strong>{!! arabic('مراكش') !!}</strong>
            </div>
        </div>
        <div class="header-logo-cell">
            <img src="{{ $logoBase64 }}" alt="CARFORFAR"/>        </div>
    </div>

    @php $startDate = \Carbon\Carbon::parse($reservation->start_date); $endDate = \Carbon\Carbon::parse($reservation->end_date); $days = max(1, $startDate->diffInDays($endDate)); $extrasTotalPerDay = $reservation->extras ? $reservation->extras->sum('price_per_day') : 0; $client = null; @endphp

    <div class="section-header">
        <div class="section-num">1</div>
        <div class="section-title">{!! arabic('تعريف المستأجر') !!}</div>
    </div>
    @php $u = $reservation->user; @endphp
    <table class="info">
        <tr><td class="val">{{ $u->name }}</td><td class="lbl">{!! arabic('الاسم الكامل') !!}</td></tr>
        <tr><td class="val">{{ $u->date_of_birth ? \Carbon\Carbon::parse($u->date_of_birth)->format('d/m/Y') : '' }}</td><td class="lbl">{!! arabic('تاريخ الازدياد') !!}</td></tr>
        <tr><td class="val">{{ $u->cin_passport ?? '' }}</td><td class="lbl">{!! arabic('رقم البطاقة / جواز السفر') !!}</td></tr>
        <tr><td class="val">{{ $u->address ?? '' }}</td><td class="lbl">{!! arabic('العنوان') !!}</td></tr>
        <tr><td class="val">{{ $u->phone ?? '' }}</td><td class="lbl">{!! arabic('الهاتف') !!}</td></tr>
        <tr><td class="val">{{ $u->email }}</td><td class="lbl">{!! arabic('البريد الإلكتروني') !!}</td></tr>
        <tr><td class="val">{{ $u->driver_license_number ?? '' }}</td><td class="lbl">{!! arabic('رقم رخصة السياقة') !!}</td></tr>
        <tr><td class="val">{{ $u->license_issue_date ? \Carbon\Carbon::parse($u->license_issue_date)->format('d/m/Y') : '' }}</td><td class="lbl">{!! arabic('تاريخ الإصدار') !!}</td></tr>
        <tr><td class="val">{{ $u->license_expiry_date ? \Carbon\Carbon::parse($u->license_expiry_date)->format('d/m/Y') : '' }}</td><td class="lbl">{!! arabic('تاريخ الانتهاء') !!}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">2</div>
        <div class="section-title">{!! arabic('السائق الإضافي (اختياري)') !!}</div>
    </div>
    <table class="info">
        <tr><td class="val">{{ $reservation->driver2_name ?? '' }}</td><td class="lbl">{!! arabic('الاسم الكامل') !!}</td></tr>
        <tr><td class="val">{{ $reservation->driver2_cin ?? '' }}</td><td class="lbl">{!! arabic('رقم بطاقة التعريف') !!}</td></tr>
        <tr><td class="val">{{ $reservation->driver2_license ?? '' }}</td><td class="lbl">{!! arabic('رقم الرخصة') !!}</td></tr>
        <tr><td class="val">{{ $reservation->driver2_phone ?? '' }}</td><td class="lbl">{!! arabic('الهاتف') !!}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">3</div>
        <div class="section-title">{!! arabic('معلومات السيارة') !!}</div>
    </div>
    <table class="info">
        <tr><td class="val">{{ $reservation->vehicle->marque }}</td><td class="lbl">{!! arabic('الماركة') !!}</td></tr>
        <tr><td class="val">{{ $reservation->vehicle->model }}</td><td class="lbl">{!! arabic('الموديل') !!}</td></tr>
        <tr><td class="val">{{ $reservation->vehicle->registration }}</td><td class="lbl">{!! arabic('رقم التسجيل') !!}</td></tr>
        <tr><td class="val">{{ $reservation->vehicle->km }} {!! arabic('كم') !!}</td><td class="lbl">{!! arabic('عدد الكيلومترات عند الانطلاق') !!}</td></tr>
        <tr><td class="val">{{ $reservation->vehicle->fuelType ?? '' }}<span class="fill"></span></td><td class="lbl">{!! arabic('مستوى الوقود عند الانطلاق') !!}</td></tr>
        <tr><td class="val"><span class="fill"></span></td><td class="lbl">{!! arabic('تاريخ أول تسجيل') !!}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">4</div>
        <div class="section-title">{!! arabic('مدة التأجير') !!}</div>
    </div>
    <table class="info">
        <tr><td class="val">{{ $startDate->format('d/m/Y') }}</td><td class="lbl">{!! arabic('تاريخ الانطلاق') !!}</td></tr>
        <tr><td class="val">{{ $reservation->start_time ? \Carbon\Carbon::parse($reservation->start_time)->format('H:i') : '______' }}</td><td class="lbl">{!! arabic('وقت الانطلاق') !!}</td></tr>
        <tr><td class="val">{{ $endDate->format('d/m/Y') }}</td><td class="lbl">{!! arabic('تاريخ الإرجاع') !!}</td></tr>
        <tr><td class="val">{{ $reservation->end_time ? \Carbon\Carbon::parse($reservation->end_time)->format('H:i') : '______' }}</td><td class="lbl">{!! arabic('وقت الإرجاع') !!}</td></tr>
        <tr><td class="val">{{ $reservation->lieu_depart ?? '' }}{{ $reservation->lieu_depart ? '، ' : '' }}{{ $reservation->departCity?->name ?? '' }}{{ $reservation->departCity?->name && $reservation->departCountry?->name ? '، ' : '' }}{{ $reservation->departCountry?->name ?? 'مراكش' }}</td><td class="lbl">{!! arabic('مكان الانطلاق') !!}</td></tr>
        <tr><td class="val">{{ $reservation->lieu_retour ?? '' }}{{ $reservation->lieu_retour ? '، ' : '' }}{{ $reservation->returnCity?->name ?? '' }}{{ $reservation->returnCity?->name && $reservation->returnCountry?->name ? '، ' : '' }}{{ $reservation->returnCountry?->name ?? 'مراكش' }}</td><td class="lbl">{!! arabic('مكان الإرجاع') !!}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">5</div>
        <div class="section-title">{!! arabic('وديعة الضمان') !!}</div>
    </div>
    <table class="info">
        <tr><td class="val">{{ $reservation->caution_amount ? number_format($reservation->caution_amount, 2) : '______' }} {!! arabic('درهم') !!}</td><td class="lbl">{!! arabic('مبلغ الوديعة') !!}</td></tr>
    </table>
    <div class="mode-label">{!! arabic('طريقة الضمان :') !!}</div>
    @php $cm = $reservation->caution_mode; @endphp
    <div class="checkbox-row">
        <span class="chk">{{ $cm === 'carte_bancaire' ? '&#9746;' : '&#9744;' }}</span> {!! arabic('بطاقة بنكية') !!}&nbsp;&nbsp;
        <span class="chk">{{ $cm === 'especes' ? '&#9746;' : '&#9744;' }}</span> {!! arabic('نقداً') !!}&nbsp;&nbsp;
        <span class="chk">{{ $cm === 'passport' ? '&#9746;' : '&#9744;' }}</span> {!! arabic('جواز السفر') !!}&nbsp;&nbsp;
        <span class="chk">{{ $cm === 'autre' ? '&#9746;' : '&#9744;' }}</span> {!! arabic('أخرى') !!}
    </div>

    <div class="section-header">
        <div class="section-num">6</div>
        <div class="section-title">{!! arabic('حالة السيارة عند الانطلاق') !!}</div>
    </div>
    @php $conditions = $reservation->departureConditions ?? null; @endphp
    @if($conditions && $conditions->count() > 0)
        @foreach($conditions->chunk(2) as $chunk)
        <div class="checkbox-row">
            @foreach($chunk as $cond)
                <span class="chk">{{ $cond->pivot->checked ? '&#9746;' : '&#9744;' }}</span> {!! arabic($cond->name) !!}&nbsp;&nbsp;
            @endforeach
        </div>
        @endforeach
    @else
        <div class="checkbox-row"><span class="chk">&#9744;</span> {!! arabic('السيارة نظيفة') !!}&nbsp;&nbsp; <span class="chk">&#9744;</span> {!! arabic('الإطارات سليمة') !!}</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> {!! arabic('العجلة الاحتياطية موجودة') !!}&nbsp;&nbsp; <span class="chk">&#9744;</span> {!! arabic('سترة الأمان موجودة') !!}</div>
        <div class="checkbox-row"><span class="chk">&#9744;</span> {!! arabic('مثلث التحذير موجود') !!}&nbsp;&nbsp; <span class="chk">&#9744;</span> {!! arabic('الوثائق موجودة') !!}</div>
    @endif
    <div class="obs-label">{!! arabic('ملاحظات :') !!}</div>
    <div class="obs-box">{{ $reservation->observations ?? '' }}</div>

    <div class="section-header">
        <div class="section-num">7</div>
        <div class="section-title">{!! arabic('التزامات المستأجر') !!}</div>
    </div>
    <div class="bilingual-row"><span class="bullet">•</span> {!! arabic('احترام قانون المرور المغربي') !!}</div>
    <div class="bilingual-row"><span class="bullet">•</span> {!! arabic('استخدام السيارة باعتدال وحذر') !!}</div>
    <div class="bilingual-row"><span class="bullet">•</span> {!! arabic('عدم القيادة تحت تأثير الكحول أو المخدرات') !!}</div>
    <div class="bilingual-row"><span class="bullet">•</span> {!! arabic('عدم إعادة تأجير السيارة') !!}</div>
    <div class="bilingual-row"><span class="bullet">•</span> {!! arabic('عدم استخدامها في المسابقات') !!}</div>
    <div class="bilingual-row"><span class="bullet">•</span> {!! arabic('إبلاغ المؤجر فوراً في حالة الحادث') !!}</div>
    <div class="bilingual-row"><span class="bullet">•</span> {!! arabic('إرجاع السيارة في التاريخ المتفق عليه') !!}</div>

    <div class="section-header">
        <div class="section-num">8</div>
        <div class="section-title">{!! arabic('التأمين') !!}</div>
    </div>
    <div class="mode-label">{!! arabic('الخطة المختارة :') !!}</div>
    <div class="checkbox-row"><span class="chk">&#9744;</span> {!! arabic('الحماية الأساسية') !!}&nbsp;&nbsp; <span class="chk">&#9744;</span> {!! arabic('الحماية الذهبية') !!}&nbsp;&nbsp; <span class="chk">&#9744;</span> {!! arabic('الحماية البلاتينية') !!}</div>
    <table class="info">
        <tr><td class="val"><span class="fill"></span> {!! arabic('درهم') !!}</td><td class="lbl">{!! arabic('الخصم المطبق') !!}</td></tr>
    </table>

    <div class="section-header">
        <div class="section-num">9</div>
        <div class="section-title">{!! arabic('خيارات إضافية') !!}</div>
    </div>
    <table class="info">
        <tr>
            <td class="val">
                @if($reservation->extras && $reservation->extras->count() > 0)
                    @foreach($reservation->extras as $extra)
                        {{ number_format($extra->price_per_day, 2) }} {!! arabic('درهم/اليوم :') !!} {{ $extra->name }}<br>
                    @endforeach
                @else
                    {!! arabic('لا توجد خيارات إضافية') !!}
                @endif
            </td>
            <td class="lbl">{!! arabic('الخيارات المختارة') !!}</td>
        </tr>
        <tr>
            <td class="val">{{ number_format($extrasTotalPerDay * $days, 2) }} {!! arabic('درهم') !!}</td>
            <td class="lbl">{!! arabic('مجموع الخيارات') !!}</td>
        </tr>
    </table>

    <div class="section-header">
        <div class="section-num">10</div>
        <div class="section-title">{!! arabic('في حالة الحادث أو العطل') !!}</div>
    </div>
    <div class="bilingual-row"><span class="bullet">1.</span> {!! arabic('الإبلاغ الفوري عن CARFORFAR') !!}</div>
    <div class="bilingual-row"><span class="bullet">2.</span> {!! arabic('إبلاغ السلطات المختصة') !!}</div>
    <div class="bilingual-row"><span class="bullet">3.</span> {!! arabic('تحرير محضر ودي للحادث') !!}</div>
    <div class="bilingual-row"><span class="bullet">4.</span> {!! arabic('إرسال جميع الوثائق في غضون 24 ساعة') !!}</div>

    <div class="section-header">
        <div class="section-num">11</div>
        <div class="section-title">{!! arabic('إرجاع السيارة') !!}</div>
    </div>
    <table class="info">
        <tr><td class="val">{{ $endDate->format('d/m/Y') }}</td><td class="lbl">{!! arabic('تاريخ الإرجاع') !!}</td></tr>
        <tr><td class="val">______ : ______</td><td class="lbl">{!! arabic('وقت الإرجاع') !!}</td></tr>
        <tr><td class="val"><span class="fill"></span> {!! arabic('كم') !!}</td><td class="lbl">{!! arabic('عدد الكيلومترات عند الإرجاع') !!}</td></tr>
        <tr><td class="val"><span class="fill"></span></td><td class="lbl">{!! arabic('مستوى الوقود عند الإرجاع') !!}</td></tr>
    </table>
    <div class="obs-label">{!! arabic('ملاحظات :') !!}</div>
    <div class="obs-box"></div>

    <div class="section-header">
        <div class="section-num">12</div>
        <div class="section-title">{!! arabic('القانون المنطبق') !!}</div>
    </div>
    <div class="bilingual-row">{!! arabic('يخضع هذا العقد للقانون المغربي.') !!}</div>
    <div class="bilingual-row">{!! arabic('يختص القضاء بمحاكم مراكش في أي نزاع.') !!}</div>

    @php $hasExtra = $reservation->driver2_name ? true : false; @endphp
    <div class="section-header">
        <div class="section-num">&#9998;</div>
        <div class="section-title">{!! arabic('التوقيعات') !!}</div>
    </div>
    <div class="signatures" style="margin-top:6px;">
        <div class="sig-box" style="width:{{ $hasExtra ? '31%' : '48%' }};">
            <div class="sig-title">{!! arabic('المؤجر (CARFORFAR)') !!}</div>
            <div class="sig-name">{!! arabic('الاسم :') !!} CARFORFAR</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">{!! arabic('التوقيع') !!}</div>
            <div class="sig-date">{!! arabic('التاريخ :') !!} ____ / ____ / ______</div>
        </div>
        <div class="sig-gap" style="width:{{ $hasExtra ? '2%' : '4%' }};"></div>
        <div class="sig-box" style="width:{{ $hasExtra ? '31%' : '48%' }};">
            <div class="sig-title">{!! arabic('المستأجر') !!}</div>
            <div class="sig-name">{!! arabic('الاسم :') !!} {{ $reservation->user->name }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">{!! arabic('التوقيع') !!}</div>
            <div class="sig-date">{!! arabic('التاريخ :') !!} ____ / ____ / ______</div>
        </div>
        @if($hasExtra)
        <div class="sig-gap" style="width:2%;"></div>
        <div class="sig-box" style="width:31%;">
            <div class="sig-title">{!! arabic('السائق الإضافي') !!}</div>
            <div class="sig-name">{!! arabic('الاسم :') !!} {{ $reservation->driver2_name }}</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-line">&nbsp;</div>
            <div class="sig-hint">{!! arabic('التوقيع') !!}</div>
            <div class="sig-date">{!! arabic('التاريخ :') !!} ____ / ____ / ______</div>
        </div>
        @endif
    </div>

    <div class="footer">
        &copy; {{ date('Y') }} CARFORFAR &mdash; {!! arabic('تأجير السيارات بمراكش') !!} &nbsp;|&nbsp;
        {!! arabic('تم إنشاء العقد في') !!} {{ \Carbon\Carbon::now()->format('d/m/Y \à H:i') }} &nbsp;|&nbsp;
        contact@carforfar.com
    </div>

    <div class="footer-logo">
        <img src="{{ $logoBase64 }}" alt="CARFORFAR">
    </div>

</div>
</body>
</html>
