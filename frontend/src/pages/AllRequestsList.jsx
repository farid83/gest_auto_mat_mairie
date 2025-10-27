import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table } from '../components/ui/table';
import { Loader2, Eye, Filter, User, Calendar, Package } from 'lucide-react';

const statusColors = {
  'En attente': 'bg-orange-100 text-orange-800',
  Validée: 'bg-green-100 text-green-800',
  Rejetée: 'bg-red-100 text-red-800',
  'En cours': 'bg-blue-100 text-blue-800',
  Livrée: 'bg-purple-100 text-purple-800',
};

const AllRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [loading, setLoading] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [detailRequest, setDetailRequest] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/demande_materiels/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      const demandes = Array.isArray(data) ? data : data.demandes || [];
      
      const formattedRequests = demandes.map((req) => ({
        id: req.id,
        demande_id: req.demande_id,
        user_name: req.user_name || 'Utilisateur inconnu',
        user_service: req.user_service || 'Service inconnu',

        materials: (req.materials || []).map((mat) => ({
          id: mat.id,
          name: mat.name || 'Nom indisponible',
          quantity: mat.quantity || 0,
          justification: mat.justification || 'Aucune justification',
          status: mat.status || 'En attente',
          created_at: mat.created_at,
          updated_at: mat.updated_at,
        })),
        status: req.status || 'En attente',
        created_at: req.created_at,
        updated_at: req.updated_at,
        validated_by: req.validated_by || 'Non validé',
        commentaire_secretaire: req.commentaire_secretaire || 'Aucun commentaire',
        livraison_status: req.livraison_status || 'Non livrée',
      }));

      setRequests(formattedRequests);
    } catch (err) {
      console.error("Erreur fetch demandes :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setSortBy(field);

    setRequests((prev) =>
      [...prev].sort((a, b) => {
        if (field === 'created_at' || field === 'updated_at') {
          return newOrder === 'asc'
            ? new Date(a[field]) - new Date(b[field])
            : new Date(b[field]) - new Date(a[field]);
        }
        return a[field].localeCompare(b[field]);
      })
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRequests(requests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, id]);
    } else {
      setSelectedRequests(selectedRequests.filter(rid => rid !== id));
    }
  };

  const getMaterialStatus = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'validated': 'Validé',
      'rejected': 'Rejeté',
      'delivered': 'Livrée',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Toutes les demandes de matériels
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('created_at')}
              >
                <Filter className="w-4 h-4 mr-2" />
                Trier par date {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Aucune demande n'a été trouvée
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedRequests.length === requests.length && requests.length > 0}
                            onChange={e => handleSelectAll(e.target.checked)}
                            title="Sélectionner tout"
                          />
                        </th>
                        <th>ID Demande</th>
                        <th>Demandeur</th>
                        <th>Service</th>
                        <th>Matériels</th>
                        <th>Statut</th>
                        <th>Date Création</th>
                        <th>Date Mise à jour</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr key={req.id} className="border-b hover:bg-muted/50">
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(req.id)}
                              onChange={e => handleSelectOne(req.id, e.target.checked)}
                              title="Sélectionner cette demande"
                            />
                          </td>
                          <td className="font-mono text-sm">#{req.demande_id}</td>
                          <td className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {req.user_name}
                          </td>
                          <td>{req.user_service}</td>

                          <td>
                            <div className="space-y-1">
                              {req.materials.map((mat, idx) => (
                                <div key={mat.id} className="flex justify-between items-center text-sm">
                                  <span className="font-medium">{mat.name}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      x{mat.quantity}
                                    </Badge>
                                    <Badge 
                                      className={`text-xs ${
                                        statusColors[mat.status] || 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {getMaterialStatus(mat.status)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <Badge
                              className={
                                statusColors[req.status] || 'bg-gray-100 text-gray-800'
                              }
                            >
                              {req.status}
                            </Badge>
                          </td>
                          <td className="align-middle text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(req.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </td>

                          <td className="align-middle text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{req.updated_at ? new Date(req.updated_at).toLocaleDateString('fr-FR') : '-'}</span>
                            </div>
                          </td>

                          <td className="align-middle">
                            <div className="flex items-center justify-center h-full">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDetailRequest(req)}
                                title="Voir le détail complet"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {selectedRequests.length > 0 && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedRequests.length} demande(s) sélectionnée(s)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => console.log('Valider:', selectedRequests)}
                      >
                        Valider la sélection
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => console.log('Rejeter:', selectedRequests)}
                      >
                        Rejeter la sélection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequests([])}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {detailRequest && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Détail complet de la demande #{detailRequest.demande_id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDetailRequest(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Informations générales</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID Demande</label>
                      <p className="font-mono">#{detailRequest.demande_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Demandeur</label>
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {detailRequest.user_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Service</label>
                      <p>{detailRequest.user_service}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Statut général</label>
                      <Badge
                        className={
                          statusColors[detailRequest.status] || 'bg-gray-100 text-gray-800'
                        }
                      >
                        {detailRequest.status}
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Validé par</label>
                      <p>{detailRequest.validated_by}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Commentaire secrétaire</label>
                      <p className="text-sm bg-muted p-2 rounded">{detailRequest.commentaire_secretaire}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Chronologie</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(detailRequest.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dernière mise à jour</label>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {detailRequest.updated_at 
                          ? new Date(detailRequest.updated_at).toLocaleString('fr-FR')
                          : 'Non mise à jour'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Détail des matériels</h3>
                <div className="grid gap-4">
                  {detailRequest.materials.map((mat, index) => (
                    <div key={mat.id} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{mat.name}</h4>
                        <Badge 
                          className={
                            statusColors[mat.status] || 'bg-gray-100 text-gray-800'
                          }
                        >
                          {getMaterialStatus(mat.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="text-muted-foreground">Quantité</label>
                          <p className="font-medium">x{mat.quantity}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Justification</label>
                          <p className="italic">{mat.justification}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Date création</label>
                          <p>{new Date(mat.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Date mise à jour</label>
                          <p>{mat.updated_at ? new Date(mat.updated_at).toLocaleDateString('fr-FR') : '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllRequestsList;