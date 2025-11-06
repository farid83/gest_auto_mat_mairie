import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import QueryProvider from "./contexts/QueryProvider";
import Layout from "./components/layout/Layout";
import Register from './pages/Register';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RequestsNew from './pages/RequestsNew';
import RequestsList from './pages/RequestsList';
import AllRequestsList from './pages/AllRequestsList';
import RequestsValidation from './pages/RequestsValidation';
import MaterialsManagement from './pages/MaterialsManagement';
import UsersManagement from './pages/UsersManagement';
import AdminSettings from './pages/AdminSettings';
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";


function App() {
  const { toast } = useToast();

  useEffect(() => {
    // Écouter les événements d'avertissement de session
    const handleSessionWarning = () => {
      toast({
        title: "Session sur le point d'expirer",
        description: "Votre session va expirer dans 1 minute. Voulez-vous vous prolonger ?",
        duration: 60000, // 60 secondes
        action: (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => {
                // Réinitialiser la session côté serveur si nécessaire
                console.log("Session prolongée");
              }}
            >
              Prolonger
            </button>
            <button
              className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              onClick={() => {
                // Forcer la déconnexion
                console.log("Déconnexion demandée");
                window.location.href = '/login';
              }}
            >
              Se déconnecter
            </button>
          </div>
        ),
      });
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('sessionWarning', handleSessionWarning);

    // Nettoyage au démontage
    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
    };
  }, [toast]);

  return (
    <div className="App">
      <QueryProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="requests/new" element={<RequestsNew />} />
                <Route path="requests" element={<RequestsList />} />
                <Route path="requests/all" element={<AllRequestsList />} />
                <Route path="validations" element={<RequestsValidation />} />
                <Route path="materials" element={<MaterialsManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryProvider>
      <Toaster />
    </div>
  );
}

export default App;