import os
import time
import requests
from dotenv import load_dotenv
from supabase import create_client
from unis_data import UNIVERSITIES_100

load_dotenv()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SECRET_KEY")
)

SCORECARD_API_KEY = os.environ.get("SCORECARD_API_KEY")
FIELDS = "id,school.name,school.city,school.state,latest.admissions.sat_scores.25th_percentile.critical_reading,latest.admissions.sat_scores.25th_percentile.math,latest.admissions.sat_scores.75th_percentile.critical_reading,latest.admissions.sat_scores.75th_percentile.math,latest.admissions.admission_rate.overall,latest.cost.attendance.academic_year"


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
        return None, "not_found"
    if not scorecard_id and data["metadata"]["total"] > 1:
        return data["results"][0], "multiple"
    return data["results"][0], "ok"


def calc_sat(result):
    r25 = result.get("latest.admissions.sat_scores.25th_percentile.critical_reading") or 0
    m25 = result.get("latest.admissions.sat_scores.25th_percentile.math") or 0
    r75 = result.get("latest.admissions.sat_scores.75th_percentile.critical_reading") or 0
    m75 = result.get("latest.admissions.sat_scores.75th_percentile.math") or 0
    sat_25 = r25 + m25 if r25 and m25 else None
    sat_75 = r75 + m75 if r75 and m75 else None
    return sat_25, sat_75


problems = []
success_count = 0

for i, uni in enumerate(UNIVERSITIES_100, 1):
    name = uni["name"]
    sid = uni.get("scorecard_id")
    print(f"[{i}/100] {name}{'  [ID]' if sid else ''}...")

    result, status = fetch_university(name, sid)

    if status == "not_found":
        print(f"  НЕ НАЙДЕН")
        problems.append((name, "not_found", None))
        time.sleep(0.3)
        continue

    if status == "multiple":
        print(f"  ⚠ Несколько результатов, взят первый: {result['school.name']}")
        problems.append((name, "multiple", result["school.name"]))

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
        "aid_status": uni["aid_status"],
        "need_blind_international": uni["aid_status"] == "NB",
        "meets_full_need": uni["aid_status"] in ("NB", "NA"),
        "cost_attendance": result.get("latest.cost.attendance.academic_year"),
    }

    supabase.table("universities").upsert(row, on_conflict="scorecard_id").execute()
    success_count += 1
    print(f"  ✓ {row['name']} | SAT 25: {sat_25} | SAT 75: {sat_75} | Cost: {row['cost_attendance']}")
    time.sleep(0.3)

print(f"\n=== ГОТОВО ===")
print(f"Успешно записано: {success_count}/100")
if problems:
    print(f"\nПроблемные записи ({len(problems)}):")
    for name, issue, found_as in problems:
        if issue == "not_found":
            print(f"  НЕ НАЙДЕН: {name}")
        else:
            print(f"  ПРОВЕРИТЬ: '{name}' → записан как '{found_as}'")
else:
    print("Проблемных записей нет.")
