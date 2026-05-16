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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('marque');
            $table->string('model');
            $table->integer('year');
            $table->string('registration')->unique();
            $table->integer('km');
            $table->float('pricePerDay');
            $table->enum('fuelType', ['Electricity','Diesel','Gasoline','hybrid','LPG','CNG','biofuels']);
            $table->string('Occupants');
            $table->foreignId('category_id')->constrained();
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
