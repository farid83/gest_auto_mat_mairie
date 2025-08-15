import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const StockSettingsForm = () => {
  const [form, setForm] = useState({
    minThreshold: 5,
    categories: 'Informatique, Mobilier, Consommable',
    alerts: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enregistre les paramètres
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>Paramètres du stock</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="minThreshold"
            type="number"
            min="1"
            label="Seuil minimum"
            value={form.minThreshold}
            onChange={handleChange}
            required
          />
          <Input
            name="categories"
            label="Catégories de matériel"
            value={form.categories}
            onChange={handleChange}
            required
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="alerts"
              checked={form.alerts}
              onChange={handleChange}
              id="alerts"
              className="form-checkbox"
            />
            <label htmlFor="alerts" className="text-sm">Activer les alertes automatiques</label>
          </div>
          <Button type="submit">Enregistrer</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockSettingsForm;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\components\AdminSettings\StockSettingsForm.jsx