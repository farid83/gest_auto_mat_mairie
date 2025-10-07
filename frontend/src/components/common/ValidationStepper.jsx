import React from 'react';
import { Check, Clock, X, User } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { roleLabels } from '../../services/mock';

const ValidationStepper = ({ 
  validations = [], 
  currentStatus = 'en_attente',
  className = "",
  showDetails = true 
}) => {
  const getStepIcon = (validation) => {
    switch (validation.status) {
      case 'validee':
        return <Check className="w-4 h-4 text-white" />;
      case 'rejetee':
        return <X className="w-4 h-4 text-white" />;
      case 'en_attente':
        return <Clock className="w-4 h-4 text-white" />;
      default:
        return <User className="w-4 h-4 text-white" />;
    }
  };

  const getStepColor = (validation) => {
    switch (validation.status) {
      case 'validee':
        return 'bg-green-500 border-green-500';
      case 'rejetee':
        return 'bg-red-500 border-red-500';
      case 'en_attente':
        return 'bg-orange-500 border-orange-500';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  };

  const getConnectorColor = (index) => {
    if (index >= validations.length - 1) return '';
    
    const currentValidation = validations[index];
    const nextValidation = validations[index + 1];
    
    if (currentValidation.status === 'validee' && nextValidation.status !== 'en_attente') {
      return 'bg-green-500';
    } else if (currentValidation.status === 'validee') {
      return 'bg-orange-500';
    } else if (currentValidation.status === 'rejetee') {
      return 'bg-red-500';
    } else {
      return 'bg-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'validee':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Validé</Badge>;
      case 'rejetee':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejeté</Badge>;
      case 'en_attente':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">En attente</Badge>;
      default:
        return <Badge variant="secondary">Non traité</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Circuit de validation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validations.map((validation, index) => (
            <div key={index} className="relative">
              <div className="flex items-start space-x-4">
                {/* Icône d'étape */}
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepColor(validation)}`}>
                    {getStepIcon(validation)}
                  </div>
                  
                  {/* Connecteur vers l'étape suivante */}
                  {index < validations.length - 1 && (
                    <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 ${getConnectorColor(index)}`} />
                  )}
                </div>

                {/* Contenu de l'étape */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">
                        Étape {validation.step}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({roleLabels[validation.role]})
                      </span>
                    </div>
                    {getStatusBadge(validation.status)}
                  </div>

                  <div className="mt-1">
                    <p className="text-sm font-medium text-foreground">
                      {validation.validator_name}
                    </p>
                    
                    {showDetails && (
                      <div className="mt-2 space-y-1">
                        {validation.validated_at && (
                          <p className="text-xs text-muted-foreground">
                            Traité le: {formatDate(validation.validated_at)}
                          </p>
                        )}
                        
                        {validation.comment && (
                          <div className="p-2 rounded-md bg-muted">
                            <p className="text-xs italic text-muted-foreground">
                              "{validation.comment}"
                            </p>
                          </div>
                        )}
                        
                        {validation.status === 'en_attente' && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            En attente de validation
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé du statut global */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut global:</span>
            {currentStatus === 'validee' && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Demande validée
              </Badge>
            )}
            {currentStatus === 'rejetee' && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Demande rejetée
              </Badge>
            )}
            {currentStatus === 'en_attente' && (
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                En cours de validation
              </Badge>
            )}
          </div>
          
          {currentStatus === 'en_attente' && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Prochaine étape: {validations.find(v => v.status === 'en_attente')?.validator_name || 'Non définie'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationStepper;