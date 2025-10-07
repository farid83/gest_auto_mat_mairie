<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('livraison_materiel', function (Blueprint $table) {
            if (!Schema::hasColumn('livraison_materiel', 'quantite_demandee')) {
                $table->integer('quantite_demandee')->nullable();
            }
            if (!Schema::hasColumn('livraison_materiel', 'quantite_livree')) {
                $table->integer('quantite_livree')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('livraison_materiel', function (Blueprint $table) {
            if (Schema::hasColumn('livraison_materiel', 'quantite_demandee')) {
                $table->dropColumn('quantite_demandee');
            }
            if (Schema::hasColumn('livraison_materiel', 'quantite_livree')) {
                $table->dropColumn('quantite_livree');
            }
        });
    }
};
