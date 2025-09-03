import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Package, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nettoyer les erreurs au démarrage
  useEffect(() => {
    clearError();
  }, []);

  // Rediriger si déjà authentifié
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Nettoyer l'erreur lors de la saisie
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const quickLoginButtons = [
    { email: 'jean.dupont@example.com', role: 'Directeur', password: 'password123' },
    { email: 'marie.koffi@example.com', role: 'CM', password: 'password123' },
    { email: 'pierre.akoka@example.com', role: 'Secretaire Executif', password: 'password123' },
    { email: 'fatou.tomiyo@example.com', role: 'DAAF', password: 'password123' },
     { email: 'ahmed.soumanou@example.com', role: 'Collaborateur DSI', password: 'password123' },
    { email: 'admin@example.com', role: 'admin', password: 'secret' }
  ];

  const handleQuickLogin = async (email) => {
    setFormData({ email, password: 'password123' });
    setIsSubmitting(true);
    
    try {
      const result = await login(email, 'password123');
      if (result.success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mairie d'Adjarra</h1>
          <p className="text-muted-foreground">Système de Gestion des Matériels</p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous pour accéder au système
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange} 
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Lien vers l'inscription */}
        <div className="text-center text-
        m my-2">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            S’inscrire
          </a>
        </div>

        {/* Connexions rapides de démo */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center">Connexions de démonstration</CardTitle>
            <CardDescription className="text-center text-sm">
              Cliquez pour tester avec différents rôles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {quickLoginButtons.map((user, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin(user.email)}
                  disabled={isSubmitting}
                  className="justify-start h-10"
                >
                  <span className="font-medium mr-2">{user.role}:</span>
                  <span className="text-muted-foreground text-sm">{user.email}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          © 2024 Mairie d'Adjarra - Tous droits réservés
        </div>
      </div>
    </div>
  );
};

export default Login;