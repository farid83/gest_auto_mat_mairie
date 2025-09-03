<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;
use App\Models\Demande;

class NewDemandeNotification extends Notification
{
    use Queueable;

    protected $demande;
    protected $userName;

    /**
     * Create a new notification instance.
     */
    public function __construct(Demande $demande, string $userName)
    {
        $this->demande = $demande;
        $this->userName = $userName;
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
            ->line('Nouvelle demande de matériel')
            ->line($this->userName . ' vient de faire une demande de matériel.')
            ->line('Numéro de demande : ' . $this->demande->id)
            ->line('Date : ' . $this->demande->created_at->format('d/m/Y H:i'))
            ->action('Voir la demande', url('/requests/validation'))
            ->line('Merci de valider cette demande dès que possible.');
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
            'user_name' => $this->userName,
            'message' => $this->userName . ' vient de faire une demande de matériel',
            'created_at' => $this->demande->created_at->format('d/m/Y H:i'),
            'url' => url('/requests/validation')
        ];
    }
}
