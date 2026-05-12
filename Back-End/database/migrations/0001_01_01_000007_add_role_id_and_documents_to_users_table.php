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
            $table->foreignId('role_id')->constrained();

            $table->string('cin_recto')->nullable();
            $table->string('cin_verso')->nullable();
            $table->string('permi_recto')->nullable();
            $table->string('permi_verso')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);

            $table->dropColumn([
                'role_id',
                'cin_recto',
                'cin_verso',
                'permi_recto',
                'permi_verso',
            ]);
        });
    }
};
