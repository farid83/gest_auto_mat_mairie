import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Input } from '../ui/input';

const mockMovements = [
  { id: 1, type: 'Entrée', material: 'Ordinateur portable', quantity: 3, user: 'Gestionnaire', date: '2025-08-10' },
  { id: 2, type: 'Sortie', material: 'Imprimante', quantity: 1, user: 'DAAF', date: '2025-08-09' },
];

const StockMovementsTable = () => {
  const [movements, setMovements] = useState(mockMovements);
  const [filter, setFilter] = useState('');

  const filtered = movements.filter(m =>
    m.material.toLowerCase().includes(filter.toLowerCase()) ||
    m.user.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>Mouvements de stock</CardTitle>
        <Input
          placeholder="Filtrer par matériel ou utilisateur"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="mt-2 w-64"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Matériel</th>
              <th>Quantité</th>
              <th>Utilisateur</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td>{m.type}</td>
                <td>{m.material}</td>
                <td>{m.quantity}</td>
                <td>{m.user}</td>
                <td>{m.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StockMovementsTable;