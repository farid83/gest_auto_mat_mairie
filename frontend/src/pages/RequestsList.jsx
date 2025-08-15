import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table } from '../components/ui/table';
import { Loader2, Eye, Filter } from 'lucide-react';

const mockRequests = [
	{
		id: 1,
		materials: [
			{ name: 'Ordinateur portable', quantity: 2, justification: 'Pour le service technique' },
			{ name: 'Imprimante', quantity: 1, justification: 'Pour le secrétariat' },
		],
		status: 'En attente',
		created_at: '2025-08-10',
	},
	{
		id: 2,
		materials: [{ name: 'Bureau', quantity: 3, justification: 'Nouveaux agents' }],
		status: 'Validée',
		created_at: '2025-08-09',
	},
];

const statusColors = {
	'En attente': 'bg-orange-100 text-orange-800',
	Validée: 'bg-green-100 text-green-800',
	Rejetée: 'bg-red-100 text-red-800',
};

const RequestsList = () => {
	const [requests, setRequests] = useState([]);
	const [sortBy, setSortBy] = useState('created_at');
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

	useEffect(() => {
		setLoading(true);
		// Remplace par un appel API réel si besoin
		setTimeout(() => {
			setRequests(mockRequests);
			setLoading(false);
		}, 500);
	}, []);

	const handleSort = (field) => {
		setSortBy(field);
		setRequests((prev) =>
			[...prev].sort((a, b) => {
				if (field === 'created_at') {
					return new Date(b.created_at) - new Date(a.created_at);
				}
				return a[field].localeCompare(b[field]);
			})
		);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
			<div className="w-full max-w-4xl space-y-6">
				<Card className="shadow-xl border-0">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Liste des demandes de matériels</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleSort('created_at')}
							>
								<Filter className="w-4 h-4 mr-2" />
								Trier par date
							</Button>
						</CardTitle>
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
										<th>Matériels demandés</th>
										<th>Date</th>
										<th>État</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{requests.map((req) => (
										<tr key={req.id}>
											<td>
												<ul className="space-y-1">
													{req.materials.map((mat, idx) => (
														<li key={idx} className="flex gap-2 items-center">
															<span className="font-medium">{mat.name}</span>
															<span className="text-xs text-muted-foreground">
																x{mat.quantity}
															</span>
															<span className="text-xs italic text-gray-500">
																({mat.justification})
															</span>
														</li>
													))}
												</ul>
											</td>
											<td>{req.created_at}</td>
											<td>
												<Badge
													className={
														statusColors[req.status] ||
														'bg-gray-100 text-gray-800'
													}
												>
													{req.status}
												</Badge>
											</td>
											<td>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setSelected(req)}
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

				{/* Détail de la demande */}
				{selected && (
					<Card className="shadow-lg border-0 mt-4">
						<CardHeader>
							<CardTitle>Détail de la demande</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div>
									<strong>Matériel :</strong>{' '}
									{selected.materials.map((mat) => (
										<div key={mat.name}>{mat.name}</div>
									))}
								</div>
								<div>
									<strong>Quantité :</strong>{' '}
									{selected.materials.map((mat) => (
										<div key={mat.name}>{mat.quantity}</div>
									))}
								</div>
								<div>
									<strong>Justification :</strong>{' '}
									{selected.materials.map((mat) => (
										<div key={mat.name}>{mat.justification}</div>
									))}
								</div>
								<div>
									<strong>Date :</strong> {selected.created_at}
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
							</div>
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

export default RequestsList;