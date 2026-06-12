<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departure_conditions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        DB::table('departure_conditions')->insert([
            ['name' => 'Véhicule propre'],
            ['name' => 'Pneus en bon état'],
            ['name' => 'Roue de secours présente'],
            ['name' => 'Gilet de sécurité présent'],
            ['name' => 'Triangle présent'],
            ['name' => 'Documents présents'],
            ['name' => 'Post radio'],
            ['name' => 'Allume cigare'],
            ['name' => 'Extincteur (poudre)'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('departure_conditions');
    }
};
