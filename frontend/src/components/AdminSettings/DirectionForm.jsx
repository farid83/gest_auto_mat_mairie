import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const DirectionForm = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({ name: '', director: '' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ name: '', director: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifier une direction' : 'Ajouter une direction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Nom"
            placeholder="Nom de la direction"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="director"
            label="Directeur"
            placeholder="Nom du directeur"
            value={form.director}
            onChange={handleChange}
            required
          />
          <DialogFooter>
            <Button type="submit">{initialData ? 'Enregistrer' : 'Ajouter'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DirectionForm;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\components\AdminSettings\DirectionForm.jsx