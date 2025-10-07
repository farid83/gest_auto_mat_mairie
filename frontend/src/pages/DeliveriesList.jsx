import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table } from '../components/ui/table';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deliveriesService } from '../services/api';

const statusColors = {
	'en_cours': 'bg-orange-100 text-orange-800',
	'livree': 'bg-green-100 text-green-800',
	'annulee': 'bg-red-100 text-red-800',
};

const DeliveriesList = () => {
	const { user } = useAuth(); // Pour récupérer le rôle
	const [deliveries, setDeliveries] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

	useEffect(() => {
		fetchDeliveries();
	}, []);

	const fetchDeliveries = async () => {
		setLoading(true);
		try {
			const response = await deliveriesService.getDeliveries();
			setDeliveries(response.livraisons || []);
		} catch (error) {
			console.error('Erreur lors de la récupération des livraisons:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleConfirm = async (id) => {
		try {
			await deliveriesService.confirmReception(id);
			setDeliveries((prev) =>
				prev.map((d) =>
					d.id === id ? { ...d, statut: 'livree', date_livraison: new Date().toISOString() } : d
				)
			);
			setSelected(null);
		} catch (error) {
			console.error('Erreur lors de la confirmation de la livraison:', error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
			<div className="w-full max-w-4xl space-y-6">
				<Card className="shadow-xl border-0">
					<CardHeader>
						<CardTitle>Livraisons reçues</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex justify-center py-8">
								<Loader2 className="w-6 h-6 animate-spin text-primary" />
							</div>
						) : (
							<Table>
								<thead>
									<tr>
										<th>Matériels livrés</th>
										<th>Date de livraison</th>
										<th>État</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{deliveries.map((delivery) => (
										<tr key={delivery.id}>
											<td>
												<ul className="space-y-1">
													{delivery.materiels?.map((mat, idx) => (
														<li key={idx} className="flex gap-2 items-center">
															<span className="font-medium">{mat.pivot.quantite_livree} {mat.name}</span>
															<span className="text-xs text-muted-foreground">
																(demandé: {mat.pivot.quantite_demandee})
															</span>
														</li>
													))}
												</ul>
											</td>
											<td>{delivery.date_livraison ? new Date(delivery.date_livraison).toLocaleDateString('fr-FR') : '-'}</td>
											<td>
												<Badge
													className={
														statusColors[delivery.statut] ||
														'bg-gray-100 text-gray-800'
													}
												>
													{delivery.statut}
												</Badge>
											</td>
											<td>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setSelected(delivery)}
													title="Voir le détail"
												>
													<Eye className="w-4 h-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Détail de la livraison */}
				{selected && (
					<Card className="shadow-lg border-0 mt-4">
						<CardHeader>
							<CardTitle>Détail de la livraison</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div>
									<strong>Matériels :</strong>
									<ul className="mt-1 space-y-1">
										{selected.materiels?.map((mat, idx) => (
											<li key={idx} className="flex gap-2 items-center">
												<span className="font-medium">{mat.pivot.quantite_livree} {mat.name}</span>
												<span className="text-xs text-muted-foreground">
													(demandé: {mat.pivot.quantite_demandee})
												</span>
											</li>
										))}
									</ul>
								</div>
								<div>
									<strong>Date de livraison :</strong> {selected.date_livraison ? new Date(selected.date_livraison).toLocaleDateString('fr-FR') : '-'}
								</div>
								<div>
									<strong>État :</strong>{' '}
									<Badge
										className={
											statusColors[selected.statut] ||
											'bg-gray-100 text-gray-800'
										}
									>
										{selected.statut}
									</Badge>
								</div>
								<div>
									<strong>Livreur :</strong> {selected.user?.name || '-'}
								</div>
								<div>
									<strong>Demande :</strong> {selected.demande?.id || '-'}
								</div>
							</div>
							{selected.statut !== 'livree' &&
								['gestionnaire_stock', 'daaf', 'admin'].includes(user.role) && (
									<div className="mt-4">
										<Button
											variant="default"
											onClick={() => handleConfirm(selected.id)}
										>
											Marquer comme livrée
										</Button>
									</div>
								)}
							<div className="mt-4">
								<Button variant="outline" onClick={() => setSelected(null)}>
									Fermer
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};

export default DeliveriesList;