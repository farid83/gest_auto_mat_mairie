<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{ 
    public function getStats()
    {
        return response()->json([
            'users' => 42,
            'sessions' => 197,
            'errors' => 3,
            'uptime' => '99.9%'
        ]);
    }
}
