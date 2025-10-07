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
        Schema::table('livraisons', function (Blueprint $table) {
            $table->foreignId('demande_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('statut', ['en_cours', 'livree', 'annulee'])->default('en_cours');
            $table->timestamp('date_livraison')->nullable();
            $table->text('commentaire')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('livraisons', function (Blueprint $table) {
            $table->dropForeign(['demande_id']);
            $table->dropForeign(['user_id']);
            $table->dropColumn(['demande_id', 'user_id', 'statut', 'date_livraison', 'commentaire']);
        });
    }
};