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
        'date_validation_directeur',
        'gestionnaire_id',
        'date_validation_gestionnaire',
        'daaf_id',
        'date_validation_daaf',
        'secretaire_id',
        'date_validation_secretaire',
        


    ];
    public function materiels(): HasMany
    {
        return $this->hasMany(DemandeMateriel::class);
        
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

public function gestionnaire()
{
    return $this->belongsTo(User::class, 'gestionnaire_id');
}

public function daaf()
{
    return $this->belongsTo(User::class, 'daaf_id');
}

public function secretaire()
{
    return $this->belongsTo(User::class, 'secretaire_id');
}

protected $casts = [
    'date_validation_directeur' => 'datetime',
    'date_validation_gestionnaire' => 'datetime',
    'date_validation_daaf' => 'datetime',
    'date_validation_secretaire' => 'datetime',
];




}
