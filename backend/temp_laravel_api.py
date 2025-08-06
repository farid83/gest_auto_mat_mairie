from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import json
from datetime import datetime

# Cette API temporaire simule Laravel + Sanctum
# Elle sera remplacée par la vraie API Laravel

app = FastAPI(title="Mairie Adjarra - API Temporaire (Laravel Simulation)")

# CORS configuré pour Laravel Sanctum
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router avec préfixe /api
api_router = APIRouter(prefix="/api")

# Session simple (en production: Redis/Database)
active_sessions = {}

# Données simulées (comme dans mock.js mais adaptées pour Laravel)
users_db = [
    {
        "id": 1,
        "name": "Jean Dupont",
        "email": "jean.dupont@adjarra.bj",
        "role": "agent",
        "direction_id": 1,
        "active": True,
        "created_at": "2024-01-15T08:00:00Z",
        "updated_at": "2024-01-15T08:00:00Z"
    },
    {
        "id": 2,
        "name": "Marie Koffi",
        "email": "marie.koffi@adjarra.bj",
        "role": "directeur",
        "direction_id": 2,
        "active": True,
        "created_at": "2024-01-15T08:00:00Z",
        "updated_at": "2024-01-15T08:00:00Z"
    },
    {
        "id": 3,
        "name": "Pierre Akoka",
        "email": "pierre.akoka@adjarra.bj",
        "role": "gestionnaire_stock",
        "direction_id": 4,
        "active": True,
        "created_at": "2024-01-15T08:00:00Z",
        "updated_at": "2024-01-15T08:00:00Z"
    },
    {
        "id": 4,
        "name": "Fatou Tomiyo",
        "email": "fatou.tomiyo@adjarra.bj",
        "role": "daaf",
        "direction_id": 3,
        "active": True,
        "created_at": "2024-01-15T08:00:00Z",
        "updated_at": "2024-01-15T08:00:00Z"
    },
    {
        "id": 5,
        "name": "Ahmed Soumanou",
        "email": "ahmed.soumanou@adjarra.bj",
        "role": "secretaire_executif",
        "direction_id": 5,
        "active": True,
        "created_at": "2024-01-15T08:00:00Z",
        "updated_at": "2024-01-15T08:00:00Z"
    },
    {
        "id": 6,
        "name": "Admin Système",
        "email": "admin@adjarra.bj",
        "role": "admin",
        "direction_id": 6,
        "active": True,
        "created_at": "2024-01-15T08:00:00Z",
        "updated_at": "2024-01-15T08:00:00Z"
    }
]

# Modèles Pydantic
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    name: str
    email: str
    role: str
    direction_id: Optional[int] = None
    active: bool
    created_at: str
    updated_at: str

class AuthResponse(BaseModel):
    user: User
    message: str

class StatsResponse(BaseModel):
    requests_total: int
    requests_pending: int
    materials_total: int
    materials_low_stock: int
    pending_validations: int
    notifications_unread: int

# Simulation des sessions
def create_session(user_id: int) -> str:
    session_id = f"session_{user_id}_{datetime.now().timestamp()}"
    active_sessions[session_id] = user_id
    return session_id

def get_current_user(session_id: Optional[str] = None) -> Optional[User]:
    if not session_id or session_id not in active_sessions:
        return None
    
    user_id = active_sessions[session_id]
    user_data = next((u for u in users_db if u["id"] == user_id), None)
    if user_data:
        return User(**user_data)
    return None

# Routes d'authentification

@api_router.get("/sanctum/csrf-cookie")
async def csrf_cookie():
    """Simule Laravel Sanctum CSRF cookie"""
    return {"message": "CSRF cookie set"}

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(login_data: LoginRequest):
    """Connexion utilisateur"""
    # Simulation: tous les mots de passe sont "password"
    if login_data.password != "password":
        raise HTTPException(
            status_code=401,
            detail="Identifiants incorrects"
        )
    
    # Chercher l'utilisateur
    user_data = next((u for u in users_db if u["email"] == login_data.email), None)
    if not user_data or not user_data["active"]:
        raise HTTPException(
            status_code=401,
            detail="Identifiants incorrects"
        )
    
    # Créer une session
    session_id = create_session(user_data["id"])
    user = User(**user_data)
    
    # En production: set HTTPOnly cookie
    print(f"Session créée: {session_id} pour {user.email}")
    
    return AuthResponse(
        user=user,
        message="Connexion réussie"
    )

