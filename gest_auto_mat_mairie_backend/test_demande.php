<?php
require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

// Configuration de la connexion à la base de données
$dbConfig = require __DIR__ . '/config/database.php';

$db = new DB;
$db->addConnection($dbConfig['connections']['mysql']);
$db->setAsGlobal();
$db->bootEloquent();

echo "=== TEST DE DÉBOGAGE DE LA BASE DE DONNÉES ===\n\n";

// 1. Vérifier les services
echo "1. Services dans la base de données:\n";
$services = \App\Models\Service::all();
foreach ($services as $service) {
    echo "  - ID: {$service->id}, Nom: {$service->name}\n";
}
echo "\n";

// 2. Vérifier les utilisateurs
echo "2. Utilisateurs dans la base de données:\n";
$users = \App\Models\User::all();
foreach ($users as $user) {
    echo "  - ID: {$user->id}, Email: {$user->email}, Rôle: {$user->role}, Service ID: {$user->service_id}\n";
}
echo "\n";

// 3. Vérifier les matériels
echo "3. Matériels dans la base de données:\n";
$materiels = \App\Models\Materiel::all();
foreach ($materiels as $materiel) {
    echo "  - ID: {$materiel->id}, Nom: {$materiel->nom}, Catégorie: {$materiel->categorie}\n";
}
echo "\n";

// 4. Vérifier les demandes existantes
echo "4. Demandes existantes:\n";
$demandes = \App\Models\Demande::all();
foreach ($demandes as $demande) {
    echo "  - ID: {$demande->id}, User ID: {$demande->user_id}, Service ID: {$demande->service_id}, Directeur ID: {$demande->directeur_id}, Status: {$demande->status}\n";
}
echo "\n";

// 5. Vérifier les relations
echo "5. Relations testées:\n";

// Test de la relation User->Service
$user = \App\Models\User::find(1);
if ($user) {
    echo "  - Utilisateur 1 a un service: " . ($user->service ? 'Oui (' . $user->service->name . ')' : 'Non') . "\n";
} else {
    echo "  - Utilisateur 1 non trouvé\n";
}

// Test de la recherche de directeur
$service = \App\Models\Service::find(1);
if ($service) {
    $directeur = \App\Models\User::where('service_id', $service->id)->where('role', 'Directeur')->first();
    echo "  - Directeur pour le service 1: " . ($directeur ? 'Oui (' . $directeur->email . ')' : 'Non') . "\n";
} else {
    echo "  - Service 1 non trouvé\n";
}

// Test de la recherche de matériel
$materiel = \App\Models\Materiel::where('nom', 'Ordinateur portable')->first();
echo "  - Matériel 'Ordinateur portable': " . ($materiel ? 'Oui (ID: ' . $materiel->id . ')' : 'Non') . "\n";

echo "\n=== FIN DU TEST ===\n";