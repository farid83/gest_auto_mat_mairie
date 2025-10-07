import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';
import { deliveriesService } from '../../services/api';

const DeliveriesTable = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveriesService.getDeliveries();
      setDeliveries(response.livraisons || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des livraisons:', err);
      setError('Impossible de charger les livraisons');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await deliveriesService.confirmReception(id);
      setDeliveries(prev => prev.map(d =>
        d.id === id ? { ...d, statut: 'livree', date_livraison: new Date().toISOString() } : d
      ));
    } catch (err) {
      console.error('Erreur lors de la confirmation de la livraison:', err);
    }
  };

  const statusColors = {
    'en_cours': 'bg-orange-100 text-orange-800',
    'livree': 'bg-green-100 text-green-800',
    'annulee': 'bg-red-100 text-red-800',
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
        <CardTitle>Livraisons</CardTitle>
      </CardHeader>
      <CardContent>
        {deliveries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune livraison en cours
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Matériels</th>
                <th>Date de création</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(d => (
                <tr key={d.id}>
                  <td>
                    <ul className="space-y-1">
                      {d.materiels?.map((mat, idx) => (
                        <li key={idx} className="flex gap-2 items-center">
                          <span className="font-medium">{mat.pivot.quantite_livree} {mat.name}</span>
                          <span className="text-xs text-muted-foreground">
                            (demandé: {mat.pivot.quantite_demandee})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <Badge className={statusColors[d.statut] || 'bg-gray-100 text-gray-800'}>
                      {d.statut}
                    </Badge>
                  </td>
                  <td>
                    {d.statut !== 'livree' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleConfirm(d.id)}
                      >
                        Marquer comme livrée
                      </Button>
                    )}
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

export default DeliveriesTable;