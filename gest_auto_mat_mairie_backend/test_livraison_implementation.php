<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Demande;
use App\Models\DemandeMateriel;
use App\Models\Materiel;
use App\Models\Livraison;
use App\Models\MouvementStock;

echo "=== Test de l'implémentation de la livraison ===\n\n";

// 1. Vérifier que les migrations sont correctes
echo "1. Vérification de la structure de la base de données...\n";

try {
    $tables = DB::select("SHOW TABLES");
    $tableNames = array_column($tables, 'Tables_in_' . env('DB_DATABASE'));
    
    if (in_array('livraisons', $tableNames)) {
        echo "✅ Table 'livraisons' existe\n";
    } else {
        echo "❌ Table 'livraisons' manquante\n";
    }
    
    if (in_array('livraison_materiels', $tableNames)) {
        echo "✅ Table 'livraison_materiels' existe\n";
    } else {
        echo "❌ Table 'livraison_materiels' manquante\n";
    }
    
    // Vérifier la structure de la table demandes
    $columns = DB::select("SHOW COLUMNS FROM demandes WHERE Field = 'status'");
    if (!empty($columns)) {
        $statusColumn = $columns[0];
        if (strpos($statusColumn->Type, 'livraison') !== false) {
            echo "✅ Colonne 'status' dans demandes contient 'livraison'\n";
        } else {
            echo "❌ Colonne 'status' dans demandes ne contient pas 'livraison'\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur lors de la vérification de la base de données: " . $e->getMessage() . "\n";
}

echo "\n";

// 2. Vérifier les modèles
echo "2. Vérification des modèles...\n";

try {
    // Vérifier le modèle Livraison
    if (class_exists('App\Models\Livraison')) {
        $livraison = new Livraison();
        $methods = get_class_methods($livraison);
        
        if (in_array('demande', $methods)) {
            echo "✅ Modèle Livraison: méthode 'demande' existe\n";
        } else {
            echo "❌ Modèle Livraison: méthode 'demande' manquante\n";
        }
        
        if (in_array('user', $methods)) {
            echo "✅ Modèle Livraison: méthode 'user' existe\n";
        } else {
            echo "❌ Modèle Livraison: méthode 'user' manquante\n";
        }
        
        if (in_array('materiels', $methods)) {
            echo "✅ Modèle Livraison: méthode 'materiels' existe\n";
        } else {
            echo "❌ Modèle Livraison: méthode 'materiels' manquante\n";
        }
    } else {
        echo "❌ Modèle Livraison non trouvé\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur lors de la vérification des modèles: " . $e->getMessage() . "\n";
}

echo "\n";

// 3. Vérifier les routes
echo "3. Vérification des routes...\n";

$routes = [
    'POST /demande-materiels/{id}/secretaire-executif-validate' => 'validateBySecretaireExecutif',
    'GET /demande-materiels/ready-to-deliver' => 'getReadyToDeliver',
    'GET /livraisons' => 'index',
    'POST /livraisons' => 'store',
    'GET /livraisons/{id}' => 'show',
    'PUT /livraisons/{id}' => 'update',
    'DELETE /livraisons/{id}' => 'destroy',
    'POST /livraisons/{id}/mark-delivered' => 'markAsDelivered',
];

try {
    $routeFile = __DIR__ . '/routes/api.php';
    $routeContent = file_get_contents($routeFile);
    
    foreach ($routes as $route => $method) {
        if (strpos($routeContent, $route) !== false) {
            echo "✅ Route $route existe\n";
        } else {
            echo "❌ Route $route manquante\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur lors de la vérification des routes: " . $e->getMessage() . "\n";
}

echo "\n";

// 4. Vérifier les méthodes du contrôleur
echo "4. Vérification des méthodes du contrôleur DemandeMaterielController...\n";

$controllerFile = __DIR__ . '/app/Http/Controllers/Api/DemandeMaterielController.php';
$controllerContent = file_get_contents($controllerFile);

$methods = [
    'validateBySecretaireExecutif' => 'Validation finale par secrétaire_exécutif',
    'getReadyToDeliver' => 'Récupérer les demandes prêtes à livrer',
];

foreach ($methods as $method => $description) {
    if (strpos($controllerContent, "public function $method") !== false) {
        echo "✅ Méthode $method: $description\n";
    } else {
        echo "❌ Méthode $method manquante: $description\n";
    }
}

echo "\n";

// 5. Vérifier le contrôleur LivraisonController
echo "5. Vérification des méthodes du contrôleur LivraisonController...\n";

$livraisonControllerFile = __DIR__ . '/app/Http/Controllers/Api/LivraisonController.php';
$livraisonControllerContent = file_get_contents($livraisonControllerFile);

$livraisonMethods = [
    'index' => 'Lister les livraisons',
    'store' => 'Créer une livraison',
    'show' => 'Afficher une livraison',
    'update' => 'Mettre à jour une livraison',
    'destroy' => 'Supprimer une livraison',
    'markAsDelivered' => 'Marquer une livraison comme livrée',
];

foreach ($livraisonMethods as $method => $description) {
    if (strpos($livraisonControllerContent, "public function $method") !== false) {
        echo "✅ Méthode $method: $description\n";
    } else {
        echo "❌ Méthode $method manquante: $description\n";
    }
}

echo "\n";

// 6. Vérifier la logique de validation
echo "6. Vérification de la logique de validation finale...\n";

$validationLogic = [
    "demande->status = 'livraison'" => "Changement de statut vers livraison",
    "quantite_validee = quantite_validee_daaf" => "Utilisation des quantités DAAF",
    "MouvementStock::create" => "Création mouvement de stock",
    "materiel->quantite_disponible -= " => "Déduction du stock",
    "Livraison::create" => "Création de la livraison",
];

foreach ($validationLogic as $code => $description) {
    if (strpos($controllerContent, $code) !== false) {
        echo "✅ Logique: $description\n";
    } else {
        echo "❌ Logique manquante: $description\n";
    }
}

echo "\n=== Fin du test ===\n";