<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Materiel;
class MouvementStock extends Model
{
    //
    use HasFactory;
    protected $table = 'mouvement_stocks'; // Assurez-vous que le nom de la table est correct

    protected $fillable = [
       'type', // type de mouvement (Entrée ou Sortie)
        'materiel_id', // référence au matériel
        'quantity', // quantité de matériel
        'user_id',     // responsable du mouvement
        'date', 
    ];

    public function materiel()
    {
        return $this->belongsTo(Materiel::class);
    }

    

}
