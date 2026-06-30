from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from supabase import create_client
from matching import match_universities
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SECRET_KEY")
)

# Auth
SECRET_KEY = os.environ.get("JWT_SECRET", "uniply-secret-key-change-in-production")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str, name: str) -> str:
    expire = datetime.utcnow() + timedelta(days=30)
    return jwt.encode({"sub": user_id, "name": name, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return {"id": payload["sub"], "name": payload["name"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Models ---

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    identifier: str  # email или username
    password: str

class MatchRequest(BaseModel):
    sat: Optional[int] = None
    act: Optional[int] = None
    gpa: Optional[float] = None
    gpa4: Optional[float] = None
    family_budget: Optional[int] = None
    family_can_pay: Optional[int] = None
    citizenship: Optional[str] = ""
    enrollment_year: Optional[str] = None
    majors: Optional[List[str]] = []
    grant_needed: Optional[int] = None
    extracurricular_score: Optional[float] = None
    preferences: Optional[dict] = {}
    academic_achievements: Optional[str] = None
    extracurriculars: Optional[str] = None
    startup_project: Optional[str] = None
    work_experience: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    sat: Optional[int] = None
    gpa: Optional[float] = None
    family_budget: Optional[int] = None
    citizenship: Optional[str] = None
    enrollment_year: Optional[str] = None
    majors: Optional[List[str]] = None

class SavedRequest(BaseModel):
    university_id: str

# --- Auth endpoints ---

@app.post("/auth/register")
def register(req: RegisterRequest):
    # Проверяем что email не занят
    existing = supabase.table("users").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(req.password)
    result = supabase.table("users").insert({
        "name": req.name,
        "email": req.email,
        "password_hash": hashed,
    }).execute()

    user = result.data[0]
    token = create_token(user["id"], user["name"])
    return {"token": token, "name": user["name"]}

@app.post("/auth/login")
def login(req: LoginRequest):
    # Ищем по email или name
    result = supabase.table("users").select("*").eq("email", req.identifier).execute()
    if not result.data:
        result = supabase.table("users").select("*").eq("name", req.identifier).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = result.data[0]
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong password")

    token = create_token(user["id"], user["name"])
    return {"token": token, "name": user["name"]}

@app.delete("/auth/account")
def delete_account(current_user=Depends(get_current_user)):
    supabase.table("users").delete().eq("id", current_user["id"]).execute()
    return {"status": "deleted"}

# --- Profile ---

@app.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    result = supabase.table("users").select("*").eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = result.data[0]
    return {
        "name": user["name"],
        "email": user["email"],
        "sat": user.get("sat"),
        "gpa": user.get("gpa"),
        "family_budget": user.get("family_budget"),
        "citizenship": user.get("citizenship"),
        "enrollment_year": user.get("enrollment_year"),
        "majors": user.get("majors", []),
    }

@app.patch("/profile")
def update_profile(req: ProfileUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    supabase.table("users").update(updates).eq("id", current_user["id"]).execute()
    return {"status": "updated"}

# --- Saved list ---

@app.get("/saved")
def get_saved(current_user=Depends(get_current_user)):
    result = supabase.table("saved_universities").select("*").eq("user_id", current_user["id"]).execute()
    return {"saved": result.data}

@app.post("/saved")
def add_saved(req: SavedRequest, current_user=Depends(get_current_user)):
    supabase.table("saved_universities").insert({
        "user_id": current_user["id"],
        "university_id": req.university_id,
    }).execute()
    return {"status": "saved"}

@app.delete("/saved/{university_id}")
def remove_saved(university_id: str, current_user=Depends(get_current_user)):
    supabase.table("saved_universities").delete()\
        .eq("user_id", current_user["id"])\
        .eq("university_id", university_id)\
        .execute()
    return {"status": "removed"}

# --- University page ---

@app.get("/university/{uni_id}")
def get_university(uni_id: int):
    result = supabase.table("universities").select("*").eq("id", uni_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="University not found")
    return result.data[0]

# --- Match ---

@app.get("/")
def root():
    return {"status": "Uniply API is running"}

@app.post("/match")
def match(req: MatchRequest):
    response = supabase.table("universities").select("*").execute()
    universities = response.data

    sat = req.sat
    act = req.act
    gpa = req.gpa or req.gpa4
    family_can_pay = req.family_budget or req.family_can_pay or 0

    user = {
        "sat": sat,
        "act": act,
        "gpa4": gpa,
        "family_can_pay": family_can_pay,
        "citizenship": req.citizenship or "",
        "extracurricular_score": req.extracurricular_score,
        "preferences": req.preferences or {},
    }

    results = match_universities(universities, user)

    def format_uni(u):
        tier_label = (u.get("match_tier") or "match").lower()
        return {
            "id": u.get("id"),
            "name": u.get("name"),
            "city": u.get("city"),
            "state": u.get("state"),
            "tier": u.get("tier"),
            "tier_label": tier_label,
            "sat_25": u.get("sat_25"),
            "sat_75": u.get("sat_75"),
            "acceptance_rate": u.get("acceptance_rate"),
            "cost_per_year": u.get("cost_attendance"),
            "aid_status": u.get("aid_status"),
            "aid_label": u.get("aid_status"),
            "full_ride": u.get("meets_full_need"),
            "deadline_ed1": u.get("deadline_ed1"),
            "deadline_ed2": u.get("deadline_ed2"),
            "deadline_ea": u.get("deadline_ea"),
            "deadline_rd": u.get("deadline_rd"),
            "sports_conference": u.get("sports_conference"),
            "city_size": u.get("city_size"),
            "qs_ranking": u.get("qs_ranking"),
            "grant_probability": u.get("grant"),
            "about": u.get("about"),
        }

    all_results = (
        [format_uni(u) for u in results["reach"]] +
        [format_uni(u) for u in results["match"]] +
        [format_uni(u) for u in results["safety"]]
    )

    return {"results": all_results}

@app.post("/session")
def save_session(req: MatchRequest):
    supabase.table("match_sessions").insert({
        "user_sat": req.sat,
        "user_gpa": req.gpa or req.gpa4,
        "user_citizenship": req.citizenship,
        "user_budget": req.family_budget or req.family_can_pay,
    }).execute()
    return {"status": "saved"}
