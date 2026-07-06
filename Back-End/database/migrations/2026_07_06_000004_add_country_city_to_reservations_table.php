<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('depart_country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->foreignId('depart_city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->foreignId('return_country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->foreignId('return_city_id')->nullable()->constrained('cities')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['depart_country_id']);
            $table->dropForeign(['depart_city_id']);
            $table->dropForeign(['return_country_id']);
            $table->dropForeign(['return_city_id']);
            $table->dropColumn(['depart_country_id', 'depart_city_id', 'return_country_id', 'return_city_id']);
        });
    }
};
