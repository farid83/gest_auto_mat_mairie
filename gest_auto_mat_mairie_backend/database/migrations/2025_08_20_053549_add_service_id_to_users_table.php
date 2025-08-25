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
        $table->foreignId('service_id')
              ->nullable()
              ->constrained('services')
              ->onDelete('set null')
              ->after('role'); // place le champ après 'role'
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['service_id']);
        $table->dropColumn('service_id');
    });
}

};
