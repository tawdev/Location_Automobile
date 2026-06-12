<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departure_condition_reservation', function (Blueprint $table) {
            $table->foreignId('reservation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('departure_condition_id')->constrained()->cascadeOnDelete();
            $table->boolean('checked')->default(false);
            $table->primary(['reservation_id', 'departure_condition_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departure_condition_reservation');
    }
};
