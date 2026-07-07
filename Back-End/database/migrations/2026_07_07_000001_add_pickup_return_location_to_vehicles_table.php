<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('pickup_country_id')->nullable()->after('order')->constrained('countries')->nullOnDelete();
            $table->foreignId('pickup_city_id')->nullable()->after('pickup_country_id')->constrained('cities')->nullOnDelete();
            $table->foreignId('return_country_id')->nullable()->after('pickup_city_id')->constrained('countries')->nullOnDelete();
            $table->foreignId('return_city_id')->nullable()->after('return_country_id')->constrained('cities')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['pickup_country_id']);
            $table->dropForeign(['pickup_city_id']);
            $table->dropForeign(['return_country_id']);
            $table->dropForeign(['return_city_id']);
            $table->dropColumn(['pickup_country_id', 'pickup_city_id', 'return_country_id', 'return_city_id']);
        });
    }
};
