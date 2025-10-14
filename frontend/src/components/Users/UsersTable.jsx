import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import UserForm from './UserForm';
import { usersService } from '../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

const roleLabels = {
	user: 'user',
	directeur: 'Directeur',
	gestionnaire_stock: 'Gestionnaire',
	daaf: 'DAAF',
	secretaire_executif: 'Secrétaire exécutif',
	admin: 'Admin',
};

const UsersTable = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState(undefined);
	const [activeFilter, setActiveFilter] = useState(undefined);
	const [formOpen, setFormOpen] = useState(false);
	const [editUser, setEditUser] = useState(null);

	const queryClient = useQueryClient();

	// Fetch users
	const { data: users, isLoading, error } = useQuery({
		queryKey: ['users', { search: searchTerm, role: roleFilter, active: activeFilter }],
		queryFn: () => usersService.getUsers({ search: searchTerm, role: roleFilter, active: activeFilter }),
		retry: false,
	});

	// Create user mutation
	const createUserMutation = useMutation({
		mutationFn: usersService.createUser,
		onSuccess: () => {
			queryClient.invalidateQueries(['users']);
			setFormOpen(false);
		},
	});

	// Update user mutation
	const updateUserMutation = useMutation({
		mutationFn: ({ id, data }) => usersService.updateUser(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries(['users']);
			setFormOpen(false);
		},
	});

	// Delete user mutation
	const deleteUserMutation = useMutation({
		mutationFn: usersService.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries(['users']);
		},
	});

	const handleAdd = () => {
		setEditUser(null);
		setFormOpen(true);
	};

	const handleEdit = (user) => {
		setEditUser(user);
		setFormOpen(true);
	};

	const handleSave = (userData) => {
		if (editUser) {
			updateUserMutation.mutate({ id: editUser.id, data: userData });
		} else {
			createUserMutation.mutate(userData);
		}
	};

	const handleDelete = (userId) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
			deleteUserMutation.mutate(userId);
		}
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleRoleFilter = (value) => {
		setRoleFilter(value);
	};

	const handleActiveFilter = (value) => {
		setActiveFilter(value);
	};

	//Génere le pdf

	const handleExportPDF = () => {
		const doc = new jsPDF();
		const date = new Date().toLocaleDateString('fr-FR');
		const pageWidth = doc.internal.pageSize.getWidth();

		// En-tête
		doc.setFontSize(16);
		doc.text('Liste des agents de la mairie sur la plateforme', pageWidth / 2, 20, { align: 'center' });
		doc.setFontSize(12);
		doc.text(`Date d'export : ${date}`, pageWidth - 20, 30, { align: 'right' });

		// Vérification des données
		if (!users?.data || users.data.length === 0) {
			doc.text('Aucun utilisateur à exporter.', 20, 50);
			doc.save(`liste_utilisateurs_${date.replace(/\//g, '-')}.pdf`);
			return;
		}

		// Données du tableau
		const headers = [['Nom', 'Email', 'Rôle', 'Statut']];
		const data = users.data.map(u => [
			u.name,
			u.email,
			roleLabels[u.role] || u.role,
			u.active ? 'Actif' : 'Inactif',
		]);

		// Génération du tableau
		autoTable(doc, {
			startY: 40,
			head: headers,
			body: data,
			theme: 'grid',
			styles: { font: 'helvetica', fontSize: 10 },
			headStyles: { fillColor: [41, 128, 185], textColor: 255 },
		});

		// Pied de page
		const pageCount = doc.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFontSize(10);
			doc.text(`Page ${i}/${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
			doc.text("Mairie d'Adjarra - Service Gestion du matériel", 20, doc.internal.pageSize.getHeight() - 10);
		}

		doc.save(`liste_utilisateurs_${date.replace(/\//g, '-')}.pdf`);
	};

	if (isLoading) return <div>Chargement...</div>;
	if (error) {
		if (error.response?.status === 401) {
			return <div>Erreur d'authentification. Veuillez vous reconnecter.</div>;
		}
		return <div>Erreur: {error.message}</div>;
	}

	return (
		<Card className="shadow-xl border-0">
			<CardHeader>
				<CardTitle>Gestion des utilisateurs</CardTitle>
				<div className="flex gap-2 mt-2">
					<Button size="sm" onClick={handleAdd}>
						Ajouter
					</Button>
					<Button size="sm" variant="outline" onClick={handleExportPDF}>
						Exporter
					</Button>
				</div>
				<div className="flex gap-2 mt-4">
					<Input
						placeholder="Rechercher..."
						value={searchTerm}
						onChange={handleSearch}
						className="max-w-sm"
					/>
					<Select value={roleFilter} onValueChange={handleRoleFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Rôle" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="user">user</SelectItem>
							<SelectItem value="directeur">Directeur</SelectItem>
							<SelectItem value="gestionnaire_stock">Gestionnaire</SelectItem>
							<SelectItem value="daaf">DAAF</SelectItem>
							<SelectItem value="secretaire_executif">Secrétaire exécutif</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
						</SelectContent>
					</Select>
					<Select value={activeFilter} onValueChange={handleActiveFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Statut" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="true">Actif</SelectItem>
							<SelectItem value="false">Inactif</SelectItem>
						</SelectContent>
					</Select>
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
						{users?.data?.map((u) => (
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
									<Button
										size="sm"
										variant="destructive"
										onClick={() => handleDelete(u.id)}
										disabled={deleteUserMutation.isPending}
									>
										{deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
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
				isLoading={createUserMutation.isPending || updateUserMutation.isPending}
			/>
		</Card>
	);
};

export default UsersTable;