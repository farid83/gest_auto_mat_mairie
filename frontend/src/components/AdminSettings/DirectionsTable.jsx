import React, { useState } from 'react';
import { Table } from '../ui/table';
import { Button } from '../ui/button';
import DirectionForm from './DirectionForm';
import { Badge } from '../ui/badge';

const mockDirections = [
  { id: 1, name: 'Direction Générale', director: 'Marie Koffi' },
  { id: 2, name: 'DAAF', director: 'Fatou Tomiyo' },
];

const DirectionsTable = () => {
  const [directions, setDirections] = useState(mockDirections);
  const [formOpen, setFormOpen] = useState(false);
  const [editDirection, setEditDirection] = useState(null);

  const handleAdd = () => {
    setEditDirection(null);
    setFormOpen(true);
  };

  const handleEdit = (dir) => {
    setEditDirection(dir);
    setFormOpen(true);
  };

  const handleSave = (data) => {
    // Ajoute ou modifie la direction dans ton state ou via API
    setFormOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Gestion des directions</h2>
        <Button size="sm" onClick={handleAdd}>Ajouter</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Directeur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {directions.map(dir => (
            <tr key={dir.id}>
              <td>{dir.name}</td>
              <td>
                <Badge className="bg-blue-100 text-blue-800">{dir.director}</Badge>
              </td>
              <td>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(dir)}>Modifier</Button>
                <Button size="sm" variant="destructive">Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <DirectionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editDirection}
      />
    </div>
  );
};

export default DirectionsTable;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\components\AdminSettings\DirectionsTable.jsx