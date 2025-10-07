import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ReadyToDeliverTable = () => {
  const { user } = useAuth();
  const [readyToDeliver, setReadyToDeliver] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReadyToDeliver();
  }, []);

  const fetchReadyToDeliver = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/demande-materiels/ready-to-deliver');
      setReadyToDeliver(response.demandes || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des demandes prêtes à livrer:', err);
      setError('Impossible de charger les demandes prêtes à livrer');
    } finally {
      setLoading(false);
    }
  };

  const handleStockOut = async (demandeId, materialId, quantity) => {
    try {
      const response = await api.post(`/api/materiels/${materialId}/sortie`, {
        quantity: quantity,
        demande_id: demandeId
      });
      
      // Rafraîchir la liste
      fetchReadyToDeliver();
      
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la sortie de stock:', err);
      throw err;
    }
  };

  const handlePlanDelivery = async (demandeId) => {
    try {
      // Créer une livraison pour cette demande
      const response = await api.post('/api/livraisons', {
        demande_id: demandeId,
        statut: 'en_cours',
        commentaire: 'Livraison planifiée'
      });
      
      // Rafraîchir la liste
      fetchReadyToDeliver();
      
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la planification de la livraison:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="text-center py-8 text-red-600">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>Demandes prêtes à livrer</CardTitle>
      </CardHeader>
      <CardContent>
        {readyToDeliver.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune demande prête à être livrée
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Matériels</th>
                <th>Demandeur</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {readyToDeliver.map(demande => (
                <tr key={demande.id}>
                  <td>
                    <ul className="space-y-1">
                      {demande.materials?.map((mat, idx) => (
                        <li key={idx} className="flex gap-2 items-center">
                          <span className="font-medium">{mat.quantity} {mat.name}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{demande.user_name}</td>
                  <td>{new Date(demande.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStockOut(
                          demande.id,
                          demande.materials[0]?.materiel_id,
                          demande.materials[0]?.quantity
                        )}
                      >
                        Sortir du stock
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlanDelivery(demande.id)}
                      >
                        Planifier livraison
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadyToDeliverTable;