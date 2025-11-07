import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { useQuery } from '@tanstack/react-query';
import { usersService, directionsService, servicesService } from '../../services/api';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'user', label: 'user' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'gestionnaire_stock', label: 'Gestionnaire' },
  { value: 'daaf', label: 'DAAF' },
  { value: 'secretaire_executif', label: 'Secrétaire exécutif' },
  { value: 'admin', label: 'Admin' },
];

const UserForm = ({ open, onClose, onSave, initialData, isLoading }) => {
  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true,
    service_id: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch services basés sur une direction/service selectionné(e)
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: servicesService.getServices,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        password: '',
        role: initialData.role ?? 'user',
        active: typeof initialData.active === 'boolean' ? initialData.active : true,
        service_id: initialData.service_id ?? undefined,
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true,
        service_id: undefined,
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleChange = (value) => setForm((prev) => ({ ...prev, role: value }));
  const handleDirectionChange = (value) => setForm((prev) => ({ ...prev, service_id: value }));

  const servicesList = Array.isArray(services) ? services : (services?.data ?? []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validation mot de passe si rempli
      if (form.password && form.password.length < 8) {
        setErrors({ password: 'Le mot de passe doit contenir au moins 8 caractères.' });
        toast.error('Le mot de passe doit contenir au moins 8 caractères.');
        setIsSubmitting(false);
        return;
      }

      const formData = { ...form };

      if (initialData) {
        // update user: si password vide => ne pas l'envoyer
        if (!formData.password) {
          delete formData.password;
        } else {
          // si mot de passe fourni, appeler endpoint dédié
          try {
            await usersService.updatePassword(initialData.id, formData.password);
            toast.success('Mot de passe mis à jour avec succès !');
            delete formData.password;
          } catch (pwErr) {
            const errorMsg = pwErr?.message || 'Erreur lors de la mise à jour du mot de passe.';
            setErrors({ password: errorMsg });
            toast.error(errorMsg);
            setIsSubmitting(false);
            return;
          }
        }
        
        await onSave(formData);
        toast.success('Utilisateur modifié avec succès !');
      } else {
        // création : password requis
        if (!formData.password) {
          setErrors({ password: 'Le mot de passe est requis.' });
          toast.error('Le mot de passe est requis.');
          setIsSubmitting(false);
          return;
        }
        
        await onSave(formData);
        toast.success('Utilisateur ajouté avec succès !');
      }

      // Réinitialiser le formulaire après succès
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true,
        service_id: undefined,
      });

      onClose();
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire utilisateur:', err);
      const errorMsg = err?.message || 'Erreur lors de la soumission.';
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
        </DialogHeader>

        <DialogDescription className="sr-only">
          Formulaire pour créer ou modifier un utilisateur. Laisser le mot de passe vide pour ne pas le modifier.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && <div className="text-red-600 text-sm">{errors.form}</div>}

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

          <Input
            name="password"
            label={initialData ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            type="password"
            placeholder={initialData ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            value={form.password}
            onChange={handleChange}
            required={!initialData}
          />
          {errors.password && <div className="text-red-600 text-sm">{errors.password}</div>}

          <Select value={form.role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue>{roleOptions.find((r) => r.value === form.role)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={form.service_id ? String(form.service_id) : ''}
            onValueChange={(value) => setForm((prev) => ({ ...prev, service_id: Number(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              {servicesList.map((service) => (
                <SelectItem key={service.id} value={String(service.id)}>
                  {service.name}
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
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) ? 'Enregistrement...' : (initialData ? 'Enregistrer' : 'Ajouter')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;