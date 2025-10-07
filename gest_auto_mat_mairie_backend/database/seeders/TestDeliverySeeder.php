<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Demande;
use App\Models\DemandeMateriel;
use App\Models\Materiel;
use App\Models\Livraison;
use App\Models\Service;
use Illuminate\Support\Facades\Hash;

class TestDeliverySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un service si nécessaire
        $service = Service::first() ?? Service::create([
            'nom' => 'Service Test',
            'description' => 'Service de test pour les livraisons'
        ]);

        // Créer un utilisateur secretaire_executif
        $secretaire = User::where('role', 'secretaire_executif')->first();
        if (!$secretaire) {
            $secretaire = User::create([
                'name' => 'Secrétaire Exécutif Test',
                'email' => 'secretaire@test.com',
                'password' => Hash::make('password'),
                'role' => 'secretaire_executif',
                'service_id' => $service->id
            ]);
        }

        // Créer un utilisateur gestionnaire_stock
        $gestionnaire = User::where('role', 'gestionnaire_stock')->first();
        if (!$gestionnaire) {
            $gestionnaire = User::create([
                'name' => 'Gestionnaire Stock Test',
                'email' => 'gestionnaire@test.com',
                'password' => Hash::make('password'),
                'role' => 'gestionnaire_stock',
                'service_id' => $service->id
            ]);
        }

        // Créer un utilisateur daaf
        $daaf = User::where('role', 'daaf')->first();
        if (!$daaf) {
            $daaf = User::create([
                'name' => 'DAAF Test',
                'email' => 'daaf@test.com',
                'password' => Hash::make('password'),
                'role' => 'daaf',
                'service_id' => $service->id
            ]);
        }

        // Créer un matériel
        $materiel = Materiel::first() ?? Materiel::create([
            'nom' => 'Ordinateur portable',
            'quantite_disponible' => 10,
            'unite' => 'pièce',
            'description' => 'Ordinateur portable de test'
        ]);

        // Créer un utilisateur directeur
        $directeur = User::where('role', 'directeur')->first();
        if (!$directeur) {
            $directeur = User::create([
                'name' => 'Directeur Test',
                'email' => 'directeur@test.com',
                'password' => Hash::make('password'),
                'role' => 'directeur',
                'service_id' => $service->id
            ]);
        }

        // Créer une demande
        $demande = Demande::create([
            'user_id' => $secretaire->id,
            'service_id' => $service->id,
            'status' => 'en_attente_secretaire',
            'directeur_id' => $directeur->id,
            'secretaire_id' => $secretaire->id,
            'gestionnaire_id' => $gestionnaire->id,
            'daaf_id' => $daaf->id,
            'commentaire_secretaire' => 'Demande de test pour livraison'
        ]);

        // Créer une demande de matériel
        $demandeMateriel = DemandeMateriel::create([
            'demande_id' => $demande->id,
            'materiel_id' => $materiel->id,
            'quantite_demandee' => 2,
            'quantite_proposee_gestionnaire' => 2,
            'quantite_validee_daaf' => 2,
            'quantite_validee' => 2,
            'status' => 'validee',
            'justification' => 'Test de livraison'
        ]);

        // Mettre à jour la demande pour la passer en statut livraison
        $demande->status = 'livraison';
        $demande->save();

        // Créer une livraison
        $livraison = Livraison::create([
            'demande_id' => $demande->id,
            'user_id' => $secretaire->id,
            'statut' => 'en_cours',
            'commentaire' => 'Livraison de test'
        ]);

        // Associer les matériels à la livraison
        $livraison->materiels()->attach($materiel->id, [
            'quantite_livree' => 2,
            'quantite_demandee' => 2,
        ]);

        // Déduire le stock
        $materiel->quantite_disponible -= 2;
        $materiel->save();

        $this->command->info('Données de test créées avec succès!');
        $this->command->info("Demande ID: {$demande->id}");
        $this->command->info("Livraison ID: {$livraison->id}");
        $this->command->info("Matériel: {$materiel->nom} (Stock restant: {$materiel->quantite_disponible})");
    }
}
