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
        Schema::create('livraison_materiels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livraison_id')->constrained()->onDelete('cascade');
            $table->foreignId('materiel_id')->constrained()->onDelete('cascade');
            $table->integer('quantite_livree');
            $table->integer('quantite_demandee');
            $table->timestamps();
            
            $table->unique(['livraison_id', 'materiel_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livraison_materiels');
    }
};