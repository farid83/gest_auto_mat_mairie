<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
            // Ajouter la contrainte d'unicité sur la colonne 'nom'
            $table->string('nom')->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
            // Supprimer la contrainte d'unicité
            $table->string('nom')->change();
        });
    }
};