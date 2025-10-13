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
    // notifications_unread: 0,
    user_requests_total: 0,
    user_requests_pending: 0
  };

  const currentStats = stats || defaultStats;

  // Statistiques par rôle
  const getRoleSpecificStats = () => {
    const roleStats = [];

    if (hasAnyRole(['admin', 'gestionnaire_stock', 'secretaire_executif', 'daaf'])) {
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

    if (hasAnyRole(['directeur', 'daaf', 'secretaire_executif', 'gestionnaire_stock'])) {
      roleStats.push({
        title: "Validations en attente",
        value: currentStats.pending_validations,
        icon: CheckSquare,
        description: "Demandes à valider",
        color: "purple",
        urgent: currentStats.pending_validations > 0
      });
    }

    // Ajouter les statistiques des demandes de l'utilisateur
    roleStats.push(
      {
        title: "Mes demandes totales",
        value: currentStats.user_requests_total,
        icon: FileText,
        description: "Mes demandes",
        color: "indigo"
      },
      {
        title: "Mes demandes en attente",
        value: currentStats.user_requests_pending,
        icon: Clock,
        description: "En attente de validation",
        color: "orange",
        urgent: currentStats.user_requests_pending > 0
      }
    );

    // Ajouter les statistiques générales pour les rôles appropriés
    if (hasAnyRole(['admin', 'gestionnaire_stock'])) {
      roleStats.push(
        {
          title: "Demandes totales",
          value: currentStats.requests_total,
          icon: FileText,
          description: "Toutes les demandes",
          color: "green"
        }
      );
    }

    // roleStats.push(
    //   {
    //     title: "Notifications",
    //     value: currentStats.notifications_unread,
    //     icon: Clock,
    //     description: "Non lues",
    //     color: "red",
    //     urgent: currentStats.notifications_unread > 0
    //   }
    // );

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
            Voici un aperçu de vos activités
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
                  stat.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900' :
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    stat.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
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

      {/* Autres sections du dashboard peuvent être ajoutées ici */}
      
    </div>
  );
};

export default Dashboard;