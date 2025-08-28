# Fonctionnalité de Demande de Matériel

## Description

Cette fonctionnalité permet aux utilisateurs de faire des demandes de matériel qui sont automatiquement envoyées aux directeurs de leurs services respectifs pour validation.

## Fonctionnement

### Pour les utilisateurs standards :
1. Un utilisateur peut créer une demande de matériel via la page "Nouvelle demande"
2. La demande est automatiquement envoyée au directeur de son service
3. L'utilisateur peut voir l'état de ses demandes dans la page "Mes demandes"
4. Les directeurs ne peuvent pas faire de demandes (ils sont responsables de la validation)

### Pour les directeurs :
1. Les directeurs reçoivent automatiquement les demandes des utilisateurs de leur service
2. Ils peuvent valider ou rejeter les demandes via la page "Demandes à valider"
3. Ils peuvent ajouter des commentaires aux demandes
4. Une fois validée, la demande apparaît comme "Validée" pour l'utilisateur

## Structure de la base de données

### Tables créées :
- `demandes` : Informations générales sur les demandes
- `demande_materiels` : Détails des matériels demandés

### Relations :
- `users` (1:N) `demandes` : Un utilisateur peut faire plusieurs demandes
- `services` (1:N) `demandes` : Un service peut avoir plusieurs demandes
- `users` (1:N) `demandes` (en tant que directeur) : Un directeur peut valider plusieurs demandes
- `demandes` (1:N) `demande_materiels` : Une demande peut concerner plusieurs matériels
- `materiels` (1:N) `demande_materiels` : Un matériel peut être demandé dans plusieurs demandes

## États possibles d'une demande :
- `en_attente` : La demande a été envoyée et attend la validation du directeur
- `validee` : La demande a été validée par le directeur
- `rejetee` : La demande a été rejetée par le directeur

## API Endpoints

### Demandes
- `GET /api/demandes` - Lister les demandes (selon le rôle)
- `POST /api/demandes` - Créer une nouvelle demande
- `GET /api/demandes/{id}` - Voir une demande spécifique
- `POST /api/demandes/{id}/valider` - Valider ou rejeter une demande (directeurs uniquement)

## Données de test

Le seeder `DemandeSeeder` crée des données de test :
- 4 services (Service Technique, Service Administratif, Service Financier, Service RH)
- 4 utilisateurs (2 directeurs, 2 utilisateurs standards)
- 4 types de matériel
- 2 demandes de test (1 en attente, 1 validée)

## Utilisation

### Pour exécuter les migrations et les seeders :
```bash
php artisan migrate
php artisan db:seed --class=DemandeSeeder
```

### Pour tester :
1. Connectez-vous en tant qu'utilisateur standard (ex: jane@example.com / password)
2. Créez une demande de matériel
3. Connectez-vous en tant que directeur (ex: john@example.com / password)
4. Validez la demande dans la page "Demandes à valider"

## Points d'amélioration possibles
- Notifications automatiques par email aux directeurs
- Historique des validations
- Statistiques sur les demandes
- Workflow de validation plus complexe avec plusieurs étapes