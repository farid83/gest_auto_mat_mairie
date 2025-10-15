<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Materiel;
use App\Models\User; // <-- ajouté

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

    // Ajout de la relation user() utilisée par le contrôleur
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    
}
