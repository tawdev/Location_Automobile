<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
        }
        .page {
            page-break-after: always;
            width: 100%;
            height: 100%;
        }
        .page img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .page:last-child {
            page-break-after: avoid;
        }
    </style>
</head>
<body>
    @foreach($images as $image)
        <div class="page">
            <img src="{{ $image }}" alt="Scan">
        </div>
    @endforeach
</body>
</html>
