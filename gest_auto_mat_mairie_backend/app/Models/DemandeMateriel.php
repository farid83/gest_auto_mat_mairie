<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Demande;
use App\Models\Materiel;

class DemandeMateriel extends Model
{
    //
    protected $fillable = [
        'demande_id',
        'materiel_id',
        'quantite_demandee',
        'quantite_validee',
        'justification'
    ];

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    public function materiel()
    {
        return $this->belongsTo(Materiel::class, 'materiel_id');
    }
}
