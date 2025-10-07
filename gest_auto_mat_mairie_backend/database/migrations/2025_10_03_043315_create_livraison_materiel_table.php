<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('livraison_materiel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livraison_id')->constrained()->onDelete('cascade');
            $table->foreignId('materiel_id')->constrained()->onDelete('cascade');
            $table->integer('quantite_demandee')->nullable(); // quantité demandée par l’utilisateur
            $table->integer('quantite_livree')->nullable();   // quantité réellement livrée
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('livraison_materiel');
    }
};
