<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('user_id')->constrained()->cascadeOnDelete();

            // Second conductor full details
            $table->string('driver2_nom_prenom')->nullable()->after('driver2_permi_verso');
            $table->date('driver2_date_naissance')->nullable()->after('driver2_nom_prenom');
            $table->string('driver2_cin_passport')->nullable()->after('driver2_date_naissance');
            $table->text('driver2_adresse')->nullable()->after('driver2_cin_passport');
            $table->string('driver2_telephone')->nullable()->after('driver2_adresse');
            $table->string('driver2_numero_permi')->nullable()->after('driver2_telephone');
            $table->date('driver2_date_delivrance')->nullable()->after('driver2_numero_permi');
            $table->date('driver2_date_expiration')->nullable()->after('driver2_date_delivrance');

            // Caution
            $table->decimal('caution_montant', 10, 2)->nullable()->after('TotalPrice');
            $table->string('caution_mode')->nullable()->after('caution_montant');

            // Location details
            $table->string('lieu_depart')->nullable()->after('end_date');
            $table->string('lieu_retour')->nullable()->after('lieu_depart');
            $table->dateTime('date_heure_depart')->nullable()->after('lieu_retour');
            $table->dateTime('date_heure_retour')->nullable()->after('date_heure_depart');

            // Observations
            $table->text('observations')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn([
                'client_id',
                'driver2_nom_prenom',
                'driver2_date_naissance',
                'driver2_cin_passport',
                'driver2_adresse',
                'driver2_telephone',
                'driver2_numero_permi',
                'driver2_date_delivrance',
                'driver2_date_expiration',
                'caution_montant',
                'caution_mode',
                'lieu_depart',
                'lieu_retour',
                'date_heure_depart',
                'date_heure_retour',
                'observations',
            ]);
        });
    }
};
