import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Package, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import api from '../services/api';

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
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Récupérer la liste des services depuis l'API
useEffect(() => {
  // Utiliser api au lieu de fetch
  api.get('/api/services')
    .then(response => setServices(response.data))
    .catch(err => console.error('Erreur lors du chargement des services', err));
}, []);

  // Validation du mot de passe
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    return errors;
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join('. ');
      }
    }

    // Validation de la confirmation du mot de passe
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }

    // Validation du service
    if (!formData.service_id) {
      newErrors.service_id = 'Le service est requis';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setSuccess('');
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrors({});
  setSuccess('');

  // Validation côté client
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    setIsSubmitting(false);
    return;
  }

  try {
    // Utiliser api au lieu de fetch
    const response = await api.post('/api/register', formData);
    
    // Si la réponse est OK
    setSuccess('Inscription réussie ! Redirection vers la page de connexion...');
    setTimeout(() => navigate('/login'), 2000);
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Gestion des erreurs (error est déjà formaté par l'intercepteur)
    if (error.errors && Object.keys(error.errors).length > 0) {
      // Erreurs de validation Laravel
      const apiErrors = {};
      Object.keys(error.errors).forEach(key => {
        apiErrors[key] = Array.isArray(error.errors[key]) 
          ? error.errors[key].join('. ') 
          : error.errors[key];
      });
      setErrors(apiErrors);
    } else if (error.message) {
      // Message d'erreur global
      setErrors({ general: error.message });
    } else {
      setErrors({ general: 'Une erreur est survenue lors de l\'inscription' });
    }
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
              {/* Message d'erreur général */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Message de succès */}
              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="Votre nom" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className={`h-11 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="votre@email.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={`h-11 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
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
                    className={`h-11 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
                {!errors.password && formData.password && (
                  <p className="text-xs text-muted-foreground">
                    Min. 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
                  </p>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                <Input 
                  id="password_confirmation" 
                  name="password_confirmation" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={formData.password_confirmation} 
                  onChange={handleChange} 
                  className={`h-11 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password_confirmation}
                  </p>
                )}
              </div>

              {/* Service */}
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <select 
                  id="service" 
                  name="service_id" 
                  value={formData.service_id} 
                  onChange={handleChange} 
                  className={`h-11 w-full border rounded px-3 bg-white dark:bg-slate-950 ${errors.service_id ? 'border-red-500' : ''}`}
                >
                  <option value="">-- Sélectionnez un service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.service_id && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.service_id}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Déjà un compte ? <Link to="/login" className="text-blue-600 hover:underline font-medium">Se connecter</Link>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          © 2025 Mairie d'Adjarra - Tous droits réservés
        </div>
      </div>
    </div>
  );
};

export default Register;