<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->index();
            $table->decimal('latitude',  10, 7);
            $table->decimal('longitude', 10, 7);
            $table->float('speed')->nullable();
            $table->float('accuracy')->nullable();
            $table->float('heading')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
