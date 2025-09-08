import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const RequestsValidation = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const { toast } = useToast();

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
      setRequests(data.demandes || []);

      // Récupérer le rôle de l'utilisateur depuis la première demande (ou définir manuellement si besoin)
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

  const getMatStatus = (mat) => {
    if (mat.quantite_validee === null || mat.quantite_validee === undefined) return 'en_attente';
    return mat.quantite_validee > 0 ? 'validee' : 'rejetee';
  };

  const handleMaterielAction = async (id, materielId, action) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/demande-materiels/${id}/materiels/${materielId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: action === 'validé' ? 'validee' : 'rejetee',
          commentaire: action === 'validé' ? 'Action validée' : 'Action rejetée',
        }),
      });

      if (!response.ok) throw new Error('Erreur sur l’action matériel');
      await response.json();
      toast({ title: 'Succès', description: `Matériel ${action} avec succès` });
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: "Impossible d'effectuer l'action", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/demande-materiels/${id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: action === 'validé' ? 'validee' : 'rejetee',
          commentaire: action === 'validé' ? 'Demande validée' : 'Demande rejetée',
        }),
      });

      if (!response.ok) throw new Error('Erreur sur l’action demande');
      await response.json();
      toast({ title: 'Succès', description: `Demande ${action} avec succès` });
      fetchRequests();
      setSelected(null);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: "Impossible d'effectuer l'action", variant: 'destructive' });
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
            <CardTitle>Demandes à valider</CardTitle>
            <CardDescription>{roleDescriptions[role]}</CardDescription>
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
        {selected && (
          <Card className="shadow-lg border-0 mt-4">
            <CardHeader>
              <CardTitle>Détail et validation</CardTitle>
              <CardDescription>Demande de {selected.user_name}</CardDescription>
            </CardHeader>
            <CardContent>
              {selected.materials.map((mat, idxMat) => (
                <div key={idxMat} className="mb-6 border-b pb-4">
                  <div className="mb-2">
                    <strong>Matériel :</strong> {mat.name}<br/>
                    <strong>Quantité :</strong> {mat.quantity}<br/>
                    <strong>Justification :</strong> {mat.justification}<br/>
                    <Badge className={statusColors[getMatStatus(mat)] || 'bg-gray-100 text-gray-800'}>{getMatStatus(mat)}</Badge>
                  </div>
                  {['directeur','gestionnaire_stock','daaf','secretaire_executif'].includes(role) && (
                    <div className="mt-4 flex gap-4">
                      <Button variant="default" size="sm" disabled={loading} onClick={() => handleMaterielAction(selected.id, mat.id, 'validé')}><CheckCircle className="w-4 h-4 mr-1"/> Valider</Button>
                      <Button variant="destructive" size="sm" disabled={loading} onClick={() => handleMaterielAction(selected.id, mat.id, 'rejeté')}><XCircle className="w-4 h-4 mr-1"/> Rejeter</Button>
                    </div>
                  )}
                </div>
              ))}

              {['directeur','gestionnaire_stock','daaf','secretaire_executif'].includes(role) && (
                <div className="mt-6 flex gap-4">
                  <Button variant="default" onClick={() => handleAction(selected.id, 'validé')} disabled={loading}><CheckCircle className="w-4 h-4 mr-1"/> Valider toute la demande</Button>
                  <Button variant="destructive" onClick={() => handleAction(selected.id, 'rejeté')} disabled={loading}><XCircle className="w-4 h-4 mr-1"/> Rejeter toute la demande</Button>
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
