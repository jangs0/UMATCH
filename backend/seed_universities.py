import os
import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SECRET_KEY")
)

SCORECARD_API_KEY = os.environ.get("SCORECARD_API_KEY")

UNIVERSITIES = [
    {"name": "Harvard University", "tier": 1, "need_blind_intl": True, "meets_full_need": True},
    {"name": "Massachusetts Institute of Technology", "tier": 1, "need_blind_intl": True, "meets_full_need": True},
    {"name": "Stanford University", "tier": 1, "need_blind_intl": True, "meets_full_need": True},
    {"name": "Rice University", "tier": 2, "need_blind_intl": False, "meets_full_need": True},
    {"name": "Pomona College", "tier": 2, "need_blind_intl": False, "meets_full_need": True, "scorecard_id": 121345},
]

FIELDS = "id,school.name,school.city,school.state,latest.admissions.sat_scores.25th_percentile.critical_reading,latest.admissions.sat_scores.75th_percentile.critical_reading,latest.admissions.sat_scores.25th_percentile.math,latest.admissions.sat_scores.75th_percentile.math,latest.admissions.admission_rate.overall,latest.cost.attendance.academic_year,latest.aid.median_grant_aid.overall"

def fetch_university(name, scorecard_id=None):
    url = "https://api.data.gov/ed/collegescorecard/v1/schools"
    params = {"api_key": SCORECARD_API_KEY, "fields": FIELDS}
    if scorecard_id:
        params["id"] = scorecard_id
    else:
        params["school.name"] = name
    r = requests.get(url, params=params)
    data = r.json()
    if data["metadata"]["total"] == 0:
        print(f"Не найден: {name}")
        return None
    return data["results"][0]

def calc_sat(result):
    r25 = result.get("latest.admissions.sat_scores.25th_percentile.critical_reading") or 0
    m25 = result.get("latest.admissions.sat_scores.25th_percentile.math") or 0
    r75 = result.get("latest.admissions.sat_scores.75th_percentile.critical_reading") or 0
    m75 = result.get("latest.admissions.sat_scores.75th_percentile.math") or 0
    sat_25 = r25 + m25 if r25 and m25 else None
    sat_75 = r75 + m75 if r75 and m75 else None
    return sat_25, sat_75

for uni in UNIVERSITIES:
    print(f"Загружаю: {uni['name']}...")
    result = fetch_university(uni["name"], uni.get("scorecard_id"))
    if not result:
        continue
    sat_25, sat_75 = calc_sat(result)
    row = {
        "scorecard_id": result["id"],
        "name": result["school.name"],
        "city": result.get("school.city"),
        "state": result.get("school.state"),
        "tier": uni["tier"],
        "sat_25": sat_25,
        "sat_75": sat_75,
        "acceptance_rate": result.get("latest.admissions.admission_rate.overall"),
        "need_blind_international": uni["need_blind_intl"],
        "meets_full_need": uni["meets_full_need"],
        "cost_attendance": result.get("latest.cost.attendance.academic_year"),
    }
    supabase.table("universities").upsert(row, on_conflict="scorecard_id").execute()
    print(f"  Записан: {row['name']} | SAT 25: {sat_25} | SAT 75: {sat_75} | Cost: {row['cost_attendance']}")

print("\nГотово. Проверяем таблицу...")
response = supabase.table("universities").select("name, sat_25, sat_75, cost_attendance").execute()
for r in response.data:
    print(r)