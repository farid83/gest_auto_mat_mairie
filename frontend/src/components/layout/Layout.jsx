import React, { useState, useMemo, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Package, FileText, CheckSquare, Users,
  Truck, Settings, Menu, Bell, User as UserIcon,
  LogOut, Moon, Sun, Key
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useAuth } from '../../contexts/AuthContext';
import { mockNotifications, roleLabels } from '../../services/mock';
import { Toaster, toast } from 'sonner'; // <-- ajouté `toast` pour notifications

// Ajouter imports Dialog et Input
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { usersService } from '../../services/api';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, logout } = useAuth();

  console.log("AuthContext ->", {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role
  });
  console.log("LocalStorage ->",
    localStorage.getItem('session_id'),
    localStorage.getItem('user')
  );
  // État pour le mode sombre et le menu mobile
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwErrors, setPwErrors] = useState({});
  const [isPwSubmitting, setIsPwSubmitting] = useState(false);

  // garde pour éviter ouverture multiple accidentelle
  const openingRef = useRef(false);

  // Menu items avec rôles uniformisés
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['user', 'directeur', 'gestionnaire_stock', 'daaf', 'secretaire_executif', 'admin'] },
    { icon: Package, label: 'Matériels', path: '/materials', roles: ['gestionnaire_stock', 'admin', 'secretaire_executif', 'daaf'] },
    { icon: FileText, label: 'Demandes', path: '/requests', roles: ['user', 'directeur', 'gestionnaire_stock', 'daaf', 'secretaire_executif', 'admin'] },
    { icon: CheckSquare, label: 'Validations', path: '/validations', roles: ['directeur', 'gestionnaire_stock', 'daaf', 'secretaire_executif',] },
    // { icon: Truck, label: 'Livraisons', path: '/deliveries', roles: ['gestionnaire_stock','daaf','admin'] },
    { icon: Users, label: 'Utilisateurs', path: '/users', roles: ['admin'] },
    { icon: Settings, label: 'Configuration', path: '/settings', roles: ['admin'] }
  ];

  // Loader global si AuthContext est en train de vérifier la session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Chargement de votre session...
      </div>
    );
  }

  const visibleMenuItems = useMemo(() => {
    if (!user) return [];
    return menuItems.filter(item => item.roles.includes(user.role));
  }, [user, menuItems]);

  // const unreadNotifications = mockNotifications.filter(
  //   notif => notif.user_id === user?.id && !notif.read
  // );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Mairie Adjarra</h1>
            <p className="text-sm text-muted-foreground">Gestion Matériels</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (mobile) setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabels[user?.role]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleOpenChangePassword = () => {
    if (isChangePasswordOpen || openingRef.current) return; // si déjà ouvert ou en cours d'ouverture -> ignore
    openingRef.current = true;
    setPwErrors({});

    setNewPassword('');
    setConfirmPassword('');
    setIsChangePasswordOpen(true);
    // petit timeout pour réinitialiser le flag après l'ouverture (sécurise contre double click très rapide)
    setTimeout(() => { openingRef.current = false; }, 300);
  };

  /**
   * Remplacement de handleSubmitChangePassword :
   * - Normalise les erreurs renvoyées par axios (tableaux → chaînes).
   * - Affiche une notification en succès/erreur.
   * - Ferme le modal et réinitialise les champs en cas de succès.
   * - Empêche les soumissions multiples via isPwSubmitting (désactive le bouton).
   */
  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    if (isPwSubmitting) return;
    setPwErrors({});

    if (!newPassword || newPassword.length < 8) {
      setPwErrors({ password: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwErrors({ password_confirmation: 'La confirmation ne correspond pas.' });
      return;
    }

    setIsPwSubmitting(true);
    try {
      await usersService.updateMyPassword({
        password: newPassword,
        password_confirmation: confirmPassword
      });

      toast.success('Mot de passe mis à jour avec succès.');
      setIsChangePasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setPwErrors({});
    } catch (rawErr) {
      const normalized = {};
      if (rawErr?.errors && typeof rawErr.errors === 'object') {
        for (const [key, val] of Object.entries(rawErr.errors)) {
          normalized[key] = Array.isArray(val) ? val.join(' ') : String(val);
        }
      } else if (rawErr?.message) {
        normalized.form = rawErr.message;
      } else {
        normalized.form = 'Erreur lors de la mise à jour du mot de passe.';
      }
      setPwErrors(normalized);
      toast.error(normalized.form || 'Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setIsPwSubmitting(false);
    }
  };


  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block w-64 bg-card border-r border-border">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-card border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-foreground">
                  {visibleMenuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">{roleLabels[user?.role]}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('#')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>

                  {/* Nouveau sous-menu pour modifier son mot de passe */}
                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleOpenChangePassword(); }}>
                    <Key className="mr-2 h-4 w-4" />
                    <span>Modifier mon mot de passe</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      {/* Modal de changement de mot de passe */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={(open) => setIsChangePasswordOpen(!!open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier mon mot de passe</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-muted-foreground mb-4">
            Saisissez votre nouveau mot de passe et confirmez-le.
          </DialogDescription>

          <form onSubmit={handleSubmitChangePassword} className="space-y-4">
            {/* Erreur globale */}
            {pwErrors.form && (
              <div className="text-red-600 text-sm">{pwErrors.form}</div>
            )}

            {/* Nouveau mot de passe */}
            <Input
              name="password"
              label="Nouveau mot de passe"
              placeholder="Entrez votre nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {pwErrors.password && (
              <div className="text-red-600 text-sm">{pwErrors.password}</div>
            )}

            {/* Confirmation du mot de passe */}
            <Input
              name="password_confirmation"
              label="Confirmer le nouveau mot de passe"
              placeholder="Confirmez le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {pwErrors.password_confirmation && (
              <div className="text-red-600 text-sm">{pwErrors.password_confirmation}</div>
            )}

            <DialogFooter className="flex justify-end space-x-2">
              <Button type="submit" disabled={isPwSubmitting}>
                {isPwSubmitting ? 'En cours...' : 'Enregistrer'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPwErrors({});
                }}
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default Layout;