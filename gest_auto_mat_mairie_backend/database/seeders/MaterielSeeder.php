<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Materiel;

class MaterielSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Materiel::create([
            'nom' => 'Ordinateur portable',
            'categorie' => 'Informatique',
            'quantite_totale' => 10,
            'quantite_disponible' => 8,
            'etat' => 'Bon état'
        ]);

        Materiel::create([
            'nom' => 'Imprimante',
            'categorie' => 'Informatique',
            'quantite_totale' => 5,
            'quantite_disponible' => 3,
            'etat' => 'Bon état'
        ]);

        Materiel::create([
            'nom' => 'Bureau',
            'categorie' => 'Mobilier',
            'quantite_totale' => 20,
            'quantite_disponible' => 15,
            'etat' => 'Bon état'
        ]);
    }
}
