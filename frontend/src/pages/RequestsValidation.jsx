import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';

const userRole = "Directeur"; // À changer pour tester chaque rôle

const mockRequests = [
	{
		id: 1,
		materials: [
			{
				name: 'Ordinateur portable',
				quantity: 2,
				justification: 'Pour le service technique',
				steps: [
					{ role: 'Directeur', status: 'en attente', date: null },
					{ role: 'Gestionnaire matériel', status: 'en attente', date: null, proposal: null },
					{ role: 'DAAF', status: 'en attente', date: null, proposal: null },
					{ role: 'Secrétaire exécutive', status: 'en attente', date: null },
				],
			},
			{
				name: 'Imprimante',
				quantity: 1,
				justification: 'Pour le secrétariat',
				steps: [
					{ role: 'Directeur', status: 'en attente', date: null },
					{ role: 'Gestionnaire matériel', status: 'en attente', date: null, proposal: null },
					{ role: 'DAAF', status: 'en attente', date: null, proposal: null },
					{ role: 'Secrétaire exécutive', status: 'en attente', date: null },
				],
			},
		],
		created_at: '2025-08-10',
		status: 'En attente',
	},
];

const statusColors = {
	validé: 'bg-green-100 text-green-800',
	rejeté: 'bg-red-100 text-red-800',
	'en attente': 'bg-orange-100 text-orange-800',
};

const rolesWithProposal = ['Gestionnaire matériel', 'DAAF'];

const RequestsValidation = () => {
	// Pour le test, on affiche tous les boutons
	const [requests, setRequests] = useState(mockRequests);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(false);
	const [proposals, setProposals] = useState({}); // {stepIdx: value}

	// Gère la proposition de quantité
	const handleProposalChange = (stepIdx, value) => {
		setProposals((prev) => ({
			...prev,
			[stepIdx]: value,
		}));
	};

	// Simule la validation/rejet d'une étape
	const handleAction = (requestId, idxMat, idxStep, action) => {
		setLoading(true);
		setTimeout(() => {
			setRequests((prev) =>
				prev.map((req) =>
					req.id === requestId
						? {
								...req,
								materials: req.materials.map((mat, mIdx) =>
									mIdx === idxMat
										? {
												...mat,
												steps: mat.steps.map((step, sIdx) =>
													sIdx === idxStep
														? {
																...step,
																status: action,
																date: new Date().toISOString().slice(0, 10),
																proposal:
																	rolesWithProposal.includes(step.role) &&
																	proposals[`${idxMat}_${idxStep}`]
																		? Number(proposals[`${idxMat}_${idxStep}`])
																		: step.proposal,
														  }
														: step
												),
										  }
										: mat
								),
						  }
						: req
				)
			);
			setLoading(false);
			setSelected(null);
			setProposals({});
		}, 800);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
			<div className="w-full max-w-4xl space-y-6">
				<Card className="shadow-xl border-0">
					<CardHeader>
						<CardTitle>Demandes à valider</CardTitle>
						<CardDescription>
							Suivez et validez les demandes selon le processus mairie
						</CardDescription>
					</CardHeader>
					<CardContent>
						<table className="w-full text-sm">
							<thead>
								<tr className="text-center">
									<th className="text-center">Matériels demandés</th>
									<th className="text-center">Date</th>
									<th className="text-center">Statut</th>
									<th className="text-center">Action</th>
								</tr>
							</thead>
							<tbody>
								{requests.map((req) => (
									<tr key={req.id} className="text-center">
										<td className="align-middle">
											<ul className="space-y-1">
												{req.materials.map((mat, idx) => (
													<li key={idx} className="flex justify-center gap-2 items-center">
														<span className="font-medium">{mat.name}</span>
														<span className="text-xs text-muted-foreground">x{mat.quantity}</span>
													</li>
												))}
											</ul>
										</td>
										<td className="align-middle">{req.created_at}</td>
										<td className="align-middle">
											<Badge className={statusColors[req.status] || 'bg-gray-100 text-gray-800'}>
												{req.status}
											</Badge>
										</td>
										<td className="align-middle">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setSelected(req)}
											>
												Voir le détail
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardContent>
				</Card>

				{/* Timeline de validation */}
				{selected && (
					<Card className="shadow-lg border-0 mt-4">
						<CardHeader>
							<CardTitle>Détail et validation</CardTitle>
						</CardHeader>
						<CardContent>
							{selected.materials.map((mat, idxMat) => (
								<div key={idxMat} className="mb-6 border-b pb-4">
									<div className="mb-2">
										<strong>Matériel :</strong> {mat.name}<br />
										<strong>Quantité demandée :</strong> {mat.quantity}<br />
										<strong>Justification :</strong> {mat.justification}
									</div>
									<div>
										<strong>Processus de validation :</strong>
										<ul className="mt-2 space-y-2">
											{mat.steps.map((step, idxStep) => (
												<li key={idxStep} className="flex items-center space-x-2">
													<span className="font-medium">{step.role}</span>
													<Badge className={statusColors[step.status] || 'bg-gray-100 text-gray-800'}>
														{step.status}
													</Badge>
													{step.date && (
														<span className="text-xs text-muted-foreground">
															({step.date})
														</span>
													)}
													{/* Proposition de quantité si existante */}
													{rolesWithProposal.includes(step.role) && (
														<span className="ml-2 text-sm">
															Proposition :{' '}
															<span className="font-bold">
																{step.proposal !== null ? step.proposal : '—'}
															</span>
														</span>
													)}
													{/* Boutons pour le rôle connecté et étape en attente */}
													{step.status === 'en attente' && step.role === userRole && (
														<>
															{rolesWithProposal.includes(step.role) ? (
																<Input
																	type="number"
																	min="1"
																	placeholder="Proposition"
																	value={proposals[`${idxMat}_${idxStep}`] ?? step.proposal ?? ''}
																	onChange={(e) =>
																		handleProposalChange(`${idxMat}_${idxStep}`, e.target.value)
																	}
																	className="w-24 mx-2"
																/>
															) : null}
															<Button
																variant="success"
																size="sm"
																className="ml-2"
																disabled={loading}
																onClick={() => handleAction(selected.id, idxMat, idxStep, 'validé')}
															>
																<CheckCircle className="w-4 h-4 mr-1" /> Valider
															</Button>
															<Button
																variant="destructive"
																size="sm"
																className="ml-2"
																disabled={loading}
																onClick={() => handleAction(selected.id, idxMat, idxStep, 'rejeté')}
															>
																<XCircle className="w-4 h-4 mr-1" /> Rejeter
															</Button>
														</>
													)}
												</li>
											))}
										</ul>
										{/* Proposition finale retenue */}
										<div className="mt-4 text-sm text-muted-foreground">
											<strong>Proposition finale retenue :</strong>{' '}
											{mat.steps.findLast(
												(step) => rolesWithProposal.includes(step.role) && step.proposal !== null
											)?.proposal ?? mat.quantity}
										</div>
									</div>
								</div>
							))}
							<Button variant="outline" onClick={() => setSelected(null)}>
								Fermer
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};

export default RequestsValidation;