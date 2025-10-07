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
        // Ajouter le statut 'livraison' à la liste des statuts existants
        // Si la colonne status existe déjà, on modifie son type
        if (Schema::hasColumn('demandes', 'status')) {
            // Pour PostgreSQL, on doit supprimer et recréer la colonne
            DB::statement("ALTER TABLE demandes DROP COLUMN status");
            Schema::table('demandes', function (Blueprint $table) {
                $table->enum('status', ['en_attente', 'en_attente_stock', 'en_attente_daaf', 'en_attente_secretaire', 'validee_finale', 'livraison', 'rejetee'])
                      ->default('en_attente');
            });
        } else {
            Schema::table('demandes', function (Blueprint $table) {
                $table->enum('status', ['en_attente', 'en_attente_stock', 'en_attente_daaf', 'en_attente_secretaire', 'validee_finale', 'livraison', 'rejetee'])
                      ->default('en_attente');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('demandes', 'status')) {
            // Pour PostgreSQL, on doit supprimer et recréer la colonne
            DB::statement("ALTER TABLE demandes DROP COLUMN status");
            Schema::table('demandes', function (Blueprint $table) {
                $table->enum('status', ['en_attente', 'en_attente_stock', 'en_attente_daaf', 'en_attente_secretaire', 'validee_finale', 'rejetee'])
                      ->default('en_attente');
            });
        }
    }
};