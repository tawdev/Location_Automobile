<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('return_location_name')->nullable()->after('return_location_type');
            $table->decimal('return_location_supplement', 10, 2)->nullable()->after('return_location_name');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['return_location_name', 'return_location_supplement']);
        });
    }
};
