<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Demande;
use App\Models\User;
use App\Models\Materiel;

class Livraison extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'user_id',
        'statut',
        'date_livraison',
        'commentaire',
    ];

    /**
     * Une livraison appartient à une demande
     */
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    /**
     * Une livraison appartient à un utilisateur (le livreur)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Une livraison concerne plusieurs matériels
     */
    public function materiels()
    {
        return $this->belongsToMany(Materiel::class, 'livraison_materiel')
                    ->withPivot('quantite_livree', 'quantite_demandee')
                    ->withTimestamps();
    }

    /**
     * Caster les dates
     */
    protected $casts = [
        'date_livraison' => 'datetime',
    ];
}
