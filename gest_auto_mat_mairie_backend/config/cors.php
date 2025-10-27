<?php

return [

    'paths' => ['api/*', 'auth/*', 'sanctum/csrf-cookie', 'login', 'register', 'logout', 'dashboard/*', 'users/*', 'materiels/*', 'directions/*', 'demandes/*', 'demande-materiels/*', 'livraisons/*', 'mouvement-stocks/*', 'notifications*'],

    'allowed_methods' => ['*'],

   'allowed_origins' => ['*'], 

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
