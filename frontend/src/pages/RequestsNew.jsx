import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useMaterials, useCreateRequest } from '../hooks/useApi';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://127.0.0.1:8000/api/demandes';






const RequestsNew = () => {
  const navigate = useNavigate();
  const { data: materialsData, isLoading: materialsLoading } = useMaterials();
  const [materials, setMaterials] = useState([
    { material: '', quantity: '', justification: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState({});
  const materialInputRefs = useRef([]);

  const handleChange = (idx, e) => {
    const { name, value } = e.target;
    setMaterials(prev =>
      prev.map((item, i) =>
        i === idx ? { ...item, [name]: value } : item
      )
    );
    setError('');
    setSuccess('');
  };

  const handleAddLine = () => {
    setMaterials(prev => [...prev, { material: '', quantity: '', justification: '' }]);
  };

  const handleRemoveLine = (idx) => {
    setMaterials(prev => prev.filter((_, i) => i !== idx));
  };

  const getSuggestions = (value) => {
    if (!value || !materialsData) return [];
    
    const inputValue = value.toLowerCase();
    return materialsData.filter(material =>
      material.nom.toLowerCase().includes(inputValue)
    ).slice(0, 5);
  };

const handleMaterialChange = (idx, value) => {
  setMaterials((prev) =>
    prev.map((item, i) => (i === idx ? { ...item, material: value } : item))
  );

  const newSuggestions = getSuggestions(value);
  setSuggestions((prev) => ({ ...prev, [idx]: newSuggestions }));
  setShowSuggestions((prev) => ({ ...prev, [idx]: newSuggestions.length > 0 }));
  setActiveSuggestionIndex((prev) => ({ ...prev, [idx]: -1 }));
};


const handleSuggestionClick = (idx, suggestion) => {
  setMaterials((prev) =>
    prev.map((item, i) =>
      i === idx ? { ...item, material: suggestion.nom } : item
    )
  );
  setShowSuggestions((prev) => ({ ...prev, [idx]: false }));
  setActiveSuggestionIndex((prev) => ({ ...prev, [idx]: -1 }));
};


  const handleKeyDown = (idx, e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(idx, suggestions[activeSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const { mutate: createRequest, isLoading: isCreating } = useCreateRequest();
  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  setIsSubmitting(true);

  for (let item of materials) {
    if (item.quantity <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');


  console.log('User stocké :', user);
console.log('Token :', token);


  if (!token) {
    toast.error('Vous devez être connecté');
    return;
  }

  const payload = {
    materiels: materials.map(item => {
      const materiel = materialsData.find(m => m.nom === item.material);
      return {
        materiel_id: materiel?.id, 
        quantite: parseInt(item.quantity, 10),
        justification: item.justification
      };
    })
  };

  

  try {
    const response = await fetch('http://127.0.0.1:8000/api/demandes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization : `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Erreur API :', errorData);
      toast.error(errorData.message || 'Erreur lors de la création de la demande');
      return;
    }

    const data = await response.json();
    console.log('Demande créée avec succès :', data);
    toast.success('Demande créée avec succès !');


    setMaterials([{ material: '', quantity: '', justification: '' }]);
  } catch (error) {
    console.error('Erreur fetch :', error);
    toast.error('Erreur réseau ou serveur');
  } finally { 
    setIsSubmitting(false);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Nouvelle demande</h1>
          <p className="text-muted-foreground">Formulaire de demande de plusieurs matériels</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Demander des matériels</CardTitle>
            <CardDescription className="text-center">
              Ajoutez un ou plusieurs matériels à votre demande
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 font-semibold text-sm">
                  <div className="col-span-4">Matériel</div>
                  <div className="col-span-2">Quantité</div>
                  <div className="col-span-5">Justification</div>
                  <div className="col-span-1"></div>
                </div>
                {materials.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2 relative">
                    <div className="col-span-4 h-11 relative">
                      <Input
                        name="material"
                        type="text"
                        placeholder="Ex: Ordinateur portable"
                        value={item.material}
                        onChange={e => handleMaterialChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                        onFocus={() => {
                          const newSuggestions = getSuggestions(item.material);
                          setSuggestions(newSuggestions);
                          setShowSuggestions(newSuggestions.length > 0);
                          setActiveSuggestionIndex(-1);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        required
                        className="w-full h-11"
                      />
                      {showSuggestions[idx] && suggestions[idx]?.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                          {suggestions[idx].map((suggestion, suggestionIdx) => (
                            <div
                              key={suggestion.id}
                              className={`px-4 py-2 cursor-pointer ${
                                activeSuggestionIndex[idx] === suggestionIdx
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                              onMouseDown={() => handleSuggestionClick(idx, suggestion)}
                            >
                              {suggestion.nom}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      name="quantity"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Ex: 2"
                      value={item.quantity}
                      onChange={e => handleChange(idx, e)}
                      required
                      className="col-span-2 h-11"
                    />
                    <Input
                      name="justification"
                      type="text"
                      placeholder="Motif"
                      value={item.justification}
                      onChange={e => handleChange(idx, e)}
                      className="col-span-5 h-11"
                    />
                    <div className="col-span-1 flex items-center justify-center">
                      {materials.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveLine(idx)}
                        >
                          -
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAddLine}
                >
                  + Ajouter un matériel
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Envoi...
                  </>
                ) : (
                  "Envoyer la demande"
                )}
              </Button>
            </CardFooter>
          </form>

        </Card>
        <div className="text-center text-sm text-muted-foreground">
          <Button variant="link" onClick={() => navigate('/dashboard')}>
            Retour au dashboard
          </Button>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          © 2025 Mairie d'Adjarra - Tous droits réservés
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};


export default RequestsNew;