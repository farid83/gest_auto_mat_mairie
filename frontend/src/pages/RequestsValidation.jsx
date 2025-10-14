import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Filter } from 'lucide-react';


const RequestsValidation = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [selectedMateriels, setSelectedMateriels] = useState([]);
  const [quantities, setQuantities] = useState({});
  const { toast } = useToast();

  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/demande-materiels/validation', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des demandes');
      const data = await response.json();

      // Trier par date par défaut
   // Trier par date par défaut
const sortedDemandes = [...(data.demandes || [])].sort((a, b) =>
  sortOrder === 'asc'
    ? new Date(a.created_at) - new Date(b.created_at)
    : new Date(b.created_at) - new Date(a.created_at)
);

setRequests(sortedDemandes);
      // Déterminer le rôle de l'utilisateur à partir de la première demande (si disponible)



      if (data.demandes?.length) {
        const statusRoleMap = {
          en_attente: 'directeur',
          en_attente_stock: 'gestionnaire_stock',
          en_attente_daaf: 'daaf',
          en_attente_secretaire: 'secretaire_executif',
        };
        setRole(statusRoleMap[data.demandes[0].status] || '');
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible de charger les demandes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setRequests(prev =>
      [...prev].sort((a, b) =>
        newOrder === 'asc'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at)
      )
    );
  };

  const getMatStatus = (mat) => {
    if (mat.quantite_validee === null || mat.quantite_validee === undefined) return 'en_attente';
    return mat.quantite_validee > 0 ? 'validee' : 'rejetee';
  };

  const handleBatchAction = async (demandeId, materielIds, action) => {
    setLoading(true);
    try {
      // Si on est secrétaire exécutif et que l'on valide → appeler l'endpoint spécifique
      if (role === 'secretaire_executif' && action === 'validé') {
        const body = { statut: 'validee_finale' };
        const response = await fetch(
          `http://127.0.0.1:8000/api/demande-materiels/${demandeId}/secretaire-executif-validate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) throw new Error('Erreur lors de la validation par le secrétaire exécutif');
        await response.json();

        toast({ title: 'Succès', description: 'Demande validée et stock mis à jour' });
        setSelectedMateriels([]);
        setQuantities({});
        await fetchRequests();
        return;
      }

      // Prépare les quantités à envoyer (comportement inchangé pour les autres rôles)
      let quantites = {};
      if (['gestionnaire_stock', 'daaf'].includes(role) && action === 'validé') {
        materielIds.forEach(id => {
          const requested = selected.materials.find(m => m.materiel_id === id)?.quantity ?? 1;
          const qState = quantities[id];
          const parsed = (qState !== undefined && qState !== null && qState !== '')
            ? parseInt(qState, 10)
            : requested;
          quantites[id] = Number.isNaN(parsed) ? requested : parsed;
        });
      }

      const body = {
        materiel_ids: materielIds,
        status: action === 'validé' ? 'validee' : 'rejetee',
        quantites: quantites,
      };

      const response = await fetch(
        `http://127.0.0.1:8000/api/demande-materiels/${demandeId}/materiels/batch-validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) throw new Error('Erreur sur la validation par lot');
      await response.json();

      toast({ title: 'Succès', description: `Sélection ${action} avec succès` });
      setSelectedMateriels([]);
      setQuantities({});
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: "Impossible d'effectuer l'action",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    validee: 'bg-green-100 text-green-800',
    rejetee: 'bg-red-100 text-red-800',
    en_attente: 'bg-orange-100 text-orange-800',
    en_attente_stock: 'bg-blue-100 text-blue-800',
    en_attente_daaf: 'bg-purple-100 text-purple-800',
    en_attente_secretaire: 'bg-pink-100 text-pink-800',
  };

  const roleDescriptions = {
    directeur: 'Validez les demandes selon votre rôle de directeur',
    gestionnaire_stock: 'Traitez les demandes pour le stock',
    daaf: 'Validez les demandes en attente DAAF',
    secretaire_executif: 'Prenez la décision finale sur les demandes',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-4xl space-y-6">
        {/* Liste des demandes */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Demandes à valider
                <span className="block text-sm text-muted-foreground">{roleDescriptions[role]}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('created_at')}
              >
                <Filter className="w-4 h-4 mr-2" />
                Trier par date {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Aucune demande à traiter</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-center">
                    <th>Matériels</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="text-center">
                      <td>
                        <ul className="space-y-1">
                          {req.materials.map((mat, idx) => (
                            <li key={idx} className="flex justify-center gap-2 items-center">
                              <span className="font-medium">{mat.name}</span>
                              <span className="text-xs text-muted-foreground">x{mat.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
                      <td><Badge className={statusColors[req.status] || 'bg-gray-100 text-gray-800'}>{req.status}</Badge></td>
                      <td><Button variant="ghost" size="sm" onClick={() => setSelected(req)}>Voir le détail</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Détail et validation */}
        {/* Détail et validation */}
        {selected && (
          <Card className="shadow-lg border-0 mt-4">
            <CardHeader>
              <CardTitle>Détail et validation</CardTitle>
              <CardDescription>Demande de {selected.user_name}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Checkbox Tout sélectionner */}
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.materials.every(mat => selectedMateriels.includes(mat.materiel_id) || getMatStatus(mat) !== 'en_attente')}
                  onChange={e => {
                    if (e.target.checked) {
                      // Ajouter tous les matériels en attente
                      const allIds = selected.materials
                        .filter(mat => getMatStatus(mat) === 'en_attente')
                        .map(mat => mat.materiel_id);
                      setSelectedMateriels(allIds);
                    } else {
                      // Tout décocher
                      setSelectedMateriels([]);
                    }
                  }}
                  className="mr-2"
                />
                <label>Sélectionner tout</label>
              </div>

              {/* Liste des matériels dans le détail */}
              {selected.materials.map((mat, idxMat) => (
                <div
                  key={idxMat}
                  className={`mb-6 border-b pb-4 ${getMatStatus(mat) !== 'en_attente' ? 'opacity-75' : ''}`}
                >
                  <div className="mb-2">
                    <strong>Matériel :</strong> {mat.name}<br />
                    <strong>Quantité demandée :</strong> {mat.quantity}<br />
                    <strong>Quantité proposée :</strong> {mat.quantite_proposee_gestionnaire ?? '-'}<br />
                    <strong>Quantité validée :</strong> {mat.quantite_validee_daaf ?? '-'}<br />
                    <strong>Justification :</strong> {mat.justification}<br />
                    <Badge className={statusColors[getMatStatus(mat)] || 'bg-gray-100 text-gray-800'}>
                      {getMatStatus(mat)}
                    </Badge>
                  </div>

                  {/* Checkbox individuelle (uniquement si en attente) */}
                  {getMatStatus(mat) === 'en_attente' && (
                    <div className="mt-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedMateriels.includes(mat.materiel_id)}
                        disabled={loading}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedMateriels([...selectedMateriels, mat.materiel_id]);
                          } else {
                            setSelectedMateriels(selectedMateriels.filter(id => id !== mat.materiel_id));
                          }
                        }}
                        className="mr-2"
                      />
                      <label>Sélectionner ce matériel</label>
                    </div>
                  )}

                  {/* Champ quantité (uniquement si en attente ET rôle stock/daaf) */}
                  {['gestionnaire_stock', 'daaf'].includes(role) && getMatStatus(mat) === 'en_attente' && (
                    <div className="mt-2 flex items-center gap-2">
                      <label htmlFor={`qte-${mat.materiel_id}`}>Quantité à valider :</label>
                      <input
                        id={`qte-${mat.materiel_id}`}
                        type="number"
                        min={0}
                        value={quantities[mat.materiel_id] ?? mat.quantity}
                        onChange={e => setQuantities({
                          ...quantities,
                          [mat.materiel_id]: e.target.value
                        })}
                        className="w-24 border rounded px-2 py-1"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {/* Si rejeté, affichage lecture seule */}
                  {getMatStatus(mat) === 'rejetee' && (
                    <div className="mt-2 text-sm text-red-600 italic">
                      Ce matériel a été rejeté lors de l’étape précédente et ne peut plus être modifié.
                    </div>
                  )}
                </div>
              ))}


              {selectedMateriels.length > 0 && (
                <div className="mt-4 flex gap-4">
                  <Button
                    variant="default"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleBatchAction(selected.id, selectedMateriels, 'validé')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Valider la sélection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleBatchAction(selected.id, selectedMateriels, 'rejeté')}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Rejeter la sélection
                  </Button>
                </div>
              )}

              <Button variant="outline" className="mt-4" onClick={() => setSelected(null)}>Fermer</Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default RequestsValidation;