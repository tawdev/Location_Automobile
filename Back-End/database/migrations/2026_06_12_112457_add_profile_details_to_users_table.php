<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('cin_passport', 50)->nullable()->after('address');
            $table->date('date_of_birth')->nullable()->after('cin_passport');
            $table->string('driver_license_number', 50)->nullable()->after('date_of_birth');
            $table->date('license_issue_date')->nullable()->after('driver_license_number');
            $table->date('license_expiry_date')->nullable()->after('license_issue_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cin_passport', 'date_of_birth', 'driver_license_number', 'license_issue_date', 'license_expiry_date']);
        });
    }
};
