<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsDirector
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }
        
        if ($user->role !== 'directeur') {
            return response()->json(['message' => 'Accès non autorisé - Seuls les directeurs peuvent accéder à cette ressource'], 403);
        }
        
        return $next($request);
    }
}
