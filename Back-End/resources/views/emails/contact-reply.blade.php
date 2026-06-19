<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reply to your message</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #F0F3FA; color: #1a2a4a; }
        .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(57,88,134,0.12); }
        .header { background: #395886; padding: 32px 40px; text-align: center; }
        .header h1 { color: #F0F3FA; margin: 0; font-size: 22px; font-weight: 800; }
        .header p { color: #D5DEEF; margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px 40px; }
        .greeting { font-size: 16px; font-weight: 700; color: #1a2a4a; margin-bottom: 16px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 11px; font-weight: 800; color: #638ECB; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
        .message-box { font-size: 14px; font-weight: 600; color: #1a2a4a; background: #F0F3FA; padding: 14px; border-radius: 8px; line-height: 1.6; white-space: pre-wrap; }
        .footer { background: #F0F3FA; padding: 20px 40px; text-align: center; font-size: 12px; color: #638ECB; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reply to your message</h1>
            <p>CARFORFAR has responded</p>
        </div>
        <div class="body">
            <div class="greeting">Hello {{ $clientName }},</div>
            <div class="field">
                <div class="label">Subject</div>
                <div class="message-box" style="background: transparent; padding: 0; font-weight: 700;">{{ $originalSubject }}</div>
            </div>
            <div class="field">
                <div class="label">Our Response</div>
                <div class="message-box">{{ $replyMessage }}</div>
            </div>
            <p style="font-size: 12px; color: #638ECB; margin-top: 20px;">
                If you have further questions, feel free to reply to this email.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CARFORFAR &mdash; Location de voitures &agrave; Marrakech
        </div>
    </div>
</body>
</html>
