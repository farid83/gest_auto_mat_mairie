import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const categoryOptions = [
	{ value: 'informatique', label: 'Informatique' },
	{ value: 'mobilier', label: 'Mobilier' },
	{ value: 'consommable', label: 'Consommable' },
	{ value: 'autre', label: 'Autre' },
];

const stateOptions = [
	{ value: 'Bon', label: 'Bon' },
	{ value: 'À réparer', label: 'À réparer' },
	{ value: 'HS', label: 'Hors service' },
];

const MaterialForm = ({ open, onClose, onSave, initialData }) => {
	const { user } = useAuth();
	const [form, setForm] = useState({
		name: '',
		category: 'informatique',
		total: 1,
		available: 1,
		state: 'Bon',
	});

	useEffect(() => {
		if (initialData) setForm(initialData);
		else setForm({ name: '', category: 'informatique', total: 1, available: 1, state: 'Bon' });
	}, [initialData, open]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: name === 'total' || name === 'available' ? Number(value) : value,
		}));
	};

	const handleCategoryChange = (value) => setForm((prev) => ({ ...prev, category: value }));
	const handleStateChange = (value) => setForm((prev) => ({ ...prev, state: value }));

	const handleSubmit = (e) => {
		e.preventDefault();
		// Gestionnaire : message d'alerte si données douteuses
		if (user.role === 'gestionnaire_stock' && (form.total < form.available || form.total <= 0)) {
			toast.error('Vérifiez les quantités : la quantité totale doit être supérieure ou égale à la disponible et positive.');
			return;
		}
		onSave(form);
		toast.success(initialData ? 'Matériel modifié avec succès !' : 'Matériel ajouté avec succès !');
	};

	// Seul l'admin peut modifier si initialData existe
	const isEdit = !!initialData;
	const isAdmin = user.role === 'admin';
	const isGestionnaire = user.role === 'gestionnaire_stock';

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Modifier un matériel' : 'Ajouter un matériel'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						name="name"
						label="Nom"
						placeholder="Nom du matériel"
						value={form.name}
						onChange={handleChange}
						required
						disabled={isEdit && !isAdmin}
					/>
					<Select value={form.category} onValueChange={handleCategoryChange} disabled={isEdit && !isAdmin}>
						<SelectTrigger>
							<SelectValue>{categoryOptions.find(c => c.value === form.category)?.label}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{categoryOptions.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						name="total"
						label="Quantité totale"
						type="number"
						min="1"
						value={form.total}
						onChange={handleChange}
						required
						disabled={isEdit && !isAdmin}
					/>
					<Input
						name="available"
						label="Disponible"
						type="number"
						min="0"
						value={form.available}
						onChange={handleChange}
						required
						disabled={isEdit && !isAdmin}
					/>
					<Select value={form.state} onValueChange={handleStateChange} disabled={isEdit && !isAdmin}>
						<SelectTrigger>
							<SelectValue>{stateOptions.find(s => s.value === form.state)?.label}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{stateOptions.map((state) => (
								<SelectItem key={state.value} value={state.value}>
									{state.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<DialogFooter>
						<Button type="submit" disabled={isEdit && !isAdmin}>
							{isEdit ? 'Enregistrer' : 'Ajouter'}
						</Button>
						<Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
					</DialogFooter>
				</form>
				{/* Message d'avertissement pour le gestionnaire lors de l'ajout */}
				{!isEdit && isGestionnaire && (
					<div className="mt-2 text-sm text-orange-600">
						Attention : vérifiez bien les informations saisies.<br />
						Vous ne pourrez pas modifier ce matériel après validation.<br />
						Si une erreur est détectée, contactez l'administrateur.
					</div>
				)}
				{/* Message pour modification admin uniquement */}
				{isEdit && !isAdmin && (
					<div className="mt-2 text-sm text-orange-600">
						Seul l'administrateur peut modifier les informations du matériel.
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default MaterialForm;