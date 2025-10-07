<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
   public function up()
{
    // Harmoniser les anciennes valeurs avant d'ajouter la nouvelle contrainte
    DB::table('demande_materiels')
        ->where('status', 'valide')
        ->update(['status' => 'validee']);

    DB::table('demande_materiels')
        ->where('status', 'rejete')
        ->update(['status' => 'rejetee']);

    // Supprimer l'ancienne contrainte
    DB::statement("ALTER TABLE demande_materiels DROP CONSTRAINT IF EXISTS demande_materiels_status_check");

    // Ajouter la nouvelle contrainte avec les bonnes valeurs
    DB::statement("ALTER TABLE demande_materiels 
        ADD CONSTRAINT demande_materiels_status_check 
        CHECK (status IN ('en_attente', 'validee', 'rejetee'))");
}


    public function down()
    {
        // Rollback vers l'ancienne version (si besoin)
        DB::statement("ALTER TABLE demande_materiels DROP CONSTRAINT IF EXISTS demande_materiels_status_check");

        DB::statement("ALTER TABLE demande_materiels 
            ADD CONSTRAINT demande_materiels_status_check 
            CHECK (status IN ('en_attente', 'valide', 'rejete'))");
    }
};
