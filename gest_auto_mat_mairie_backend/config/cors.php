<?php

return [

    'paths' => [
        'api/*', 
        'auth/*', 
        'sanctum/csrf-cookie', 
        'login', 
        'register', 
        'logout', 
        'dashboard/*', 
        'users/*', 
        'materiels/*', 
        'directions/*', 
        'demandes/*', 
        'demande-materiels/*', 
        'livraisons/*', 
        'mouvement-stocks/*', 
        'notifications/*'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        env('FRONTEND_URL'),
    ]),

    // Patterns pour autoriser dynamiquement Netlify et ngrok
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.netlify\.app$/',
        '/^https:\/\/.*\.ngrok-free\.dev$/',
        '/^https:\/\/.*\.ngrok\.io$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];