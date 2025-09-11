<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDatesToDemandeMateriels extends Migration
{
    public function up()
    {
        Schema::table('demande_materiels', function (Blueprint $table) {
            $table->timestamp('date_validation_directeur')->nullable();
            $table->timestamp('date_validation_gestionnaire_stock')->nullable();
            $table->timestamp('date_validation_daaf')->nullable();
            $table->timestamp('date_validation_secretaire_executif')->nullable();
        });
    }

    public function down()
    {
        Schema::table('demande_materiels', function (Blueprint $table) {
            $table->dropColumn([
                'date_validation_directeur',
                'date_validation_gestionnaire_stock',
                'date_validation_daaf',
                'date_validation_secretaire_executif'
            ]);
        });
    }
}
