<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;
use App\Models\Demande;

class LivraisonReadyNotification extends Notification
{
    use Queueable;

    protected $demande;
    protected $secretaireName;

    /**
     * Create a new notification instance.
     */
    public function __construct(Demande $demande, string $secretaireName)
    {
        $this->demande = $demande;
        $this->secretaireName = $secretaireName;
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
        return (new MailMessage)
            ->line('Nouvelle demande prête à être livrée')
            ->line($this->secretaireName . ' (secrétaire exécutif) a validé la demande.')
            ->line('Numéro de demande : ' . $this->demande->id)
            ->line('Date de validation finale : ' . now()->format('d/m/Y H:i'))
            ->line('Service demandeur : ' . ($this->demande->service->nom ?? 'Service inconnu'))
            ->action('Voir la demande', url('/requests'))
            ->line('Vous pouvez maintenant procéder à la livraison.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'demande_id' => $this->demande->id,
            'secretaire_name' => $this->secretaireName,
            'message' => 'Le secrétaire exécutif a validé la demande. Vous pouvez maintenant procéder à la livraison.',
            'service_demandeur' => $this->demande->service->nom ?? 'Service inconnu',
            'created_at' => now()->format('d/m/Y H:i'),
            'url' => url('/requests')
        ];
    }
}