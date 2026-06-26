<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('type_vehicule_id')
                ->nullable()
                ->constrained('type_vehicules')
                ->nullOnDelete()
                ->after('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['type_vehicule_id']);
            $table->dropColumn('type_vehicule_id');
        });
    }
};
