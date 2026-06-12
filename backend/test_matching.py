from matching import match_universities

# Тестовые данные вузов (пока без Supabase)
test_unis = [
    {
        "name": "Harvard University",
        "sat_25": 1510, "sat_75": 1580,
        "cost_attendance": 85540,
        "aid_status": "NB",
        "meets_full_need": True,
        "pct_intl_receiving_aid": 100,
        "tier": 1
    },
    {
        "name": "Stanford University",
        "sat_25": 1510, "sat_75": 1580,
        "cost_attendance": 87833,
        "aid_status": "NB",
        "meets_full_need": True,
        "pct_intl_receiving_aid": 100,
        "tier": 1
    },
    {
        "name": "Rice University",
        "sat_25": 1510, "sat_75": 1570,
        "cost_attendance": 79788,
        "aid_status": "NA",
        "meets_full_need": True,
        "pct_intl_receiving_aid": 45,
        "tier": 2
    },
    {
        "name": "Pomona College",
        "sat_25": 1490, "sat_75": 1560,
        "cost_attendance": 85300,
        "aid_status": "NB",
        "meets_full_need": True,
        "pct_intl_receiving_aid": 100,
        "tier": 2
    },
]

# Профиль тестового пользователя — российский студент, SAT 1420, бюджет $5000/год
user = {
    "sat": 1420,
    "gpa4": 3.9,
    "family_can_pay": 5000,
    "citizenship": "Russia"
}

results = match_universities(test_unis, user)

print(f"Профиль: SAT {user['sat']}, GPA {user['gpa4']}, бюджет ${user['family_can_pay']}/год\n")

for tier in ["reach", "match", "safety"]:
    print(f"=== {tier.upper()} ===")
    if not results[tier]:
        print("  (пусто)")
    for uni in results[tier]:
        g = uni["grant"]
        print(f"  {uni['name']}")
        print(f"    Grant: {g['score']}% ({g['label']}) — {g['explanation']}")
        if g["admission_risk"]:
            print(f"    ⚠ Admission risk: requesting aid may lower acceptance odds")
    print()