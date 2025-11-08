#!/bin/bash

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  Script de basculement d'environnement"
echo "=========================================="
echo ""

if [ "$1" == "local" ]; then
    if [ -f .env.local ]; then
        cp .env.local .env
        echo -e "${GREEN}✅ Configuration locale activée${NC}"
        echo ""
        echo "Configuration active:"
        echo "  - APP_URL: http://localhost:8000"
        echo "  - FRONTEND_URL: http://localhost:3000"
        echo "  - SESSION_DOMAIN: localhost"
        echo ""
    else
        echo -e "${RED}❌ Fichier .env.local introuvable${NC}"
        exit 1
    fi
    
elif [ "$1" == "netlify" ]; then
    if [ -f .env.netlify ]; then
        echo -e "${BLUE}📝 Configuration Netlify/ngrok${NC}"
        echo ""
        echo "Veuillez fournir les informations suivantes:"
        echo ""
        
        # Demander l'URL ngrok
        read -p "URL ngrok (ex: https://abc123.ngrok.io): " NGROK_URL
        read -p "URL Netlify (ex: https://votre-app.netlify.app): " NETLIFY_URL
        
        # Copier le template
        cp .env.netlify .env
        
        # Remplacer les valeurs
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|https://VOTRE-URL-NGROK.ngrok.io|$NGROK_URL|g" .env
            sed -i '' "s|votre-app.netlify.app|${NETLIFY_URL#https://}|g" .env
        else
            # Linux
            sed -i "s|https://VOTRE-URL-NGROK.ngrok.io|$NGROK_URL|g" .env
            sed -i "s|votre-app.netlify.app|${NETLIFY_URL#https://}|g" .env
        fi
        
        echo ""
        echo -e "${GREEN}✅ Configuration Netlify activée${NC}"
        echo ""
        echo "Configuration active:"
        echo "  - APP_URL: $NGROK_URL"
        echo "  - FRONTEND_URL: $NETLIFY_URL"
        echo "  - SESSION_DOMAIN: .ngrok.io"
        echo ""
        echo -e "${BLUE}📌 N'oubliez pas de:${NC}"
        echo "  1. Mettre à jour REACT_APP_BACKEND_URL sur Netlify"
        echo "  2. Redémarrer Laravel: php artisan serve"
        echo "  3. Redéployer sur Netlify"
        echo ""
    else
        echo -e "${RED}❌ Fichier .env.netlify introuvable${NC}"
        exit 1
    fi
    
else
    echo -e "${RED}Usage: ./switch-env.sh [local|netlify]${NC}"
    echo ""
    echo "Exemples:"
    echo "  ./switch-env.sh local    - Passer en mode développement local"
    echo "  ./switch-env.sh netlify  - Passer en mode test Netlify/ngrok"
    exit 1
fi

# Nettoyer le cache Laravel
echo -e "${BLUE}🔄 Nettoyage du cache Laravel...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan route:clear

echo ""
echo -e "${GREEN}✅ Environnement configuré avec succès!${NC}"
echo "=========================================="