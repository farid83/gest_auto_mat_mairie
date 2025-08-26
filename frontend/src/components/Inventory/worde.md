Oui, tu **peux utiliser WampServer** pour héberger le **backend Laravel** de ton application de gestion des matériels, mais il y a quelques points importants à connaître.

---

## ✅ Ce que tu peux faire avec Wamp :

| Ce que WAMP permet           | Est-ce adapté à ton projet Laravel ?                                     |
| ---------------------------- | ------------------------------------------------------------------------ |
| Serveur local Apache + MySQL | ✅ Oui, pour les projets Laravel                                          |
| PHP (multiple versions)      | ✅ Laravel fonctionne avec PHP 8.x                                        |
| PhpMyAdmin                   | ✅ Pour gérer la base de données facilement                               |
| SQLite ou MySQL local        | ✅ (même si tu utilises PostgreSQL dans le projet final, tu peux adapter) |

---

## ❌ Ce que WAMP **ne fait pas directement** :

* WAMP **ne fournit pas PostgreSQL** → donc si ton projet Laravel est prévu avec PostgreSQL, tu devras :

  * soit **installer PostgreSQL en plus**
  * soit **adapter Laravel** pour utiliser **MySQL (MariaDB)**, ce que WAMP gère très bien.

---

## 🔧 Utiliser Laravel avec WAMP — Étapes pratiques

### 1. 📦 Laravel via Composer

Ouvre un terminal (`cmd` ou PowerShell), et place-toi dans `C:\wamp64\www` :

```bash
cd C:\wamp64\www
composer create-project laravel/laravel gest_mairie_Adjarra
```

### 2. ⚙️ Créer une base de données MySQL via PhpMyAdmin

* Ouvre `http://localhost/phpmyadmin`
* Crée une base vide (ex. `gest_mat_adjarra`)

### 3. 🔧 Configurer le `.env` de Laravel

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gest_mat_adjarra
DB_USERNAME=root
DB_PASSWORD=
```

> Par défaut, WAMP n’a pas de mot de passe pour `root`.

---

### 4. 🚀 Lancer le serveur Laravel (dans `C:\wamp64\www\nom_du_projet`) :

```bash
php artisan serve
```

Tu verras :

```
Starting Laravel development server at: http://127.0.0.1:8000
```

Ton backend est prêt à recevoir des requêtes depuis ton frontend React.

---

### ⚠️ Attention avec React + Laravel sous WAMP

Pour que ton frontend (sur `localhost:5173`) puisse appeler l’API Laravel (`localhost:8000`), tu dois :

1. **Configurer CORS dans Laravel** :
   Dans `config/cors.php`, autorise les requêtes venant de ton client :

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173'],
'credentials' => true,
```

2. **Activer Laravel Sanctum si tu fais une auth par cookie**

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
php artisan migrate
```

3. **Configurer le middleware `EnsureFrontendRequestsAreStateful`**

---

## 🧠 En résumé

| Question                                                             | Réponse                                                        |
| -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Peut-on utiliser WAMP avec Laravel ?                                 | ✅ Oui, parfaitement                                            |
| Peut-on utiliser PostgreSQL ?                                        | ❌ Pas directement avec WAMP, mais tu peux l’installer à part   |
| Laravel fonctionne-t-il bien avec WAMP ?                             | ✅ Oui, si bien configuré                                       |
| Peut-on connecter un React frontend à un backend Laravel sous WAMP ? | ✅ Oui, avec la bonne configuration CORS et `php artisan serve` |

---

Souhaites-tu que je t’aide à :

* **Configurer ton `.env`** ?
* **Créer un backend Laravel complet sous WAMP prêt à l’emploi** ?
* **Connecter ton frontend React local avec le backend Laravel sous WAMP** ?
* **Basculer de PostgreSQL à MySQL dans le projet** pour éviter d'installer PostgreSQL ?

Je peux te faire tout ça étape par étape.
