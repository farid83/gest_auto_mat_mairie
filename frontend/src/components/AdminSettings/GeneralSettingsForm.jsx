import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

const GeneralSettingsForm = () => {
  const [form, setForm] = useState({
    mairieName: 'Mairie d’Adjarra',
    logo: '',
    color: '#2563eb',
    darkMode: false,
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
    // Enregistre les paramètres généraux
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>Paramètres généraux</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="mairieName"
            label="Nom de la mairie"
            value={form.mairieName}
            onChange={handleChange}
            required
          />
          <Input
            name="logo"
            label="Logo (URL)"
            value={form.logo}
            onChange={handleChange}
          />
          <Input
            name="color"
            label="Couleur principale"
            type="color"
            value={form.color}
            onChange={handleChange}
          />
          <div className="flex items-center space-x-2">
            <Switch
              checked={form.darkMode}
              onCheckedChange={checked => setForm(prev => ({ ...prev, darkMode: checked }))}
            />
            <span>Activer le mode sombre</span>
          </div>
          <Button type="submit">Enregistrer</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsForm;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\components\AdminSettings\GeneralSettingsForm.jsx