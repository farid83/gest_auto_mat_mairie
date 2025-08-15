import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

const roleOptions = [
  { value: 'agent', label: 'Agent' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'gestionnaire_stock', label: 'Gestionnaire' },
  { value: 'daaf', label: 'DAAF' },
  { value: 'secretaire_executif', label: 'Secrétaire exécutif' },
  { value: 'admin', label: 'Admin' },
];

const UserForm = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'agent',
    active: true,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ name: '', email: '', role: 'agent', active: true });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Nom"
            placeholder="Nom complet"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Select value={form.role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue>{roleOptions.find(r => r.value === form.role)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              id="active"
              className="form-checkbox"
            />
            <label htmlFor="active" className="text-sm">Actif</label>
          </div>
          <DialogFooter>
            <Button type="submit">{initialData ? 'Enregistrer' : 'Ajouter'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;