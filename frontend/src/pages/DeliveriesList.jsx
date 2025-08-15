import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table } from '../components/ui/table';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const mockDeliveries = [
	{
		id: 1,
		materials: [
			{ name: 'Ordinateur portable', quantity: 2 },
			{ name: 'Imprimante', quantity: 1 },
		],
		delivered_at: '2025-08-10',
		status: 'En attente de confirmation',
		confirmed: false,
	},
	{
		id: 2,
		materials: [{ name: 'Bureau', quantity: 3 }],
		delivered_at: '2025-08-09',
		status: 'Livré',
		confirmed: true,
	},
];

const statusColors = {
	'En attente de confirmation': 'bg-orange-100 text-orange-800',
	Livré: 'bg-green-100 text-green-800',
};

const DeliveriesList = () => {
	const { user } = useAuth(); // Pour récupérer le rôle
	const [deliveries, setDeliveries] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

	useEffect(() => {
		setLoading(true);
		// Remplace par un appel API réel si besoin
		setTimeout(() => {
			setDeliveries(mockDeliveries);
			setLoading(false);
		}, 500);
	}, []);

	const handleConfirm = (id) => {
		setDeliveries((prev) =>
			prev.map((d) =>
				d.id === id ? { ...d, status: 'Livré', confirmed: true } : d
			)
		);
		setSelected(null);
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
													{delivery.materials.map((mat, idx) => (
														<li key={idx} className="flex gap-2 items-center">
															<span className="font-medium">{mat.name}</span>
															<span className="text-xs text-muted-foreground">
																x{mat.quantity}
															</span>
														</li>
													))}
												</ul>
											</td>
											<td>{delivery.delivered_at}</td>
											<td>
												<Badge
													className={
														statusColors[delivery.status] ||
														'bg-gray-100 text-gray-800'
													}
												>
													{delivery.status}
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
										{selected.materials.map((mat, idx) => (
											<li key={idx} className="flex gap-2 items-center">
												<span className="font-medium">{mat.name}</span>
												<span className="text-xs text-muted-foreground">
													x{mat.quantity}
												</span>
											</li>
										))}
									</ul>
								</div>
								<div>
									<strong>Date de livraison :</strong> {selected.delivered_at}
								</div>
								<div>
									<strong>État :</strong>{' '}
									<Badge
										className={
											statusColors[selected.status] ||
											'bg-gray-100 text-gray-800'
										}
									>
										{selected.status}
									</Badge>
								</div>
								<div>
									<strong>Confirmation :</strong>{' '}
									{selected.confirmed ? (
										<span className="text-green-600 flex items-center">
											<CheckCircle className="w-4 h-4 mr-1" /> Envoi confirmé
										</span>
									) : (
										<span className="text-orange-600 flex items-center">
											<XCircle className="w-4 h-4 mr-1" /> Non confirmé
										</span>
									)}
								</div>
							</div>
							{!selected.confirmed &&
								['gestionnaire_stock', 'daaf', 'admin'].includes(user.role) && (
									<div className="mt-4">
										<Button
											variant="default"
											onClick={() => handleConfirm(selected.id)}
										>
											Confirmer l’envoi de la livraison
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