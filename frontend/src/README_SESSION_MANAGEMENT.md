# Gestion de la Déconnexion Automatique

## Vue d'ensemble

Ce projet implémente un système de déconnexion automatique après 10 minutes d'inactivité de l'utilisateur. Le système est conçu pour garantir la sécurité des données tout en offrant une expérience utilisateur conviviale.

## Fonctionnalités

### 1. Déconnexion automatique après inactivité
- **Temps d'inactivité**: 10 minutes
- **Avertissement**: L'utilisateur est averti 1 minute avant la déconnexion
- **Événements d'activité**: 
  - Mouvement de souris
  - Clics
  - Frappes au clavier
  - Défilement
  - Touches tactiles (pour les appareils mobiles)

### 2. Indicateur de session
- **Compte à rebours visible**: Affiche le temps restant avant la déconnexion
- **Notification toast**: Avertissement 1 minute avant la déconnexion
- **Options de prolongation**: L'utilisateur peut prolonger sa session ou se déconnecter

### 3. Gestion de la fermeture de page
- **Nettoyage automatique**: Les données de session sont supprimées lorsque l'utilisateur ferme ou rafraîchit la page
- **Protection contre les sessions orphelines**: Aucune session active n'est laissée ouverte

## Architecture technique

### Frontend (React)

#### Contexte d'authentification (`AuthContext.jsx`)
- Gère l'état de connexion de l'utilisateur
- Implémente le timer d'inactivité
- Déclenche les événements d'avertissement de session

#### Composants
- **`SessionTimer.jsx`**: Affiche un indicateur visuel du temps restant
- **`SessionWarning.jsx`**: Gère les notifications d'avertissement de session

#### Hooks personnalisés
- **`useSessionWarning.js`**: Fournit des fonctions pour gérer les états d'avertissement

#### Écouteurs d'événements
- Surveille les activités utilisateur pour réinitialiser le timer
- Déclenche des événements personnalisés pour les notifications

### Backend (Laravel)

#### Configuration
- **Driver de session**: File (pour de meilleures performances)
- **Durée de vie des sessions**: 120 minutes (2 heures)
- **Sanctum**: Utilisé pour l'authentification API avec des tokens non expirants

#### Routes protégées
- Toutes les routes API sont protégées par `auth:sanctum`
- La déconnexion est gérée via `/api/auth/logout`

## Flux de travail

### 1. Connexion de l'utilisateur
1. L'utilisateur se connecte avec succès
2. Un token Sanctum est généré et stocké
3. Les données utilisateur sont stockées dans le localStorage
4. Le timer d'inactivité est démarré

### 2. Surveillance de l'activité
1. Le système écoute les événements d'activité utilisateur
2. À chaque événement, le timer est réinitialisé
3. Si aucune activité n'est détectée pendant 10 minutes, la déconnexion est déclenchée

### 3. Avertissement de session
1. Après 9 minutes d'inactivité, un avertissement est affiché
2. L'utilisateur voit un toast avec un compte à rebours
3. L'utilisateur peut choisir de prolonger sa session ou de se déconnecter

### 4. Déconnexion
1. Si l'utilisateur ne prolonge pas sa session, il est déconnecté après 10 minutes
2. Les données de session sont supprimées du localStorage
3. L'utilisateur est redirigé vers la page de connexion

## Sécurité

### Mesures de sécurité
- **Tokens Sanctum**: Tokens d'API sécurisés avec expiration configurable
- **Nettoyage automatique**: Suppression des données sensibles lors de la fermeture de page
- **Validation CSRF**: Protection contre les attaques CSRF
- **HTTPS**: Configuration pour les communications sécurisées

### Bonnes pratiques
- Les tokens sont invalidés lors de la déconnexion
- Les sessions orphelines sont automatiquement nettoyées
- L'activité utilisateur est surveillée pour détecter les comportements suspects

## Personnalisation

### Modifier le temps d'inactivité
Pour changer le temps d'inactivité avant déconnexion, modifiez la constante `INACTIVITY_TIME` dans `AuthContext.jsx`:

```javascript
const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutes
```

### Modifier le temps d'avertissement
Pour changer le temps avant l'avertissement, modifiez la constante `WARNING_TIME`:

```javascript
const WARNING_TIME = 14 * 60 * 1000; // 14 minutes (avertissement 1 minute avant)
```

### Ajouter des événements supplémentaires
Pour ajouter d'autres événements à surveiller, modifiez le tableau `activityEvents`:

```javascript
const activityEvents = [
  'mousedown', 'mousemove', 'keypress',
  'scroll', 'touchstart', 'click',
  'keydown', 'keyup', 'resize'
];
```

## Dépannage

### Problèmes courants

#### La session expire trop rapidement
- Vérifiez que les événements d'activité sont correctement déclenchés
- Assurez-vous que le timer est bien réinitialisé à chaque interaction

#### Les notifications ne s'affichent pas
- Vérifiez que le composant `Toaster` est bien intégré dans l'application
- Assurez-vous que les événements `sessionWarning` sont correctement émis

#### La déconnexion ne fonctionne pas
- Vérifiez que le backend est configuré avec Sanctum
- Assurez-vous que les routes sont protégées par le middleware approprié

## Tests

### Tests unitaires
- Tester le timer d'inactivité
- Tester la réinitialisation du timer
- Tester les événements d'activité

### Tests d'intégration
- Tester le flux de connexion/déconnexion
- Tester le comportement lors de la fermeture de page
- Tester les notifications d'avertissement

## Notes de développement

### Améliorations possibles
- Ajouter une option pour mémoriser l'utilisateur (se souvenir de moi)
- Implémenter une vérification périodique de la validité de la session
- Ajouter des journaux d'activité pour le suivi des sessions

### Compatibilité
- Compatible avec tous les navigateurs modernes
- Fonctionne sur les appareils mobiles et desktop
- Responsive design pour l'indicateur de session

## Références

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [React Context API](https://reactjs.org/docs/context.html)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)