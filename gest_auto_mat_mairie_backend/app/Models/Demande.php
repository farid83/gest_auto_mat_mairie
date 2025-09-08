<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use App\Models\DemandeMateriel;
use App\Models\User;
use App\Models\Service;


class Demande extends Model
{
     protected $fillable = [
        'user_id',
        'service_id',
        'directeur_id',
        'status',
        'commentaire',
        'date_validation_directeur'
    ];

    // Avant de créer une demande, on attribue automatiquement le directeur
    protected static function booted()
    {
        static::creating(function ($demande) {
            // Récupère l'utilisateur qui crée la demande
            $user = Auth::user();

            if ($user) {
                $demande->user_id = $user->id;

                // Trouve le directeur de son service
                $directeur = User::where('service_id', $user->service_id)
                                 ->where('role', 'directeur')
                                 ->first();

                if ($directeur) {
                    $demande->directeur_id = $directeur->id;
                } else {
                    // Si pas de directeur, on peut mettre null ou gérer une exception
                    $demande->directeur_id = null;
                }
            }
        });
    }

     // Une demande a plusieurs matériels
    public function materiels(): HasMany
    {
        return $this->hasMany(DemandeMateriel::class);
    }

    // Une demande appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Une demande appartient à un service via l'utilisateur
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // Récupérer le gestionnaire du service
public function gestionnaire()
{
    return $this->belongsTo(User::class, 'gestionnaire_id');
}

// Récupérer le DAAF

public function daaf()
{
    return $this->belongsTo(User::class, 'daaf_id');
}

// Récupérer le secrétaire

public function secretaire()
{
    return $this->belongsTo(User::class, 'secretaire_id');
}

// (optionnel) caster les dates
protected $casts = [
    'date_validation_directeur' => 'datetime',
    'date_validation_gestionnaire' => 'datetime',
    'date_validation_daaf' => 'datetime',
    'date_validation_secretaire' => 'datetime',
];



}
