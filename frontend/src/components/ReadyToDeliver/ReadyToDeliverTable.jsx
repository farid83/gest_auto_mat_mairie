import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Button } from '../ui/button';

const mockReady = [
  { id: 1, material: 'Ordinateur portable', quantity: 2, demandeur: 'Agent X', date: '2025-08-10' },
];

const ReadyToDeliverTable = () => {
  const [ready, setReady] = useState(mockReady);

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>Demandes prêtes à livrer</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            <tr>
              <th>Matériel</th>
              <th>Quantité</th>
              <th>Demandeur</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ready.map(r => (
              <tr key={r.id}>
                <td>{r.material}</td>
                <td>{r.quantity}</td>
                <td>{r.demandeur}</td>
                <td>{r.date}</td>
                <td>
                  <Button size="sm" variant="default">Sortir du stock</Button>
                  <Button size="sm" variant="outline" className="ml-2">Planifier livraison</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReadyToDeliverTable;