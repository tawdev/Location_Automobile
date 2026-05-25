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
            $table->string('scCinRecto')->nullable()->after('cin_verso');
            $table->string('scCinVerso')->nullable()->after('scCinRecto');
            $table->string('scPermiRecto')->nullable()->after('scCinVerso');
            $table->string('scPermiVerso')->nullable()->after('scPermiRecto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['scCinRecto', 'scCinVerso', 'scPermiRecto', 'scPermiVerso']);
        });
    }
};
