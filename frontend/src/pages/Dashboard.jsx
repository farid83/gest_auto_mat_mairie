import React from 'react';
import { 
  Package, 
  FileText, 
  CheckSquare, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useApi';

const Dashboard = () => {
  const { user, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  
  // Récupération des statistiques via API
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();

  // Statistiques par défaut en cas d'erreur ou de chargement
  const defaultStats = {
    requests_total: 0,
    requests_pending: 0,
    materials_total: 0,
    materials_low_stock: 0,
    pending_validations: 0,
    notifications_unread: 0
  };

  const currentStats = stats || defaultStats;

  // Statistiques par rôle
  const getRoleSpecificStats = () => {
    const roleStats = [];

    if (hasAnyRole(['admin', 'gestionnaire_stock'])) {
      roleStats.push(
        {
          title: "Matériels en stock",
          value: currentStats.materials_total,
          icon: Package,
          description: "Références actives",
          color: "blue"
        },
        {
          title: "Alertes stock",
          value: currentStats.materials_low_stock,
          icon: AlertTriangle,
          description: "Sous le seuil minimum",
          color: "orange",
          urgent: currentStats.materials_low_stock > 0
        }
      );
    }

    if (hasAnyRole(['directeur', 'daaf', 'secretaire_executif'])) {
      roleStats.push({
        title: "Validations en attente",
        value: currentStats.pending_validations,
        icon: CheckSquare,
        description: "Demandes à valider",
        color: "purple",
        urgent: currentStats.pending_validations > 0
      });
    }

    roleStats.push(
      {
        title: "Demandes totales",
        value: currentStats.requests_total,
        icon: FileText,
        description: "Toutes les demandes",
        color: "green"
      },
      {
        title: "Notifications",
        value: currentStats.notifications_unread,
        icon: Clock,
        description: "Non lues",
        color: "red",
        urgent: currentStats.notifications_unread > 0
      }
    );

    return roleStats;
  };

  const roleStats = getRoleSpecificStats();

  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bonjour, {user?.name}
            </h1>
            <p className="text-muted-foreground">
              Erreur lors du chargement des données du dashboard
            </p>
          </div>
        </div>
        
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">
                Impossible de charger les statistiques. Vérifiez votre connexion.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bonjour, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de vos activités et notifications
            {statsLoading && " (chargement en cours...)"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/requests/new')} size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat, index) => {
          const Icon = stat.icon;
          const isLoading = statsLoading;
          
          return (
            <Card key={index} className={`${stat.urgent ? 'border-orange-200 shadow-orange-100 dark:border-orange-800' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section principale avec données mockées pour le moment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message temporaire */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="w-5 h-5 mr-2" />
              Intégration API en cours
            </CardTitle>
            <CardDescription>
              Système connecté à l'API Laravel (simulation)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">API Backend</p>
                    <p className="text-sm text-green-600 dark:text-green-300">Connecté et opérationnel</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Actif
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Authentification</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">Laravel Sanctum simulé</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Fonctionnel
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-orange-800 dark:text-orange-200">Données complètes</p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">En cours de migration des mocks</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  En cours
                </Badge>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Prochaines étapes :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Connexion à votre API Laravel existante</li>
                  <li>• Migration complète des données</li>
                  <li>• Implémentation des pages restantes</li>
                  <li>• Tests d'intégration complets</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;