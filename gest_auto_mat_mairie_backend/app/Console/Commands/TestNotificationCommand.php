<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Demande;
use App\Notifications\DemandeValideeNotification;

class TestNotificationCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:test-notification';

    /**
     * The console command description.
     */
    protected $description = 'Test l\'envoi de notification de validation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Test de notification de validation...');
        
        // Trouver un utilisateur existant
        $user = User::first();
        if (!$user) {
            $this->error('Aucun utilisateur trouvé dans la base de données');
            return 1;
        }
        
        // Créer une demande de test en utilisant le create pour déclencher le booted event
        $demande = Demande::create([
            'user_id' => $user->id,
            'service_id' => $user->service_id,
            'status' => 'en_attente',
            'commentaire' => 'Demande de test',
            'directeur_id' => $user->service_id ? User::where('service_id', $user->service_id)->where('role', 'directeur')->first()->id : null
        ]);
        
        $this->info("Utilisateur trouvé: {$user->name}");
        $this->info("Demande créée: {$demande->id}");
        
        try {
            // Envoyer la notification
            $user->notify(new DemandeValideeNotification($demande, 'Directeur Test', 'directeur'));
            
            $this->info('Notification envoyée avec succès !');
            $this->info('Vérifiez les logs pour voir si la notification a été traitée.');
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Erreur lors de l'envoi de notification: {$e->getMessage()}");
            return 1;
        }
    }
}