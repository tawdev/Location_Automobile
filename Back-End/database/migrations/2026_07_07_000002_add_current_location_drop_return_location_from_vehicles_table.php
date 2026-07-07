<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['return_country_id']);
            $table->dropForeign(['return_city_id']);
            $table->dropColumn(['return_country_id', 'return_city_id']);
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('current_country_id')->nullable()->after('pickup_city_id')->constrained('countries')->nullOnDelete();
            $table->foreignId('current_city_id')->nullable()->after('current_country_id')->constrained('cities')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['current_country_id']);
            $table->dropForeign(['current_city_id']);
            $table->dropColumn(['current_country_id', 'current_city_id']);
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('return_country_id')->nullable()->after('pickup_city_id')->constrained('countries')->nullOnDelete();
            $table->foreignId('return_city_id')->nullable()->after('return_country_id')->constrained('cities')->nullOnDelete();
        });
    }
};
