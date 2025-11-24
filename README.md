# Gestion Automatisée de Matériel de Mairie

## 📌 Statut du projet
⚠️ **Le projet est actuellement en phase de conception** - Les fonctionnalités sont en cours de développement et peuvent être modifiées sans préavis.

## 📋 Description du projet

Ce projet vise à développer une solution de gestion automatisée du matériel pour les mairies. L'application permet de gérer les stocks de matériel, les demandes d'approvisionnement, et le suivi des mouvements de stock de manière centralisée et efficace.

## 🏗️ Architecture du projet

Le projet est divisé en deux parties principales :

### Backend (Laravel)
- **Framework**: Laravel 10+
- **Base de données**: MySQL/PostgreSQL
- **Authentification**: Laravel Sanctum
- **API**: RESTful API
- **Localisation**: `gest_auto_mat_mairie_backend/`

### Frontend (React)
- **Framework**: React 18+
- **Gestion d'état**: Context API
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS
- **Localisation**: `frontend/`

## 🚀 Fonctionnalités principales

### Gestion des utilisateurs
- Rôles multiples (Utilisateur, Directeur, Administrateur, ....)
- Système d'authentification sécurisé
- Gestion des services et directions

### Gestion du matériel
- Création et modification des fiches matériel
- Suivi des stocks en temps réel
- Historique des demandes, des mouvements de stock

### Système de demandes
- Création de demandes de matériel par les utilisateurs
- Workflow de validation par les directeurs, daaf, gestionnaire de stocks communément appelé Comptable matière, sécretaire exécutif
- Suivi de l'état des demandes (en attente, validée, rejetée)

### Gestion des stocks
- Mouvements de stock (entrées, sorties)
- Alertes de stock bas
- Rapports et statistiques

## 🔧 Configuration requise

### Prérequis système
- PHP 8.1+
- Node.js 16+
- Composer
- MySQL 8.0+ ou PostgreSQL 13+
- NPM ou Yarn

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://votre-repo/gest_auto_mat_mairie.git
   cd gest_auto_mat_mairie
   ```

2. **Configuration du backend**
   ```bash
   cd gest_auto_mat_mairie_backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   ```

3. **Configuration du frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

4. **Lancer les serveurs**
   ```bash
   # Backend
   cd ../gest_auto_mat_mairie_backend
   php artisan serve

   # Frontend
   cd ../frontend
   npm start
   ```

## 📊 Structure de la base de données

### Tables principales
- `users` - Utilisateurs du système
- `services` - Services de la mairie
- `directions` - Directions organisationnelles
- `materiels` - Fiches de matériel
- `demandes` - Demandes de matériel
- `demande_materiels` - Détails des demandes
- `mouvement_stocks` - Historique des mouvements
- `notifications` - Système de notifications (retiré)

### Relations
- Un service appartient à une direction
- Un service a plusieurs utilisateurs
- Un matériel peut être dans plusieurs demandes
- Une demande peut concerner plusieurs matériels

## 🔐 Sécurité

### Mesures de sécurité implémentées
- Authentification par tokens Sanctum
- Protection CSRF
- Gestion sécurisée des sessions
- Validation des entrées utilisateur
- Chiffrement des mots de passe

### Gestion des sessions
- Déconnexion automatique après 10 minutes d'inactivité
- Avertissement 1 minute avant la déconnexion
- Nettoyage automatique des sessions à la fermeture de page

## 📱 Interface utilisateur

### Fonctionnalités UX/UI
- Design responsive pour tous les appareils
- Tableaux de bord interactifs
- Système de notifications en temps réel
- Indicateurs visuels pour l'état des demandes
- Session management avec compte à rebours

## 🧪 Tests

### Tests disponibles
- Tests unitaires pour les modèles et contrôleurs
- Tests d'intégration pour les API
- Tests de composants React
- Tests de session management

### Exécution des tests
```bash
# Backend
cd gest_auto_mat_mairie_backend
php artisan test

# Frontend
cd frontend
npm test
```

## 📈 Déploiement

### Configuration de déploiement
- Support Docker
- Configuration pour Netlify (frontend)
- Configuration pour Render (backend)
- Scripts de build automatisés

### Variables d'environnement
Voir les fichiers `.env.example` dans chaque dossier pour la liste complète des variables requises.

## 🤝 Contribuer

### Processus de contribution
1. Forker le dépôt
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committer vos changements (`git commit -am 'Ajoute une nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### Normes de codage
- Suivre les PSR-12 pour le PHP
- Utiliser ESLint et Prettier pour le JavaScript/React
- Écrire des tests pour les nouvelles fonctionnalités
- Documenter le code

## 📚 Documentation

### Documentation existante
- [Fonctionnalité de Demande de Matériel](gest_auto_mat_mairie_backend/README_DEMANDES.md)
- [Gestion de la Session](frontend/src/README_SESSION_MANAGEMENT.md)
- [Documentation React](frontend/README.md)

## 🐛 Rapporter des bugs

Pour rapporter un bug, veuillez utiliser le système de suivi des issues du dépôt GitHub en fournissant :
- Une description claire du problème
- Les étapes pour reproduire
- L'environnement (OS, navigateur, version)
- Les journaux d'erreurs si disponibles

## 📞 Support

Pour toute question ou support :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 📄 Licence


## 🔄 Mises à jour

### Version actuelle
- Version : 0.1.0 (Développement)
- Dernière mise à jour : 19/11/2025

### Prochaines étapes
- Finalisation de l'interface utilisateur en personnalisant les couleurs et le logo
- Implémentation des notifications par email
- Développement des rapports avancés
- Optimisation des performances

---

**Remarque**: Ce projet est en cours de développement. Les fonctionnalités et la documentation peuvent être modifiées sans préavis.