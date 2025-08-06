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
import { 
  mockRequests, 
  mockMaterials, 
  mockNotifications, 
  mockDeliveries,
  statusLabels,
  priorityLabels 
} from '../services/mock';

const Dashboard = () => {
  const { user, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  // Statistiques générales
  const totalRequests = mockRequests.length;
  const pendingRequests = mockRequests.filter(r => r.status === 'en_attente').length;
  const approvedRequests = mockRequests.filter(r => r.status === 'approuvee').length;
  
  const lowStockMaterials = mockMaterials.filter(m => m.stock_quantity <= m.min_threshold).length;
  const outOfStockMaterials = mockMaterials.filter(m => m.stock_quantity === 0).length;
  
  const userNotifications = mockNotifications.filter(n => n.user_id === user?.id && !n.read).length;

  // Demandes nécessitant une validation de l'utilisateur actuel
  const pendingValidations = mockRequests.filter(request => {
    if (request.status !== 'en_attente') return false;
    return request.validations.some(val => 
      val.role === user?.role && val.status === 'en_attente'
    );
  });

  // Statistiques par rôle
  const getRoleSpecificStats = () => {
    const stats = [];

    if (hasAnyRole(['admin', 'gestionnaire_stock'])) {
      stats.push(
        {
          title: "Matériels en stock",
          value: mockMaterials.length,
          icon: Package,
          description: "Références actives",
          color: "blue"
        },
        {
          title: "Alertes stock",
          value: lowStockMaterials,
          icon: AlertTriangle,
          description: "Sous le seuil minimum",
          color: "orange",
          urgent: lowStockMaterials > 0
        }
      );
    }

    if (hasAnyRole(['directeur', 'daaf', 'secretaire_executif'])) {
      stats.push({
        title: "Validations en attente",
        value: pendingValidations.length,
        icon: CheckSquare,
        description: "Demandes à valider",
        color: "purple",
        urgent: pendingValidations.length > 0
      });
    }

    stats.push(
      {
        title: "Demandes totales",
        value: totalRequests,
        icon: FileText,
        description: "Toutes les demandes",
        color: "green"
      },
      {
        title: "Notifications",
        value: userNotifications,
        icon: Clock,
        description: "Non lues",
        color: "red",
        urgent: userNotifications > 0
      }
    );

    return stats;
  };

  const stats = getRoleSpecificStats();

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
        {stats.map((stat, index) => {
          const Icon = stat.icon;
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
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Demandes récentes
            </CardTitle>
            <CardDescription>
              Dernières demandes de matériels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{request.request_number}</p>
                    <Badge 
                      variant={request.status === 'approuvee' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {statusLabels[request.status]}
                    </Badge>
                    {request.priority === 'urgente' && (
                      <Badge variant="destructive" className="text-xs">
                        {priorityLabels[request.priority]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{request.requester_name}</p>
                  <p className="text-xs text-muted-foreground">{request.direction}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/requests/${request.id}`)}
                >
                  Voir
                </Button>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/requests')}
            >
              Voir toutes les demandes
            </Button>
          </CardContent>
        </Card>

        {/* Validations en attente (pour les validateurs) */}
        {hasAnyRole(['directeur', 'daaf', 'secretaire_executif']) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="w-5 h-5 mr-2" />
                Validations en attente
              </CardTitle>
              <CardDescription>
                Demandes nécessitant votre validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingValidations.slice(0, 5).map((request) => {
                const currentValidation = request.validations.find(v => 
                  v.role === user.role && v.status === 'en_attente'
                );
                
                return (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">{request.request_number}</p>
                        <Badge variant="outline" className="text-xs">
                          Étape {currentValidation?.step}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.requester_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.items.length} article(s) - {request.priority}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/validations/${request.id}`)}
                    >
                      Valider
                    </Button>
                  </div>
                );
              })}

              {pendingValidations.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune validation en attente</p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/validations')}
              >
                Voir toutes les validations
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alertes stock (pour gestionnaires) */}
        {hasAnyRole(['gestionnaire_stock', 'admin']) && (
          <Card className={lowStockMaterials > 0 ? 'border-orange-200' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                État des stocks
              </CardTitle>
              <CardDescription>
                Matériels nécessitant attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockMaterials
                .filter(m => m.stock_quantity <= m.min_threshold)
                .slice(0, 4)
                .map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-sm text-muted-foreground">Code: {material.code}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress 
                          value={(material.stock_quantity / material.max_threshold) * 100} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {material.stock_quantity}/{material.max_threshold}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={material.stock_quantity === 0 ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {material.stock_quantity === 0 ? 'Rupture' : 'Faible'}
                    </Badge>
                  </div>
              ))}

              {lowStockMaterials === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Tous les stocks sont à niveau</p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/materials')}
              >
                Gérer les stocks
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;