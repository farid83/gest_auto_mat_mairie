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
    Schema::table('demandes', function (Blueprint $table) {
        $table->unsignedBigInteger('gestionnaire_id')->nullable()->after('directeur_id');
        $table->foreign('gestionnaire_id')->references('id')->on('users')->onDelete('set null');
    });
}

public function down()
{
    Schema::table('demandes', function (Blueprint $table) {
        $table->dropForeign(['gestionnaire_id']);
        $table->dropColumn('gestionnaire_id');
    });
}

};
