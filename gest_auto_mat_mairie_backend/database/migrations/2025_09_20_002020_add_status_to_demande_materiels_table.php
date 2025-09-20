<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('demande_materiels', function (Blueprint $table) {
        $table->enum('status', ['en_attente', 'valide', 'rejete'])->default('en_attente');
    });
}

public function down()
{
    Schema::table('demande_materiels', function (Blueprint $table) {
        $table->dropColumn('status');
    });
}

};
