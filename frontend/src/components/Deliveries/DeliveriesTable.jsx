import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const mockDeliveries = [
  { id: 1, material: 'Ordinateur portable', quantity: 2, demandeur: 'Agent X', date: '2025-08-11', confirmed: false },
];

const DeliveriesTable = () => {
  const [deliveries, setDeliveries] = useState(mockDeliveries);

  const handleConfirm = id => {
    setDeliveries(deliveries.map(d =>
      d.id === id ? { ...d, confirmed: true } : d
    ));
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>Livraisons</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            <tr>
              <th>Matériel</th>
              <th>Quantité</th>
              <th>Demandeur</th>
              <th>Date</th>
              <th>Confirmation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(d => (
              <tr key={d.id}>
                <td>{d.material}</td>
                <td>{d.quantity}</td>
                <td>{d.demandeur}</td>
                <td>{d.date}</td>
                <td>
                  <Badge className={d.confirmed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                    {d.confirmed ? 'Confirmée' : 'En attente'}
                  </Badge>
                </td>
                <td>
                  {!d.confirmed && (
                    <Button size="sm" variant="success" onClick={() => handleConfirm(d.id)}>
                      Confirmer livraison
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DeliveriesTable;