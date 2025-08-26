import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table } from '../ui/table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import MaterialForm from './MaterialForm';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { materialsService } from '../../services/api';

const stateColors = {
    Bon: 'bg-green-100 text-green-800',
    Neuf: 'bg-green-50 text-green-800',
    'À réparer': 'bg-orange-100 text-orange-800',
    HS: 'bg-red-100 text-red-800',
};


const InventoryTable = () => {
    const [inventory, setInventory] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editMaterial, setEditMaterial] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'
    const [searchTerm, setSearchTerm] = useState(''); // Pour la recherche
    const { user, hasAnyRole } = useAuth(); // 🔹 Récupérer les informations d'authentification


    // 🔹 Charger les matériels depuis l'API
    const fetchInventory = async () => {
        try {
            const response = await materialsService.getMaterials();
            setInventory(response.data || response);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'inventaire :', error);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // 🔹 Fonction de tri par nom
    const sortByName = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
    };

    // 🔹 Fonction de filtrage par recherche
    const filteredAndSortedInventory = () => {
        // Filtrer par recherche
        let result = inventory.filter(item =>
            item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.categorie.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Trier par nom
        result.sort((a, b) => {
            const nameA = a.nom.toLowerCase();
            const nameB = b.nom.toLowerCase();
            if (sortOrder === 'asc') {
                return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
            } else {
                return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
            }
        });
        
        return result;
    };

    // 🔹 Ajouter ou éditer un matériel
 const handleSave = async (materialData) => {
    try {
        if (editMaterial) {
            await materialsService.updateMaterial(editMaterial.id, materialData);
            toast.success('Matériel modifié avec succès !');
        } else {
            await materialsService.createMaterial(materialData);
            toast.success('Matériel ajouté avec succès !');
        }

        await fetchInventory();
        setFormOpen(false);

    } catch (error) {
        console.error('Erreur lors de la sauvegarde :', error);
        toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        // ⛔ Pas de fetchInventory ici, sinon l'UI se rafraîchit à tort
    }
};

    // 🔹 Supprimer un matériel
    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce matériel ?')) return;

        try {
            await materialsService.deleteMaterial(id);
            setInventory(inventory.filter((item) => item.id !== id));
            toast.success('Matériel supprimé avec succès !');
        } catch (error) {
            console.error('Erreur lors de la suppression :', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // 🔹 Générer le PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString('fr-FR');
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Entête
        doc.setFontSize(18);
        doc.text('Inventaire des matériels', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Date d'export : ${date}`, pageWidth - 20, 30, { align: 'right' });
        
        // En-têtes du tableau
        const headers = [['Nom', 'Catégorie', 'Quantité totale', 'Disponible', 'État']];
        const data = filteredAndSortedInventory().map(item => [
            item.nom,
            item.categorie,
            item.quantite_totale.toString(),
            item.quantite_disponible.toString(),
            item.etat
        ]);
        
        // Corps du tableau
        autoTable(doc, {
            startY: 40,
            head: headers,
            body: data,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            columnStyles: { 4: { cellWidth: 30 } }
        });
        
        // Pied de page
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Page ${i}/${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
            doc.text("Mairie de Porto-Novo - Service Matériel", 20, doc.internal.pageSize.getHeight() - 10);
        }
        
        doc.save(`inventaire_${date.replace(/\//g, '-')}.pdf`);
    };

    // 🔹 Vérifier si l'utilisateur a le droit de supprimer
    const canDelete = hasAnyRole(['admin']);

    return (
        <Card className="shadow-xl border-0">
            <CardHeader>
                <CardTitle>Inventaire des matériels</CardTitle>
                <div className="flex flex-col md:flex-row gap-2 mt-2">
                    <div className="flex-1 flex gap-2">
                        <Button size="sm" onClick={() => { setEditMaterial(null); setFormOpen(true); }}>
                            Ajouter
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleExportPDF}>
                            Exporter
                        </Button>
                    </div> 
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none w-full md:w-64">
                            <Input
                                type="text"
                                placeholder="Rechercher un matériel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={sortByName}
                        >
                            Trier par nom {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table className="">
                    <thead>
                        <tr className="text-center">
                            <th className="text-center">Nom</th>
                            <th className="text-center">Catégorie</th>
                            <th className="text-center">Quantité totale</th>
                            <th className="text-center">Disponible</th>
                            <th className="text-center">État</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedInventory().map((item) => (
                            <tr key={item.id} className="text-center">
                                <td className="align-middle">{item.nom}</td>
                                <td className="align-middle">{item.categorie}</td>
                                <td className="align-middle">{item.quantite_totale}</td>
                                <td className="align-middle">{item.quantite_disponible}</td>
                                <td className="align-middle">
                                    <Badge className={stateColors[item.etat] || 'bg-gray-100 text-gray-800'}>
                                        {item.etat}
                                    </Badge>
                                </td>
                                <td className="align-middle">
                                      {canDelete && ( // 🔹 Afficher le bouton de suppression ou modification uniquement si l'utilisateur a le droit
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setEditMaterial(item); setFormOpen(true); }}
                                    >
                                        Modifier
                                    </Button>
                                    )}
                                    {canDelete && ( // 🔹 Afficher le bouton de suppression uniquement si l'utilisateur a le droit
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Supprimer
                                        </Button>
                                    )}
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
