<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->integer('km_included')->default(0)->after('TotalPrice');
            $table->integer('km_driven')->nullable()->after('km_included');
            $table->decimal('km_overage_charge', 10, 2)->default(0)->after('km_driven');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['km_included', 'km_driven', 'km_overage_charge']);
        });
    }
};
