// Mock data pour l'application de gestion des matériels - Mairie d'Adjarra

export const mockUsers = [
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@adjarra.bj",
    role: "agent",
    direction: "Direction des Travaux Publics",
    active: true,
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    name: "Marie Koffi",
    email: "marie.koffi@adjarra.bj",
    role: "directeur",
    direction: "Direction des Affaires Sociales",
    active: true,
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 3,
    name: "Pierre Akoka",
    email: "pierre.akoka@adjarra.bj",
    role: "gestionnaire_stock",
    direction: "Service du Matériel",
    active: true,
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 4,
    name: "Fatou Tomiyo",
    email: "fatou.tomiyo@adjarra.bj",
    role: "daaf",
    direction: "Direction des Affaires Administratives et Financières",
    active: true,
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 5,
    name: "Ahmed Soumanou",
    email: "ahmed.soumanou@adjarra.bj",
    role: "secretaire_executif",
    direction: "Cabinet du Maire",
    active: true,
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 6,
    name: "Admin Système",
    email: "admin@adjarra.bj",
    role: "admin",
    direction: "Service Informatique",
    active: true,
    avatar: "/api/placeholder/40/40"
  }
];

export const mockDirections = [
  {
    id: 1,
    name: "Direction des Travaux Publics",
    code: "DTP",
    level: 1,
    parent_id: null
  },
  {
    id: 2,
    name: "Direction des Affaires Sociales",
    code: "DAS",
    level: 1,
    parent_id: null
  },
  {
    id: 3,
    name: "Direction des Affaires Administratives et Financières",
    code: "DAAF",
    level: 1,
    parent_id: null
  },
  {
    id: 4,
    name: "Service du Matériel",
    code: "SM",
    level: 2,
    parent_id: 3
  },
  {
    id: 5,
    name: "Cabinet du Maire",
    code: "CM",
    level: 1,
    parent_id: null
  }
];

export const mockMaterials = [
  {
    id: 1,
    name: "Ordinateur portable Dell",
    code: "ORD001",
    category: "Informatique",
    unit: "Pièce",
    stock_quantity: 5,
    min_threshold: 2,
    max_threshold: 20,
    unit_price: 450000,
    status: "actif",
    supplier: "Tech Solutions SARL"
  },
  {
    id: 2,
    name: "Ramette papier A4",
    code: "PAP001",
    category: "Fournitures Bureau",
    unit: "Ramette",
    stock_quantity: 15,
    min_threshold: 10,
    max_threshold: 100,
    unit_price: 3500,
    status: "actif",
    supplier: "Papeterie Centrale"
  },
  {
    id: 3,
    name: "Chaise de bureau",
    code: "MOB001",
    category: "Mobilier",
    unit: "Pièce",
    stock_quantity: 1,
    min_threshold: 3,
    max_threshold: 15,
    unit_price: 75000,
    status: "alerte",
    supplier: "Mobilier Pro"
  },
  {
    id: 4,
    name: "Imprimante laser HP",
    code: "IMP001",
    category: "Informatique",
    unit: "Pièce",
    stock_quantity: 0,
    min_threshold: 1,
    max_threshold: 5,
    unit_price: 180000,
    status: "rupture",
    supplier: "Tech Solutions SARL"
  }
];

