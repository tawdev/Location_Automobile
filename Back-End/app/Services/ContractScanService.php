<?php

namespace App\Services;

use App\Models\Reservation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ContractScanService
{
    public function generateFromImages(Reservation $reservation, array $images): string
    {
        $tempPaths = [];

        foreach ($images as $i => $image) {
            $tempPath = $this->saveTempImage($image, $reservation->id, $i);
            if ($tempPath) {
                $tempPaths[] = $tempPath;
            }
        }

        if (empty($tempPaths)) {
            throw new \RuntimeException('Aucune image valide fournie pour le contrat.');
        }

        $base64Images = [];
        foreach ($tempPaths as $path) {
            $base64Images[] = 'data:image/' . pathinfo($path, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($path));
        }

        $pdf = Pdf::loadView('pdfs.contrat-scans', [
            'images' => $base64Images,
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->getDomPDF()->set_option('isRemoteEnabled', true);

        $filename = 'contrat-scans-' . $reservation->id . '-' . time() . '.pdf';
        $relativePath = 'contrats/' . $filename;
        $fullPath = Storage::disk('public')->path($relativePath);

        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $pdf->save($fullPath);

        foreach ($tempPaths as $path) {
            @unlink($path);
        }

        Log::info('Contract scan PDF generated: ' . $filename);

        return $relativePath;
    }

    private function saveTempImage(UploadedFile $file, int $reservationId, int $index): ?string
    {
        try {
            $ext = $file->getClientOriginalExtension();
            $filename = 'contrat-scan-' . $reservationId . '-' . $index . '-' . time() . '.' . $ext;
            $path = storage_path('app/temp/' . $filename);

            $dir = dirname($path);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $file->move($dir, $filename);

            return $path;
        } catch (\Throwable $e) {
            Log::error('Failed to save temp contract image: ' . $e->getMessage());
            return null;
        }
    }
}
