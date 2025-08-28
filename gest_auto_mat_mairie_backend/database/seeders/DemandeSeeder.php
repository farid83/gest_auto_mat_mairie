<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Service;
use App\Models\Materiel;
use App\Models\Demande;
use App\Models\DemandeMateriel;
use Illuminate\Support\Facades\Hash;

class DemandeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer des services
        $services = [
            ['name' => 'Service Technique'],
            ['name' => 'Service Administratif'],
            ['name' => 'Service Financier'],
            ['name' => 'Service Ressources Humaines'],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        // Créer des utilisateurs
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => Hash::make('password'),
                'role' => 'Directeur',
                'service_id' => 1,
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password'),
                'role' => 'Utilisateur',
                'service_id' => 1,
            ],
            [
                'name' => 'Bob Johnson',
                'email' => 'bob@example.com',
                'password' => Hash::make('password'),
                'role' => 'Directeur',
                'service_id' => 2,
            ],
            [
                'name' => 'Alice Brown',
                'email' => 'alice@example.com',
                'password' => Hash::make('password'),
                'role' => 'Utilisateur',
                'service_id' => 2,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        // Créer des matériels
        $materiels = [
            ['nom' => 'Ordinateur portable', 'categorie' => 'Informatique', 'quantite_totale' => 10, 'quantite_disponible' => 8, 'etat' => 'Neuf'],
            ['nom' => 'Imprimante', 'categorie' => 'Informatique', 'quantite_totale' => 5, 'quantite_disponible' => 3, 'etat' => 'Bon'],
            ['nom' => 'Bureau', 'categorie' => 'Meubles', 'quantite_totale' => 20, 'quantite_disponible' => 15, 'etat' => 'Bon'],
            ['nom' => 'Chaise de bureau', 'categorie' => 'Meubles', 'quantite_totale' => 30, 'quantite_disponible' => 25, 'etat' => 'Bon'],
        ];

        foreach ($materiels as $materiel) {
            Materiel::create($materiel);
        }

        // Créer des demandes de test
        $demandes = [
            [
                'user_id' => 2, // Jane Smith
                'service_id' => 1, // Service Technique
                'directeur_id' => 1, // John Doe
                'status' => 'en_attente',
            ],
            [
                'user_id' => 4, // Alice Brown
                'service_id' => 2, // Service Administratif
                'directeur_id' => 3, // Bob Johnson
                'status' => 'validee',
                'date_validation_directeur' => now(),
            ],
        ];

        foreach ($demandes as $demande) {
            $demandeModel = Demande::create($demande);
            
            // Ajouter des matériels à la demande
            if ($demandeModel->id === 1) {
                DemandeMateriel::create([
                    'demande_id' => $demandeModel->id,
                    'materiel_id' => 1,
                    'quantite_demandee' => 2,
                    'quantite_validee' => null,
                    'justification' => 'Pour les nouveaux développeurs',
                ]);
                
                DemandeMateriel::create([
                    'demande_id' => $demandeModel->id,
                    'materiel_id' => 2,
                    'quantite_demandee' => 1,
                    'quantite_validee' => null,
                    'justification' => 'Pour le secrétariat',
                ]);
            } elseif ($demandeModel->id === 2) {
                DemandeMateriel::create([
                    'demande_id' => $demandeModel->id,
                    'materiel_id' => 3,
                    'quantite_demandee' => 3,
                    'quantite_validee' => 3,
                    'justification' => 'Pour les nouveaux agents',
                ]);
            }
        }
    }
}