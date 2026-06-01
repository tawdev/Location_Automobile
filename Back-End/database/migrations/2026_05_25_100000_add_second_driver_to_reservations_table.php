<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('driver2_name')->nullable()->after('TotalPrice');
            $table->string('driver2_cin_recto')->nullable()->after('driver2_name');
            $table->string('driver2_cin_verso')->nullable()->after('driver2_cin_recto');
            $table->string('driver2_permi_recto')->nullable()->after('driver2_cin_verso');
            $table->string('driver2_permi_verso')->nullable()->after('driver2_permi_recto');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'driver2_name',
                'driver2_cin_recto',
                'driver2_cin_verso',
                'driver2_permi_recto',
                'driver2_permi_verso',
            ]);
        });
    }
};
