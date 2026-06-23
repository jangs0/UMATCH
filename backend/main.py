from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from supabase import create_client
from matching import match_universities

load_dotenv()

app = FastAPI()

# CORS — разрешаем фронтенду обращаться к API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # потом заменить на конкретный домен
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SECRET_KEY")
)


class MatchRequest(BaseModel):
    sat: int
    gpa4: float
    family_can_pay: int          # USD в год
    citizenship: str             # например "Russia"
    preferences: Optional[List[str]] = []  # пока не используется в MVP


class MatchResponse(BaseModel):
    reach: list
    match: list
    safety: list


@app.get("/")
def root():
    return {"status": "Uniply API is running"}


@app.post("/match")
def match(req: MatchRequest):
    # Загружаем все вузы из Supabase
    response = supabase.table("universities").select("*").execute()
    universities = response.data

    # Прогоняем через алгоритм матчинга
    user = {
        "sat": req.sat,
        "gpa4": req.gpa4,
        "family_can_pay": req.family_can_pay,
        "citizenship": req.citizenship,
        "preferences": req.preferences,
    }
    results = match_universities(universities, user)

    # Форматируем вывод — только нужные поля
    def format_uni(u):
        return {
            "name": u.get("name"),
            "city": u.get("city"),
            "state": u.get("state"),
            "tier": u.get("tier"),
            "sat_25": u.get("sat_25"),
            "sat_75": u.get("sat_75"),
            "acceptance_rate": u.get("acceptance_rate"),
            "cost_attendance": u.get("cost_attendance"),
            "aid_status": u.get("aid_status"),
            "need_blind_international": u.get("need_blind_international"),
            "meets_full_need": u.get("meets_full_need"),
            "npc_url": u.get("npc_url"),
            "deadline_ed1": u.get("deadline_ed1"),
            "deadline_ed2": u.get("deadline_ed2"),
            "deadline_ea": u.get("deadline_ea"),
            "deadline_rd": u.get("deadline_rd"),
            "deadline_notes": u.get("deadline_notes"),
            "grant": u.get("grant"),
            "match_tier": u.get("match_tier"),
        }

    return {
        "reach": [format_uni(u) for u in results["reach"]],
        "match": [format_uni(u) for u in results["match"]],
        "safety": [format_uni(u) for u in results["safety"]],
    }


@app.post("/session")
def save_session(req: MatchRequest):
    # Сохраняем запрос пользователя в match_sessions для аналитики
    supabase.table("match_sessions").insert({
        "user_sat": req.sat,
        "user_gpa": req.gpa4,
        "user_citizenship": req.citizenship,
        "user_budget": req.family_can_pay,
    }).execute()
    return {"status": "saved"}
