<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        DB::table('settings')->insert([
            ['key' => 'address', 'value' => 'Marrakech, Morocco'],
            ['key' => 'phone', 'value' => '+212 5XX XX XX XX'],
            ['key' => 'email', 'value' => 'contact@carforfar.ma'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