@api_router.post("/auth/logout")
async def logout():
    """Déconnexion utilisateur"""
    # En production: clear session/cookie
    return {"message": "Déconnexion réussie"}

@api_router.get("/auth/user", response_model=User)
async def get_current_user_info():
    """Récupérer l'utilisateur actuel"""
    # Simulation: retourner l'admin par défaut
    # En production: vérifier cookie/session
    admin_user = next((u for u in users_db if u["email"] == "admin@adjarra.bj"), None)
    if not admin_user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    return User(**admin_user)

# Route des statistiques dashboard
@api_router.get("/dashboard/stats", response_model=StatsResponse)
async def get_dashboard_stats():
    """Statistiques pour le dashboard"""
    return StatsResponse(
        requests_total=25,
        requests_pending=8,
        materials_total=150,
        materials_low_stock=12,
        pending_validations=5,
        notifications_unread=3
    )

# Routes utilisateurs
@api_router.get("/users")
async def get_users(page: int = 1, per_page: int = 15, search: str = "", role: str = ""):
    """Liste des utilisateurs avec pagination"""
    filtered_users = users_db
    
    if search:
        filtered_users = [u for u in filtered_users if search.lower() in u["name"].lower() or search.lower() in u["email"].lower()]
    
    if role:
        filtered_users = [u for u in filtered_users if u["role"] == role]
    
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        "data": filtered_users[start:end],
        "meta": {
            "current_page": page,
            "per_page": per_page,
            "total": len(filtered_users),
            "last_page": (len(filtered_users) + per_page - 1) // per_page
        }
    }

# Routes directions
@api_router.get("/directions")
async def get_directions():
    """Liste des directions"""
    directions = [
        {"id": 1, "name": "Direction des Travaux Publics", "code": "DTP", "level": 1, "parent_id": None},
        {"id": 2, "name": "Direction des Affaires Sociales", "code": "DAS", "level": 1, "parent_id": None},
        {"id": 3, "name": "Direction des Affaires Administratives et Financières", "code": "DAAF", "level": 1, "parent_id": None},
        {"id": 4, "name": "Service du Matériel", "code": "SM", "level": 2, "parent_id": 3},
        {"id": 5, "name": "Cabinet du Maire", "code": "CM", "level": 1, "parent_id": None}
    ]
    return {"data": directions}

# Routes matériels
@api_router.get("/materials")
async def get_materials(page: int = 1, search: str = "", category: str = "", status: str = ""):
    """Liste des matériels"""
    materials = [
        {
            "id": 1,
            "name": "Ordinateur portable Dell",
            "code": "ORD001",
            "category": "Informatique",
            "unit": "Pièce",
            "stock_quantity": 5,
            "min_threshold": 2,
            "max_threshold": 20,
            "unit_price": 450000,
            "status": "actif",
            "supplier": "Tech Solutions SARL"
        },
        {
            "id": 2,
            "name": "Ramette papier A4",
            "code": "PAP001",
            "category": "Fournitures Bureau",
            "unit": "Ramette",
            "stock_quantity": 15,
            "min_threshold": 10,
            "max_threshold": 100,
            "unit_price": 3500,
            "status": "actif",
            "supplier": "Papeterie Centrale"
        }
    ]
    
    return {
        "data": materials,
        "meta": {"current_page": page, "per_page": 15, "total": len(materials), "last_page": 1}
    }

# Routes demandes
@api_router.get("/requests")
async def get_requests(page: int = 1, status: str = "", requester_id: int = None):
    """Liste des demandes"""
    requests = [
        {
            "id": 1,
            "request_number": "DEM2024-001",
            "requester_id": 1,
            "status": "en_attente",
            "priority": "normale",
            "justification": "Remplacement d'équipements défaillants",
            "created_at": "2024-07-15T10:30:00Z"
        }
    ]
    
    return {
        "data": requests,
        "meta": {"current_page": page, "per_page": 15, "total": len(requests), "last_page": 1}
    }

# Routes notifications
@api_router.get("/notifications")
async def get_notifications(read: bool = None):
    """Liste des notifications"""
    notifications = [
        {
            "id": 1,
            "user_id": 6,
            "type": "validation_requise",
            "title": "Validation requise",
            "message": "Demande DEM2024-001 en attente",
            "data": {"request_id": 1},
            "read": False,
            "created_at": "2024-07-15T10:35:00Z"
        }
    ]
    
    if read is not None:
        notifications = [n for n in notifications if n["read"] == read]
    
    return {"data": notifications}

# Inclure le router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)