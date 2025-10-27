<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Materiel;
use App\Models\User;

class MouvementStock extends Model
{
    //
    use HasFactory;
    protected $table = 'mouvement_stocks'; 

    protected $fillable = [
       'type',
        'materiel_id', 
        'quantity',
        'user_id', 
        'date', 
    ];

    public function materiel()
    {
        return $this->belongsTo(Materiel::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    
}
