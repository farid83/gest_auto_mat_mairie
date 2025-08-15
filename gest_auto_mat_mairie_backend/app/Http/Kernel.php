<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Auth\Middleware\RequirePassword;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Fruitcake\Cors\HandleCors;
class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These run during every request.
     */
    protected $middleware = [
        // Laravel 12 gère CORS automatiquement via Symfony — pas besoin de HandleCors ici
        \Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        // \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class, // À ajouter si elle est dispo
    ];

    /**
     * The application's route middleware groups.
     */
    protected $middlewareGroups = [
        'web' => [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,

            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            StartSession::class,
            ShareErrorsFromSession::class,
            
            SubstituteBindings::class,
        ],

        'api' => [
            'throttle:api',
            SubstituteBindings::class,
            EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ],
    ];

    /**
     * The application's route middleware.
     */
    protected $routeMiddleware = [
        'auth' => Authenticate::class,
        'verified' => EnsureEmailIsVerified::class,
        'password.confirm' => RequirePassword::class,
    ];
}
