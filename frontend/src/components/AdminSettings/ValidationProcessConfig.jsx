import React, { useState } from 'react';
import DragAndDropList from './DragAndDropList';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const mockSteps = [
  { id: 1, name: 'Directeur', enabled: true, delay: 2 },
  { id: 2, name: 'Gestionnaire', enabled: true, delay: 1 },
  { id: 3, name: 'DAAF', enabled: true, delay: 3 },
  { id: 4, name: 'Secrétaire exécutif', enabled: true, delay: 1 },
];

const ValidationProcessConfig = () => {
  const [steps, setSteps] = useState(mockSteps);

  const handleOrderChange = (newOrder) => setSteps(newOrder);

  const handleToggle = (id) => {
    setSteps(steps.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleDelayChange = (id, value) => {
    setSteps(steps.map(s => s.id === id ? { ...s, delay: Number(value) } : s));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Paramètres du processus de validation</h2>
      <DragAndDropList items={steps} onOrderChange={handleOrderChange}>
        {(step) => (
          <div className="flex items-center gap-4 p-2 border rounded mb-2 bg-muted/50">
            <span className="flex-1">{step.name}</span>
            <Switch checked={step.enabled} onCheckedChange={() => handleToggle(step.id)} />
            <Input
              type="number"
              min="1"
              value={step.delay}
              onChange={e => handleDelayChange(step.id, e.target.value)}
              className="w-20"
              placeholder="Délai (j)"
            />
          </div>
        )}
      </DragAndDropList>
      <Button className="mt-4">Enregistrer</Button>
    </div>
  );
};

export default ValidationProcessConfig;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\components\AdminSettings\ValidationProcessConfig.jsx