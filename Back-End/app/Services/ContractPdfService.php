<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class ContractPdfService
{
    private function registerArabicFonts(\Barryvdh\DomPDF\PDF $pdf): void
    {
        $fontPath = storage_path('fonts');
        $regular = $fontPath . '/NotoSansArabic-Regular.ttf';
        $bold = $fontPath . '/NotoSansArabic-Bold.ttf';

        if (!file_exists($regular) || !file_exists($bold)) {
            return;
        }

        $dompdf = $pdf->getDomPDF();
        $fontMetrics = $dompdf->getFontMetrics();

        $fontMetrics->registerFont(
            ['family' => 'Noto Sans Arabic', 'style' => 'normal', 'weight' => 'normal'],
            $regular
        );
        $fontMetrics->registerFont(
            ['family' => 'Noto Sans Arabic', 'style' => 'normal', 'weight' => 'bold'],
            $bold
        );
    }

    private function generateSingle(Reservation $reservation, string $locale): string
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        $view = match ($locale) {
            'fr' => 'pdfs.contrat-location-fr',
            'en' => 'pdfs.contrat-location-en',
            'ar' => 'pdfs.contrat-location-ar',
            default => 'pdfs.contrat-location-fr',
        };

        $pdf = Pdf::loadView($view, [
            'reservation' => $reservation,
            'settings' => $settings,
        ]);

        $this->registerArabicFonts($pdf);

        $pdf->setPaper('A4', 'portrait');

        $filename = 'contrat-location-' . $locale . '-' . $reservation->id . '-' . time() . '.pdf';
        $path = storage_path('app/public/contrats/' . $filename);

        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $pdf->save($path);

        Log::info('Contract PDF generated: ' . $filename);

        return $path;
    }

    public function generateAll(Reservation $reservation): array
    {
        $reservation->loadMissing(['user', 'vehicle', 'extras']);

        return [
            'fr' => $this->generateSingle($reservation, 'fr'),
            'en' => $this->generateSingle($reservation, 'en'),
            'ar' => $this->generateSingle($reservation, 'ar'),
        ];
    }

    public function generate(Reservation $reservation): string
    {
        $paths = $this->generateAll($reservation);
        return $paths['fr'];
    }

    public function download(Reservation $reservation, string $locale = 'fr')
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        $view = match ($locale) {
            'fr' => 'pdfs.contrat-location-fr',
            'en' => 'pdfs.contrat-location-en',
            'ar' => 'pdfs.contrat-location-ar',
            default => 'pdfs.contrat-location-fr',
        };

        $reservation->loadMissing(['user', 'vehicle', 'extras']);

        $pdf = Pdf::loadView($view, [
            'reservation' => $reservation,
            'settings' => $settings,
        ]);

        $this->registerArabicFonts($pdf);

        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('contrat-location-' . $locale . '-' . $reservation->id . '.pdf');
    }
}
