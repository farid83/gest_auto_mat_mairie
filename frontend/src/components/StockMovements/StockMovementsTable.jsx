import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table } from "../ui/table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

const StockMovementsTable = () => {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const token = localStorage.getItem("token"); // ton token stocké après login
        const res = await axios.get("http://127.0.0.1:8000/api/mouvements-stock", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setMovements(res.data); // on suppose que ton API renvoie un tableau
      } catch (err) {
        console.error("Erreur lors du chargement des mouvements :", err);
        setError("Impossible de charger les mouvements de stock");
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const filtered = movements.filter(
    (m) =>
      (m.materiel?.nom || '').toLowerCase().includes(filter.toLowerCase()) ||
      (m.user || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>Mouvements de stock</CardTitle>
        <Input
          placeholder="Filtrer par matériel ou utilisateur"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-2 w-64"
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Matériel</th>
                <th>Quantité</th>
                <th>Utilisateur</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Badge className={
                        m.type === 'Entrée'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {m.type}
                      </Badge>
                    </td>
                    <td>{m.materiel?.nom || 'Matériel inconnu'}</td>
                    <td>{m.quantity}</td>
                    <td>{m.user}</td>
                    <td>{new Date(m.date).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    Aucun mouvement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMovementsTable;
