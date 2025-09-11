<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddQuantiteProposeeValideeToDemandeMateriels extends Migration
{
    public function up()
    {
        Schema::table('demande_materiels', function (Blueprint $table) {
            $table->integer('quantite_proposee_gestionnaire')->nullable();
            $table->integer('quantite_validee_daaf')->nullable();
        });
    }

    public function down()
    {
        Schema::table('demande_materiels', function (Blueprint $table) {
            $table->dropColumn(['quantite_proposee_gestionnaire', 'quantite_validee_daaf']);
        });
    }
}
