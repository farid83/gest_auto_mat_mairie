<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;
use App\Models\Demande;

class DemandeValideeNotification extends Notification
{
    use Queueable;

    protected $demande;
    protected $directeurName;
    protected $role;

    /**
     * Create a new notification instance.
     */
    public function __construct(Demande $demande, string $directeurName, string $role)
    {
        $this->demande = $demande;
        $this->directeurName = $directeurName;
        $this->role = $role;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $roleText = ($this->role === 'directeur') ? 'directeur' :
                    (($this->role === 'gestionnaire_stock') ? 'gestionnaire de stock' :
                    (($this->role === 'daaf') ? 'DAAF' : 'secrétaire exécutif'));
        
        return (new MailMessage)
            ->line('Votre demande de matériel a été validée')
            ->line($this->directeurName . ' (en tant que ' . $roleText . ') a validé votre demande.')
            ->line('Numéro de demande : ' . $this->demande->id)
            ->line('Date de validation : ' . now()->format('d/m/Y H:i'))
            ->action('Voir ma demande', url('/requests'))
            ->line('Merci de votre confiance.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $roleText = ($this->role === 'directeur') ? 'directeur' :
                    (($this->role === 'gestionnaire_stock') ? 'gestionnaire de stock' :
                    (($this->role === 'daaf') ? 'DAAF' : 'secrétaire exécutif'));
        
        return [
            'demande_id' => $this->demande->id,
            'directeur_name' => $this->directeurName,
            'role' => $roleText,
            'message' => $this->directeurName . ' (en tant que ' . $roleText . ') a validé votre demande',
            'created_at' => now()->format('d/m/Y H:i'),
            'url' => url('/requests')
        ];
    }
 
        

}