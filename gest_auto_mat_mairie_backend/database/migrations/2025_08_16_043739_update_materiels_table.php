<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
    if (!Schema::hasColumn('materiels', 'categorie')) {
        $table->string('categorie')->nullable()->after('nom');
    }
    if (!Schema::hasColumn('materiels', 'quantite_totale')) {
        $table->integer('quantite_totale')->default(0)->after('categorie');
    }
    if (!Schema::hasColumn('materiels', 'quantite_disponible')) {
        $table->integer('quantite_disponible')->default(0)->after('quantite_totale');
    }
    if (!Schema::hasColumn('materiels', 'etat')) {
        $table->string('etat')->default('Bon')->after('quantite_disponible');
    }
});

    }

    public function down(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
            $table->dropColumn(['nom', 'categorie', 'quantite_totale', 'quantite_disponible', 'etat']);
        });
    }
};
