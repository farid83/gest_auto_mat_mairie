<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    DB::statement("ALTER TABLE demandes DROP CONSTRAINT demandes_status_check");

    DB::statement("
        ALTER TABLE demandes
        ADD CONSTRAINT demandes_status_check
        CHECK (
            status IN ('en_attente', 'validee', 'rejetee', 'en_attente_stock')
        )
    ");
}

public function down()
{
    DB::statement("ALTER TABLE demandes DROP CONSTRAINT demandes_status_check");

    DB::statement("
        ALTER TABLE demandes
        ADD CONSTRAINT demandes_status_check
        CHECK (
            status IN ('en_attente', 'validee', 'rejetee')
        )
    ");
}

};
