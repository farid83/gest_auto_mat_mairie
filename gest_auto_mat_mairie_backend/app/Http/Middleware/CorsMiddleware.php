<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    private array $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'https://gestautomat.netlify.app',
    ];

    private array $allowedOriginPatterns = [
        '/^https?:\/\/localhost(:\d+)?$/',
        '/^https:\/\/.*\.netlify\.app$/',
        '/^https:\/\/.*\.ngrok-free\.dev$/',
        '/^https:\/\/.*\.ngrok\.io$/',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');

        \Log::info('CorsMiddleware exécuté', [
            'origin' => $origin,
            'method' => $request->method(),
            'path' => $request->path(),
        ]);

        if ($this->isOriginAllowed($origin)) {
            
            if ($request->isMethod('OPTIONS')) {
                \Log::info('Requête OPTIONS détectée');
                return response('', 200)
                    ->header('Access-Control-Allow-Origin', $origin)
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN, X-CSRF-TOKEN')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '86400');
            }

            $response = $next($request);

            \Log::info('Ajout des headers CORS à la réponse');

            return $response
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN, X-CSRF-TOKEN')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        \Log::warning('Origine non autorisée', ['origin' => $origin]);
        return $next($request);
    }

    private function isOriginAllowed(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }

        if (in_array($origin, $this->allowedOrigins, true)) {
            return true;
        }

        foreach ($this->allowedOriginPatterns as $pattern) {
            if (preg_match($pattern, $origin)) {
                return true;
            }
        }

        $frontendUrl = env('FRONTEND_URL');
        if ($frontendUrl && $origin === $frontendUrl) {
            return true;
        }

        return false;
    }
}