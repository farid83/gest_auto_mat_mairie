#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🔨 Installation des dépendances..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "🧹 Nettoyage des caches..."
php artisan config:clear
php artisan cache:clear

echo "⚡ Optimisation..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "🗄️ Migration de la base de données..."
php artisan migrate --force --no-interaction

echo "✅ Build terminé!"