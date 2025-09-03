<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Materiel;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        
        // Compter le nombre total de matériels
        $materials_total = Materiel::count();

        // Compter le nombre de matériels avec un stock faible (par exemple, quantité disponible < 10)
        $materials_low_stock = Materiel::where('quantite_disponible', '<', 5)->count();

        // Compter le nombre total de demandes
        $requests_total = Demande::count();

        // Compter le nombre de demandes en attente
        $requests_pending = Demande::where('status', 'en_attente')->count();
        
        // Compter le nombre de validations en attente (pour les directeurs)
        $pending_validations = 0;
        if ($user && in_array($user->role, ['directeur', 'daaf', 'secretaire_executif'])) {
            $pending_validations = Demande::where('status', 'en_attente')
                                          ->where('directeur_id', $user->id)
                                          ->count();
        }
        
        // Compter le nombre de demandes de l'utilisateur connecté
        $user_requests_total = 0;
        $user_requests_pending = 0;
        if ($user) {
            $user_requests_total = Demande::where('user_id', $user->id)->count();
            $user_requests_pending = Demande::where('user_id', $user->id)
                                           ->where('status', 'en_attente')
                                           ->count();
        }

        // Compter le nombre de notifications non lues
        $notifications_unread = 0;
        if ($user) {
            $notifications_unread = $user->unreadNotifications()->count();
        }

        return response()->json([
            'requests_total' => $requests_total,
            'requests_pending' => $requests_pending,
            'materials_total' => $materials_total,
            'materials_low_stock' => $materials_low_stock,
            'pending_validations' => $pending_validations,
            'notifications_unread' => $notifications_unread,
            'user_requests_total' => $user_requests_total,
            'user_requests_pending' => $user_requests_pending
        ]);
    }
}
