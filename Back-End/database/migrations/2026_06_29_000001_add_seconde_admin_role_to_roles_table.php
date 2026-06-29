<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE roles MODIFY COLUMN name ENUM('Admin', 'Client', 'Seconde_Admin') NOT NULL");
        DB::table('roles')->updateOrInsert(['name' => 'Seconde_Admin'], ['name' => 'Seconde_Admin']);
    }

    public function down(): void
    {
        DB::table('roles')->where('name', 'Seconde_Admin')->delete();
        DB::statement("ALTER TABLE roles MODIFY COLUMN name ENUM('Admin', 'Client') NOT NULL");
    }
};
