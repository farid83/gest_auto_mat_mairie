import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Package, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    service_id: ''
  });
  const [services, setServices] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Récupération dynamique des services
  useEffect(() => {
    fetch('http://localhost:8000/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error('Erreur lors du chargement des services', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Inscription réussie ! Vous pouvez vous connecter.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.message || 'Erreur lors de l’inscription ou les mots de passe ne correspondent pas');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Inscription</h1>
          <p className="text-muted-foreground">Créer un compte pour accéder au système</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Créer un compte</CardTitle>
            <CardDescription className="text-center">Remplissez le formulaire ci-dessous</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" name="name" type="text" placeholder="Votre nom" value={formData.name} onChange={handleChange} required className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" name="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={handleChange} required className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required className="h-11 pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-11 w-11" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                <Input id="password_confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password_confirmation} onChange={handleChange} required className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <select id="service" name="service_id" value={formData.service_id} onChange={handleChange} required className="h-11 w-full border rounded px-3">
                  <option value="">-- Sélectionnez un service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Inscription...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Déjà un compte ? <Link to="/login" className="text-blue-600 hover:underline">Se connecter</Link>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          © 2025 Mairie d'Adjarra - Tous droits réservés
        </div>
      </div>
    </div>
  );
};

export default Register;
