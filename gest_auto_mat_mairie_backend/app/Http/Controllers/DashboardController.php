<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Materiel;
class DashboardController extends Controller
{ 
    public function getStats()
    {
        
        // Compter le nombre total de matériels
        $materials_total = Materiel::count();

        // Compter le nombre de matériels avec un stock faible (par exemple, quantité disponible < 10)
        $materials_low_stock = Materiel::where('quantite_disponible', '<', 5)->count();// Compter le nombre de matériels en stock

        // Compter le nombre total de demandes (à implémenter selon votre logique)
        $requests_total = 0; // À remplacer par le vrai comptage

        // Compter le nombre de demandes en attente (à implémenter selon votre logique)
        $requests_pending = 0; // À remplacer par le vrai comptage
        
        // Compter le nombre de validations en attente (à implémenter selon votre logique)
        $pending_validations = 0; // À remplacer par le vrai comptage
        
        // Compter le nombre de notifications non lues (à implémenter selon votre logique)
        $notifications_unread = 0; // À remplacer par le vrai comptage

        return response()->json([
            'requests_total' => $requests_total,
            'requests_pending' => $requests_pending,
            'materials_total' => $materials_total,
            'materials_low_stock' => $materials_low_stock,
            'pending_validations' => $pending_validations,
            'notifications_unread' => $notifications_unread
        ]);


        // return response()->json([
        //     'users' => 42,
        //     'sessions' => 197,
        //     'errors' => 3,
        //     'uptime' => '99.9%'
        // ]);

    }
}
