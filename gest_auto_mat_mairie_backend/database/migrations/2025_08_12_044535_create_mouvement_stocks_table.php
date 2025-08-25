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
        Schema::create('mouvement_stocks', function (Blueprint $table) {
    $table->id();
    $table->enum('type', ['Entrée', 'Sortie']);
    $table->foreignId('materiel_id')->constrained('materiels')->onDelete('cascade');
    $table->integer('quantity');
   $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // responsable du mouvement
    $table->date('date');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvement_stocks');
    }
};
