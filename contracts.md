# Contrats API - Mairie d'Adjarra - Gestion des Matériels

## Architecture générale

**Backend**: Laravel + PostgreSQL + Sanctum  
**Frontend**: React + TanStack Query + Axios  
**Auth**: Laravel Sanctum avec cookies HTTPOnly  

## Configuration requise

### Headers HTTP
```
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

### Authentification
- Cookies HTTPOnly via Laravel Sanctum
- `withCredentials: true` sur tous les appels
- Endpoint CSRF: `GET /sanctum/csrf-cookie` avant login

## Endpoints API Standard

### Authentification

#### Login
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: User, message: string }
```

#### Logout
```
POST /api/auth/logout
Response: { message: string }
```

#### User actuel
```
GET /api/auth/user
Response: { user: User }
```

### Utilisateurs

#### Liste des utilisateurs
```
GET /api/users?page=1&per_page=15&search=&role=&active=
Response: {
  data: User[],
  meta: { current_page, per_page, total, last_page },
  links: { first, last, prev, next }
}
```

#### Créer utilisateur
```
POST /api/users
Body: { name, email, role, direction_id, active }
Response: { user: User, message }
```

#### Modifier utilisateur
```
PUT /api/users/{id}
Body: { name, email, role, direction_id, active }
Response: { user: User, message }
```

#### Supprimer utilisateur
```
DELETE /api/users/{id}
Response: { message }
```

### Directions

#### Liste des directions
```
GET /api/directions
Response: { data: Direction[] }
```

### Matériels

#### Liste des matériels
```
GET /api/materials?page=1&search=&category=&status=
Response: {
  data: Material[],
  meta: PaginationMeta
}
```

#### Créer matériel
```
POST /api/materials
Body: { name, code, category, unit, min_threshold, max_threshold, unit_price, supplier }
Response: { material: Material, message }
```

#### Modifier matériel
```
PUT /api/materials/{id}
Body: Material data
Response: { material: Material, message }
```

### Demandes

#### Liste des demandes
```
GET /api/requests?page=1&status=&requester_id=&direction_id=
Response: {
  data: Request[],
  meta: PaginationMeta
}
```

#### Créer demande
```
POST /api/requests
Body: {
  justification: string,
  priority: enum,
  items: [
    { material_id: number, quantity: number, justification: string }
  ]
}
Response: { request: Request, message }
```

#### Détail demande
```
GET /api/requests/{id}
Response: { request: Request }
```

### Validations

#### Demandes à valider pour l'utilisateur
```
GET /api/validations/pending
Response: { data: Request[] }
```

#### Valider/Rejeter demande
```
POST /api/requests/{id}/validate
Body: { action: 'approve|reject', comment: string }
Response: { request: Request, message }
```

### Livraisons

#### Liste des livraisons
```
GET /api/deliveries?status=&request_id=
Response: { data: Delivery[] }
```

#### Préparer livraison
```
POST /api/deliveries
Body: { request_id, items: [{ material_id, quantity_delivered }] }
Response: { delivery: Delivery, message }
```

#### Confirmer réception
```
POST /api/deliveries/{id}/receive
Body: { signature_path?: string }
Response: { delivery: Delivery, message }
```

### Notifications

#### Liste des notifications
```
GET /api/notifications?read=false
Response: { data: Notification[] }
```

#### Marquer comme lu
```
PUT /api/notifications/{id}/read
Response: { notification: Notification }
```

#### Marquer toutes comme lues
```
PUT /api/notifications/mark-all-read
Response: { message }
```

### Statistiques Dashboard

#### Stats par rôle
```
GET /api/dashboard/stats
Response: {
  requests_total: number,
  requests_pending: number,
  materials_total: number,
  materials_low_stock: number,
  pending_validations: number,
  notifications_unread: number
}
```

## Modèles de données

### User
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'agent' | 'directeur' | 'gestionnaire_stock' | 'daaf' | 'secretaire_executif' | 'admin';
  direction_id: number;
  direction?: Direction;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Material
```typescript
interface Material {
  id: number;
  name: string;
  code: string;
  category: string;
  unit: string;
  stock_quantity: number;
  min_threshold: number;
  max_threshold: number;
  unit_price: number;
  status: 'actif' | 'inactif' | 'alerte' | 'rupture';
  supplier: string;
  created_at: string;
  updated_at: string;
}
```

### Request
```typescript
interface Request {
  id: number;
  request_number: string;
  requester_id: number;
  requester?: User;
  direction_id: number;
  direction?: Direction;
  status: 'en_attente' | 'approuvee' | 'rejetee' | 'livree';
  priority: 'faible' | 'normale' | 'elevee' | 'urgente';
  justification: string;
  items: RequestItem[];
  validations: RequestValidation[];
  created_at: string;
  updated_at: string;
}
```

### RequestItem
```typescript
interface RequestItem {
  id: number;
  request_id: number;
  material_id: number;
  material?: Material;
  quantity: number;
  unit_price: number;
  justification: string;
}
```

### RequestValidation
```typescript
interface RequestValidation {
  id: number;
  request_id: number;
  step: number;
  role: string;
  validator_id?: number;
  validator?: User;
  status: 'en_attente' | 'approuve' | 'rejete';
  comment?: string;
  validated_at?: string;
  required: boolean;
}
```

### Direction
```typescript
interface Direction {
  id: number;
  name: string;
  code: string;
  level: number;
  parent_id?: number;
  parent?: Direction;
  children?: Direction[];
}
```

### Notification
```typescript
interface Notification {
  id: number;
  user_id: number;
  type: 'validation_requise' | 'demande_approuvee' | 'demande_rejetee' | 'stock_alerte' | 'stock_rupture' | 'livraison';
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}
```

### Delivery
```typescript
interface Delivery {
  id: number;
  request_id: number;
  request?: Request;
  delivery_number: string;
  status: 'preparee' | 'livree' | 'recue';
  prepared_by: number;
  prepared_at: string;
  delivered_at?: string;
  received_at?: string;
  signature_path?: string;
  items: DeliveryItem[];
}
```

## Migration des données mock

### Étapes de remplacement

1. **Configuration Axios + Sanctum**
2. **AuthContext vers Laravel Sanctum**
3. **Services API avec React Query**
4. **Dashboard avec vraies données**
5. **Pages secondaires (matériels, demandes, etc.)**

### Données mockées à remplacer

- `mockUsers` → API `/api/users`
- `mockDirections` → API `/api/directions` 
- `mockMaterials` → API `/api/materials`
- `mockRequests` → API `/api/requests`
- `mockNotifications` → API `/api/notifications`
- `mockDeliveries` → API `/api/deliveries`

### Gestion des erreurs

```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
```

### Configuration React Query

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error?.status === 401) return false; // Pas de retry sur 401
        return failureCount < 3;
      }
    }
  }
});
```

---

**Note**: Ce contrat sera utilisé comme référence lors de l'intégration. Les endpoints Laravel peuvent être adaptés selon les besoins spécifiques.