<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Liste des origines autorisées
     */
    private array $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'https://gestautomat.netlify.app',
    ];

    /**
     * Patterns d'origines autorisées
     */
    private array $allowedOriginPatterns = [
        '/^https?:\/\/localhost(:\d+)?$/',
        '/^https:\/\/.*\.netlify\.app$/',
        '/^https:\/\/.*\.ngrok-free\.dev$/',
        '/^https:\/\/.*\.ngrok\.io$/',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Récupérer l'origine de la requête
        $origin = $request->headers->get('Origin');

        // Vérifier si l'origine est autorisée
        if ($this->isOriginAllowed($origin)) {
            
            // Si c'est une requête preflight (OPTIONS)
            if ($request->isMethod('OPTIONS')) {
                return response('', 200)
                    ->header('Access-Control-Allow-Origin', $origin)
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN, X-CSRF-TOKEN')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '86400');
            }

            // Pour les requêtes normales, traiter et ajouter les headers CORS
            $response = $next($request);

            return $response
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN, X-CSRF-TOKEN')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        // Si l'origine n'est pas autorisée, continuer sans headers CORS
        return $next($request);
    }

    /**
     * Vérifier si une origine est autorisée
     */
    private function isOriginAllowed(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }

        // Vérifier dans la liste des origines exactes
        if (in_array($origin, $this->allowedOrigins, true)) {
            return true;
        }

        // Vérifier avec les patterns regex
        foreach ($this->allowedOriginPatterns as $pattern) {
            if (preg_match($pattern, $origin)) {
                return true;
            }
        }

        // Vérifier la variable d'environnement FRONTEND_URL
        $frontendUrl = env('FRONTEND_URL');
        if ($frontendUrl && $origin === $frontendUrl) {
            return true;
        }

        return false;
    }
}