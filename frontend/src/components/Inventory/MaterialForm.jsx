import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { materialsService } from '../../services/api';

const categories = [
  { value: 'Informatique', label: 'Informatique' },
  { value: 'Équipement', label: 'Équipement' },
  { value: 'Fourniture', label: 'Fourniture' },
  { value: 'Hygiène', label: 'Hygiène' },
  { value: 'Papeterie', label: 'Papeterie' },
  { value: 'Sécurité', label: 'Sécurité' },
  { value: 'Divers', label: 'Divers' },
];

const etats = [
  { value: 'Bon', label: 'Bon' },
  { value: 'À réparer', label: 'À réparer' },
  { value: 'HS', label: 'Hors service' },
];

const MaterialForm = ({ open, onClose, onSave, initialData }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nom: '',
    categorie: 'Divers',
    quantite_totale: 1,
    quantite_disponible: 1,
    etat: 'Bon',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        quantite_totale: Number(initialData.quantite_totale),
        quantite_disponible: Number(initialData.quantite_disponible),
      });
    } else {
      setForm(prev => ({
        ...prev,
        quantite_disponible: prev.quantite_totale,
      }));
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = name.includes('quantite') ? Number(value) : value;

    setForm(prev => ({
      ...prev,
      [name]: numericValue,
      ...(name === 'quantite_totale' ? { quantite_disponible: numericValue } : {}),
    }));
  };

  const handleCategoryChange = (value) => setForm(prev => ({ ...prev, categorie: value }));
  const handleEtatChange = (value) => setForm(prev => ({ ...prev, etat: value }));

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.quantite_totale <= 0 || form.quantite_disponible < 0) {
      toast.error('Les quantités doivent être positives.');
      return;
    }

    if (form.quantite_totale < form.quantite_disponible) {
      toast.error('La quantité totale doit être supérieure ou égale à la quantité disponible.');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const payload = { ...form };

      if (initialData) {
        await materialsService.updateMaterial(form.id, payload);
        toast.success('Matériel modifié avec succès !');
      } else {
        const materialsList = await materialsService.getMaterials();
        const exists = materialsList.some(
          m => m.nom.toLowerCase() === form.nom.toLowerCase()
        );

        if (exists) {
          toast.error('Un matériel avec ce nom existe déjà !');
          return;
        }

        await materialsService.createMaterial(payload);
        toast.success('Matériel ajouté avec succès !');
      }

      setForm({
        nom: '',
        categorie: 'Divers',
        quantite_totale: 1,
        quantite_disponible: 1,
        etat: 'Bon',
      });

      onClose();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde du matériel', error);
      toast.error(error.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;
  const isAdmin = user.role === 'admin';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le matériel' : 'Ajouter un matériel'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="nom"
            label="Nom du matériel"
            placeholder="Entrez le nom du matériel"
            value={form.nom}
            onChange={handleChange}
            required
            disabled={isEdit && !isAdmin}
          />

          <div>
            <label className="block mb-1 font-medium">Catégorie</label>
            <Select value={form.categorie || "Divers"} onValueChange={handleCategoryChange} disabled={isEdit && !isAdmin} required>
              <SelectTrigger>
                <SelectValue>{categories.find(c => c.value === form.categorie)?.label || "Divers"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Quantité</label>
            <Input
              name="quantite_totale"
              label="Quantité totale"
              type="number"
              min="1"
              value={form.quantite_totale}
              onChange={handleChange}
              required
              disabled={isEdit && !isAdmin}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Quantité disponible</label>
            <Input
              name="quantite_disponible"
              label="Quantité disponible"
              type="number"
              min="0"
              value={form.quantite_disponible}
              disabled
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">État</label>
            <Select value={form.etat || "Bon"} onValueChange={handleEtatChange} disabled={isEdit && !isAdmin} required>
              <SelectTrigger>
                <SelectValue>{etats.find(e => e.value === form.etat)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {etats.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isEdit && !isAdmin}>
              {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Ajouter'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          </DialogFooter>
        </form>

        {isEdit && !isAdmin && (
          <div className="mt-2 text-sm text-orange-600">
            Seul l'administrateur peut modifier ce matériel.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaterialForm;