export const mockRequests = [
  {
    id: 1,
    request_number: "DEM2024-001",
    requester_id: 1,
    requester_name: "Jean Dupont",
    direction: "Direction des Travaux Publics",
    status: "en_attente",
    priority: "normale",
    justification: "Remplacement d'équipements défaillants pour le service",
    created_at: "2024-07-15T10:30:00Z",
    items: [
      {
        material_id: 1,
        material_name: "Ordinateur portable Dell",
        quantity: 2,
        unit_price: 450000,
        justification: "Remplacement ordinateurs défaillants"
      },
      {
        material_id: 2,
        material_name: "Ramette papier A4",
        quantity: 10,
        unit_price: 3500,
        justification: "Stock bureau épuisé"
      }
    ],
    validations: [
      {
        step: 1,
        role: "directeur",
        validator_name: "Marie Koffi",
        status: "en_attente",
        required: true
      },
      {
        step: 2,
        role: "daaf",
        validator_name: "Fatou Tomiyo",
        status: "en_attente",
        required: true
      },
      {
        step: 3,
        role: "secretaire_executif",
        validator_name: "Ahmed Soumanou",
        status: "en_attente",
        required: true
      }
    ]
  },
  {
    id: 2,
    request_number: "DEM2024-002",
    requester_id: 2,
    requester_name: "Marie Koffi",
    direction: "Direction des Affaires Sociales",
    status: "approuvee",
    priority: "urgente",
    justification: "Équipement urgent pour nouvelle campagne sociale",
    created_at: "2024-07-10T14:15:00Z",
    items: [
      {
        material_id: 3,
        material_name: "Chaise de bureau",
        quantity: 3,
        unit_price: 75000,
        justification: "Nouvel agent recruté"
      }
    ],
    validations: [
      {
        step: 1,
        role: "directeur",
        validator_name: "Marie Koffi",
        status: "approuve",
        required: true,
        validated_at: "2024-07-10T15:00:00Z",
        comment: "Approuvé - priorité urgente"
      },
      {
        step: 2,
        role: "daaf",
        validator_name: "Fatou Tomiyo",
        status: "approuve",
        required: true,
        validated_at: "2024-07-11T09:30:00Z",
        comment: "Budget disponible"
      },
      {
        step: 3,
        role: "secretaire_executif",
        validator_name: "Ahmed Soumanou",
        status: "approuve",
        required: true,
        validated_at: "2024-07-11T16:45:00Z",
        comment: "Validation finale accordée"
      }
    ]
  }
];

export const mockNotifications = [
  {
    id: 1,
    user_id: 2,
    type: "validation_requise",
    title: "Validation requise",
    message: "Demande DEM2024-001 en attente de validation",
    data: { request_id: 1 },
    read: false,
    created_at: "2024-07-15T10:35:00Z"
  },
  {
    id: 2,
    user_id: 4,
    type: "validation_requise",
    title: "Validation requise",
    message: "Demande DEM2024-001 en attente de validation DAAF",
    data: { request_id: 1 },
    read: false,
    created_at: "2024-07-15T10:40:00Z"
  },
  {
    id: 3,
    user_id: 3,
    type: "stock_alerte",
    title: "Alerte stock bas",
    message: "Chaise de bureau sous le seuil minimum",
    data: { material_id: 3 },
    read: true,
    created_at: "2024-07-14T08:00:00Z"
  },
  {
    id: 4,
    user_id: 3,
    type: "stock_rupture",
    title: "Rupture de stock",
    message: "Imprimante laser HP en rupture",
    data: { material_id: 4 },
    read: false,
    created_at: "2024-07-13T12:00:00Z"
  }
];

export const mockDeliveries = [
  {
    id: 1,
    request_id: 2,
    request_number: "DEM2024-002",
    delivery_number: "LIV2024-001",
    status: "preparee",
    prepared_by: "Pierre Akoka",
    prepared_at: "2024-07-12T10:00:00Z",
    items: [
      {
        material_id: 3,
        material_name: "Chaise de bureau",
        quantity_requested: 3,
        quantity_delivered: 3,
        unit_price: 75000
      }
    ]
  }
];

// Fonctions utilitaires pour simuler les appels API
export const mockApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const roleLabels = {
  agent: "Agent",
  directeur: "Directeur",
  gestionnaire_stock: "Gestionnaire de Stock", 
  daaf: "DAAF",
  secretaire_executif: "Secrétaire Exécutif",
  admin: "Administrateur"
};

export const statusLabels = {
  en_attente: "En attente",
  approuvee: "Approuvée", 
  rejetee: "Rejetée",
  livree: "Livrée"
};

export const priorityLabels = {
  faible: "Faible",
  normale: "Normale", 
  elevee: "Élevée",
  urgente: "Urgente"
};