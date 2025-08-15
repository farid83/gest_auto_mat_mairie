import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table } from '../ui/table';
import { Badge } from '../ui/badge';
import MaterialForm from './MaterialForm';

const mockInventory = [
	{
		id: 1,
		name: 'Ordinateur portable',
		category: 'Informatique',
		total: 10,
		available: 7,
		state: 'Bon',
	},
	{
		id: 2,
		name: 'Imprimante',
		category: 'Informatique',
		total: 5,
		available: 2,
		state: 'À réparer',
	},
	{
		id: 3,
		name: 'Bureau',
		category: 'Mobilier',
		total: 20,
		available: 18,
		state: 'Bon',
	},
];

const stateColors = {
	Bon: 'bg-green-100 text-green-800',
	'À réparer': 'bg-orange-100 text-orange-800',
	HS: 'bg-red-100 text-red-800',
};

const InventoryTable = () => {
	const [inventory, setInventory] = useState(mockInventory);
	const [formOpen, setFormOpen] = useState(false);
	const [editMaterial, setEditMaterial] = useState(null);

	const handleAdd = () => {
		setEditMaterial(null);
		setFormOpen(true);
	};

	const handleEdit = (material) => {
		setEditMaterial(material);
		setFormOpen(true);
	};

	const handleSave = (materialData) => {
		// Ajoute ou modifie le matériel dans ton state ou via API
		setFormOpen(false);
	};

	return (
		<Card className="shadow-xl border-0">
			<CardHeader>
				<CardTitle>Inventaire des matériels</CardTitle>
				<div className="flex gap-2 mt-2">
					<Button size="sm" onClick={handleAdd}>
						Ajouter
					</Button>
					<Button size="sm" variant="outline">
						Exporter
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<thead>
						<tr>
							<th>Nom</th>
							<th>Catégorie</th>
							<th>Quantité totale</th>
							<th>Disponible</th>
							<th>État</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{inventory.map((item) => (
							<tr key={item.id}>
								<td>{item.name}</td>
								<td>{item.category}</td>
								<td>{item.total}</td>
								<td>{item.available}</td>
								<td>
									<Badge
										className={
											stateColors[item.state] ||
											'bg-gray-100 text-gray-800'
										}
									>
										{item.state}
									</Badge>
								</td>
								<td>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => handleEdit(item)}
									>
										Modifier
									</Button>
									<Button size="sm" variant="destructive">
										Supprimer
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</CardContent>
			<MaterialForm
				open={formOpen}
				onClose={() => setFormOpen(false)}
				onSave={handleSave}
				initialData={editMaterial}
			/>
		</Card>
	);
};

export default InventoryTable;