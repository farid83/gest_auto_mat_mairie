import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import UserForm from './UserForm';
import { usersService,  } from '../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';


const roleLabels = {
	user: 'user',
	directeur: 'Directeur',
	gestionnaire_stock: 'Gestionnaire',
	daaf: 'DAAF',
	secretaire_executif: 'Secrétaire exécutif',
	admin: 'Admin',
};




const UsersTable = () => {
	const [searchInput, setSearchInput] = useState(''); // Valeur saisie immédiatement
	const [searchTerm, setSearchTerm] = useState(''); // Valeur avec debounce pour la requête
	const [roleFilter, setRoleFilter] = useState(undefined);
	const [activeFilter, setActiveFilter] = useState(undefined);
	const [formOpen, setFormOpen] = useState(false);
	const [editUser, setEditUser] = useState(null);

	const [page, setPage] = useState(1);
const perPage = 15;
	const queryClient = useQueryClient();

	// Debounce pour la recherche (500ms)
	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchTerm(searchInput);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchInput]);

	// Fetch users
	const { data: users, isLoading, isFetching, error } = useQuery({
		queryKey: ['users', searchTerm, roleFilter, activeFilter, page],
		queryFn: () => usersService.getUsers({
			search: searchTerm,
			role: roleFilter,
			active: activeFilter,
			page,
			per_page: perPage,
		}),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Create user mutation
	const createUserMutation = useMutation({
		mutationFn: usersService.createUser,
		onSuccess: () => {
			queryClient.invalidateQueries(['users']);
			toast.success('Utilisateur créé avec succès !');
			setFormOpen(false);
			setEditUser(null);
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
		},
	});

	// Update user mutation
	const updateUserMutation = useMutation({
		mutationFn: ({ id, data }) => usersService.updateUser(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries(['users']);
			toast.success('Utilisateur modifié avec succès !');
			setFormOpen(false);
			setEditUser(null);
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Erreur lors de la modification de l\'utilisateur');
		},
	});

	// Delete user mutation
	const deleteUserMutation = useMutation({
		mutationFn: usersService.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries(['users']);
			toast.success('Utilisateur supprimé avec succès !');
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
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

	const handleSave = async (userData) => {
		try {
			if (editUser) {
				await updateUserMutation.mutateAsync({ id: editUser.id, data: userData });
			} else {
				await createUserMutation.mutateAsync(userData);
			}
		} catch (error) {
			// Les erreurs sont déjà gérées dans onError
			throw error;
		}
	};

	const handleDelete = (userId) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
			deleteUserMutation.mutate(userId);
		}
	};

	const handleSearch = (e) => {
		setSearchInput(e.target.value);
	};

	const handleRoleFilter = (value) => {
		setRoleFilter(value === 'all' ? undefined : value);
	};

	const handleActiveFilter = (value) => {
		setActiveFilter(value === 'all' ? undefined : value);
	};

	const handleResetFilters = () => {
		setSearchInput('');
		setSearchTerm('');
		setRoleFilter(undefined);
		setActiveFilter(undefined);
	};

	// Génère le pdf
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
			toast.info('PDF exporté (aucun utilisateur trouvé)');
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
		toast.success('PDF exporté avec succès !');
	};

	// Gestion des erreurs
	if (error) {
		if (error.response?.status === 401) {
			return (
				<Card className="shadow-xl border-0">
					<CardContent className="py-12">
						<div className="text-center text-red-600">
							<p className="text-lg font-semibold">Erreur d'authentification</p>
							<p className="text-sm mt-2">Veuillez vous reconnecter.</p>
						</div>
					</CardContent>
				</Card>
			);
		}
		return (
			<Card className="shadow-xl border-0">
				<CardContent className="py-12">
					<div className="text-center text-red-600">
						<p className="text-lg font-semibold">Erreur de chargement</p>
						<p className="text-sm mt-2">{error.message}</p>
						<Button className="mt-4" onClick={() => queryClient.invalidateQueries(['users'])}>
							Réessayer
						</Button>
					</div>
				</CardContent>
			</Card>

		);
	}

	// Chargement initial
	if (isLoading) {
		return (
			<Card className="shadow-xl border-0">
				<CardContent className="py-12 flex flex-col items-center justify-center">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
					<p className="text-gray-600">Chargement des utilisateurs...</p>
				</CardContent>
			</Card>
		);
	}

	// Aucune donnée
	if (!users?.data || users.data.length === 0) {
		return (
			<Card className="shadow-xl border-0">
				<CardContent className="py-12 text-center">
					<p className="text-gray-600 mb-4">Aucun utilisateur trouvé.</p>
					<Button onClick={handleAdd}>Ajouter un utilisateur</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="shadow-xl border-0">
			<CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<CardTitle className="text-xl font-bold">Gestion des utilisateurs</CardTitle>

				<div className="flex flex-wrap gap-2 items-center">
					<Input
						placeholder="Rechercher..."
						value={searchInput}
						onChange={handleSearch}
						className="w-48"
					/>
					{isFetching && (
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
					)}

					<Select onValueChange={handleRoleFilter} value={roleFilter || 'all'}>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Filtrer par rôle" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les rôles</SelectItem>
							{Object.entries(roleLabels).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select onValueChange={handleActiveFilter} value={activeFilter || 'all'}>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Filtrer par statut" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les statuts</SelectItem>
							<SelectItem value="true">Actifs</SelectItem>
							<SelectItem value="false">Inactifs</SelectItem>
						</SelectContent>
					</Select>

					{(roleFilter || activeFilter || searchTerm) && (
						<Button variant="outline" onClick={handleResetFilters}>
							Réinitialiser
						</Button>
					)}

					<Button onClick={handleExportPDF}>Exporter PDF</Button>
					<Button onClick={handleAdd}>Ajouter</Button>
				</div>
			</CardHeader>

			<CardContent>
				<p className="text-sm text-gray-600 mb-3">
					{users.data.length} utilisateur{users.data.length > 1 ? 's' : ''} trouvé{users.data.length > 1 ? 's' : ''}.
				</p>

				<Table>
					<thead>
						<tr className="text-left border-b">
							<th className="py-2 px-3">Nom</th>
							<th className="py-2 px-3">Email</th>
							<th className="py-2 px-3">Rôle</th>
							<th className="py-2 px-3">Statut</th>
							<th className="py-2 px-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.data.map((user) => (
							<tr key={user.id} className="border-b hover:bg-gray-50 transition">
								<td className="py-2 px-3">{user.name}</td>
								<td className="py-2 px-3">{user.email}</td>
								<td className="py-2 px-3">{roleLabels[user.role] || user.role}</td>
								<td className="py-2 px-3">
									<Badge variant={user.active ? 'success' : 'destructive'}>
										{user.active ? 'Actif' : 'Inactif'}
									</Badge>
								</td>
								<td className="py-2 px-3 text-right flex gap-2 justify-end">
									<Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
										Modifier
									</Button>
									<Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
										Supprimer
									</Button>
								</td>
							</tr>
						))}

					</tbody>

				</Table>
			 
			{/* Pagination */}
			{users.total > perPage && (
				<div className="flex justify-end mt-4 space-x-2">	
					<Button
						variant="outline"	
						disabled={page === 1}	
						onClick={() => setPage((prev) => Math.max(prev - 1, 1))}	
					>
						Précédent
					</Button>	
					<span className="flex items-center">Page {page} / {Math.ceil(users.total / perPage)}</span>
					<Button
						variant="outline"
						disabled={page === Math.ceil(users.total / perPage)}
						onClick={() => setPage((prev) => prev + 1)}
					>
						Suivant
					</Button>
				</div>
			)}


			</CardContent>

			{formOpen && (
				<UserForm
					open={formOpen}
					onClose={() => {
						setFormOpen(false);
						setEditUser(null);
					}}
					onSave={handleSave}
					editUser={editUser}
				/>
			)}
		</Card>
	);
};

export default UsersTable;
