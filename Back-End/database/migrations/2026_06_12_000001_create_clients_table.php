<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nom_prenom');
            $table->date('date_naissance');
            $table->string('cin_passport');
            $table->text('adresse');
            $table->string('telephone');
            $table->string('numero_permi');
            $table->date('date_delivrance');
            $table->date('date_expiration');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
