<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materiel extends Model
{
    use HasFactory;
    protected $table = 'materiels';

    protected $fillable = [
        'nom',
        'categorie',
        'quantite_totale',
        'quantite_disponible',
        'etat',

    ];

    protected static function booted()
    {
        static::creating(function ($materiel) {
            $materiel->quantite_disponible = $materiel->quantite_totale;
        });
    }
}
