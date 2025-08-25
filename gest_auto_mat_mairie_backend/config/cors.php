<?php

return [

    'paths' => ['api/*', 'auth/*', 'sanctum/csrf-cookie', 'login', 'register', 'logout', 'dashboard/*', 'users/*', 'materiels/*', 'directions/*', 'demandes/*', 'demande-materiels/*', 'livraisons/*', 'mouvement-stocks/*'],

    'allowed_methods' => ['*'],

   'allowed_origins' => ['*'], // à restreindre si nécessaire pour éviter les risques de sécurité

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
