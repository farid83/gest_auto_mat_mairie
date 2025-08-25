import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import UserForm from './UserForm';

const mockUsers = [
	{ id: 3, name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'user', active: true },
	{ id: 2, name: 'Marie Koffi', email: 'marie.koffi@adjarra.bj', role: 'directeur', active: true },
	{ id: 3, name: 'Pierre Akoka', email: 'pierre.akoka@adjarra.bj', role: 'gestionnaire_stock', active: true },
	{ id: 4, name: 'Fatou Tomiyo', email: 'fatou.tomiyo@adjarra.bj', role: 'daaf', active: false },
	{ id: 5, name: 'Ahmed Soumanou', email: 'ahmed.soumanou@adjarra.bj', role: 'secretaire_executif', active: true },
];

const roleLabels = {
	agent: 'Agent',
	directeur: 'Directeur',
	gestionnaire_stock: 'Gestionnaire',
	daaf: 'DAAF',
	secretaire_executif: 'Secrétaire exécutif',
	admin: 'Admin',
};

const UsersTable = () => {
	const [users, setUsers] = useState(mockUsers);
	const [formOpen, setFormOpen] = useState(false);
	const [editUser, setEditUser] = useState(null);

	const handleAdd = () => {
		setEditUser(null);
		setFormOpen(true);
	};

	const handleEdit = (user) => {
		setEditUser(user);
		setFormOpen(true);
	};

	const handleSave = (userData) => {
		// Ajoute ou modifie l'utilisateur dans ton state ou via API
		setFormOpen(false);
	};

	return (
		<Card className="shadow-xl border-0">
			<CardHeader>
				<CardTitle>Gestion des utilisateurs</CardTitle>
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
							<th>Email</th>
							<th>Rôle</th>
							<th>Statut</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u.id}>
								<td>{u.name}</td>
								<td>{u.email}</td>
								<td>
									<Badge className="bg-blue-100 text-blue-800">
										{roleLabels[u.role] || u.role}
									</Badge>
								</td>
								<td>
									<Badge
										className={
											u.active
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'
										}
									>
										{u.active ? 'Actif' : 'Inactif'}
									</Badge>
								</td>
								<td>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => handleEdit(u)}
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
			<UserForm
				open={formOpen}
				onClose={() => setFormOpen(false)}
				onSave={handleSave}
				initialData={editUser}
			/>
		</Card>
	);
};

export default UsersTable;