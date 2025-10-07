<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Supprimer l'ancienne contrainte si elle existe
        DB::statement('ALTER TABLE demandes DROP CONSTRAINT IF EXISTS demandes_status_check');

        // 2. Corriger les anciennes valeurs dans les données
        DB::statement("UPDATE demandes SET status = 'validee' WHERE status = 'valide'");
        DB::statement("UPDATE demandes SET status = 'rejetee' WHERE status = 'rejete'");

        // 3. Ajouter la nouvelle contrainte avec les bons ENUM
        DB::statement("
            ALTER TABLE demandes 
            ADD CONSTRAINT demandes_status_check 
            CHECK (status IN ('en_attente', 'validee', 'rejetee'))
        ");
    }

    public function down(): void
    {
        // rollback : enlever la nouvelle contrainte
        DB::statement('ALTER TABLE demandes DROP CONSTRAINT IF EXISTS demandes_status_check');

        // rollback des données (optionnel)
        DB::statement("UPDATE demandes SET status = 'valide' WHERE status = 'validee'");
        DB::statement("UPDATE demandes SET status = 'rejete' WHERE status = 'rejetee'");

        // remettre l’ancienne contrainte
        DB::statement("
            ALTER TABLE demandes 
            ADD CONSTRAINT demandes_status_check 
            CHECK (status IN ('en_attente', 'valide', 'rejete'))
        ");
    }
};
