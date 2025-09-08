<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            // Nouveaux acteurs du workflow
            if (!Schema::hasColumn('demandes', 'gestionnaire_id')) {
                $table->unsignedBigInteger('gestionnaire_id')->nullable();
            }
            if (!Schema::hasColumn('demandes', 'daaf_id')) {
                $table->unsignedBigInteger('daaf_id')->nullable();
            }
            if (!Schema::hasColumn('demandes', 'secretaire_id')) {
                $table->unsignedBigInteger('secretaire_id')->nullable();
            }

            // Traces de validation
            if (!Schema::hasColumn('demandes', 'date_validation_gestionnaire')) {
                $table->timestamp('date_validation_gestionnaire')->nullable();
            }
            if (!Schema::hasColumn('demandes', 'date_validation_daaf')) {
                $table->timestamp('date_validation_daaf')->nullable();
            }
            if (!Schema::hasColumn('demandes', 'date_validation_secretaire')) {
                $table->timestamp('date_validation_secretaire')->nullable();
            }
        });

        // Clés étrangères (ON DELETE CASCADE pour rester cohérent avec les autres FK)
        Schema::table('demandes', function (Blueprint $table) {
            // On teste l'existence car en prod une migration peut être rejouée
            $fks = DB::select("
                SELECT conname
                FROM pg_constraint
                WHERE conrelid = 'demandes'::regclass AND contype = 'f'
            ");
            $fkNames = collect($fks)->pluck('conname')->all();

            if (!in_array('demandes_gestionnaire_id_foreign', $fkNames)) {
                $table->foreign('gestionnaire_id')->references('id')->on('users')->onDelete('cascade');
            }
            if (!in_array('demandes_daaf_id_foreign', $fkNames)) {
                $table->foreign('daaf_id')->references('id')->on('users')->onDelete('cascade');
            }
            if (!in_array('demandes_secretaire_id_foreign', $fkNames)) {
                $table->foreign('secretaire_id')->references('id')->on('users')->onDelete('cascade');
            }
        });

        // Étendre le CHECK du statut (PostgreSQL)
        // Ancien: en_attente, validee, rejetee
        // Nouveau: + en_attente_stock, en_attente_daaf, en_attente_secretaire, validee_finale
        DB::statement("ALTER TABLE demandes DROP CONSTRAINT IF EXISTS demandes_status_check;");
        DB::statement("
            ALTER TABLE demandes
            ADD CONSTRAINT demandes_status_check
            CHECK (status IN (
                'en_attente',
                'en_attente_stock',
                'en_attente_daaf',
                'en_attente_secretaire',
                'validee',
                'validee_finale',
                'rejetee'
            ));
        ");
    }

    public function down(): void
    {
        // Revenir à l'ancien CHECK
        DB::statement("ALTER TABLE demandes DROP CONSTRAINT IF EXISTS demandes_status_check;");
        DB::statement("
            ALTER TABLE demandes
            ADD CONSTRAINT demandes_status_check
            CHECK (status IN ('en_attente','validee','rejetee'));
        ");

        // Supprimer les FK avant les colonnes
        Schema::table('demandes', function (Blueprint $table) {
            if (Schema::hasColumn('demandes', 'gestionnaire_id')) {
                $table->dropForeign(['gestionnaire_id']);
            }
            if (Schema::hasColumn('demandes', 'daaf_id')) {
                $table->dropForeign(['daaf_id']);
            }
            if (Schema::hasColumn('demandes', 'secretaire_id')) {
                $table->dropForeign(['secretaire_id']);
            }
        });

        Schema::table('demandes', function (Blueprint $table) {
            if (Schema::hasColumn('demandes', 'gestionnaire_id')) {
                $table->dropColumn('gestionnaire_id');
            }
            if (Schema::hasColumn('demandes', 'daaf_id')) {
                $table->dropColumn('daaf_id');
            }
            if (Schema::hasColumn('demandes', 'secretaire_id')) {
                $table->dropColumn('secretaire_id');
            }
            if (Schema::hasColumn('demandes', 'date_validation_gestionnaire')) {
                $table->dropColumn('date_validation_gestionnaire');
            }
            if (Schema::hasColumn('demandes', 'date_validation_daaf')) {
                $table->dropColumn('date_validation_daaf');
            }
            if (Schema::hasColumn('demandes', 'date_validation_secretaire')) {
                $table->dropColumn('date_validation_secretaire');
            }
        });
    }
};
