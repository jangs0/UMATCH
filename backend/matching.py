# matching.py — вся вычислительная логика Uniply MVP
# Реализует алгоритм матчинга описанный Арсением (ШАГ 1-5)

# Тиры университетов (поле tier в таблице universities)
TIER_GUARANTEED = 5

# Базовые шансы гранта по aid_status
GRANT_BASE = {
    "NB": 90,   # Need-blind для интернационалов
    "NA": 78,   # Need-aware, но покрывает полную нужду
    "ML": 45,   # Merit + ограниченная need-based помощь
    "ME": 25,   # Только merit
    "NO": 5,    # Нет помощи иностранцам
}


def normalize_gpa(gpa, scale="4.0"):
    """
    Нормализует GPA к шкале /4.0.
    scale: "4.0" (уже норм), "5.0", "100"
    """
    if gpa is None:
        return None
    if scale == "5.0":
        return round(gpa / 5.0 * 4.0, 2)
    if scale == "100":
        return round(gpa / 25.0, 2)
    return gpa


def normalize_test_percentile(sat, act, uni):
    """
    Переводит SAT/ACT студента в перцентиль (0.0-1.0) относительно
    25/75 диапазона конкретного вуза.
    """
    if sat and uni.get("sat_25") and uni.get("sat_75"):
        lo, hi = uni["sat_25"], uni["sat_75"]
        if hi > lo:
            return max(0.0, min(1.0, (sat - lo) / (hi - lo)))
        return 0.5

    if act and uni.get("act_25") and uni.get("act_75"):
        lo, hi = uni["act_25"], uni["act_75"]
        if hi > lo:
            return max(0.0, min(1.0, (act - lo) / (hi - lo)))
        return 0.5

    return 0.5


def compute_academic_strength(sat, act, gpa4, extracurricular_score, uni):
    """
    ШАГ 4 — Academic strength.
    Комбинирует тестовые баллы (50%), GPA (30%), extracurricular score (20%).
    extracurricular_score: 0.0-1.0 из Claude Haiku оценки Step 5.
    Пока Haiku-ключ не подключён — используется дефолт 0.5.
    Возвращает значение 0.0-1.0.
    """
    test_percentile = normalize_test_percentile(sat, act, uni)
    gpa_norm = max(0.0, min(1.0, (gpa4 or 0) / 4.0))
    extra = extracurricular_score if extracurricular_score is not None else 0.5

    strength = (
        0.5 * test_percentile +
        0.3 * gpa_norm +
        0.2 * extra
    )
    return max(0.0, min(1.0, strength))


def grant_probability(uni, family_can_pay, sat, act, gpa4, extracurricular_score):
    """
    ШАГ 3 — Grant probability для конкретного вуза.
    Возвращает dict: {score, label, explanation, admission_risk}
    """
    cost = uni.get("cost_attendance") or 0
    gap = max(0, cost - family_can_pay)

    if gap == 0:
        return {
            "score": 100,
            "label": "High",
            "explanation": "Your family contribution covers full cost. No aid needed.",
            "admission_risk": False,
        }

    need_ratio = gap / cost if cost > 0 else 1.0
    aid_status = uni.get("aid_status", "NO")
    base = GRANT_BASE.get(aid_status, 5)

    # Для merit-вузов академическая сила двигает шанс сильно
    if aid_status in ("ME", "ML"):
        strength = compute_academic_strength(sat, act, gpa4, extracurricular_score, uni)
        base += 45 * strength

    # Штраф если нужен почти фул-райд, а вуз его не даёт (full_ride_intl)
    full_ride = uni.get("meets_full_need", False)
    if not full_ride and need_ratio > 0.8:
        base *= 0.45

    score = max(0, min(100, round(base)))
    admission_risk = (aid_status == "NA" and need_ratio > 0.7)

    label = "High" if score >= 70 else "Moderate" if score >= 40 else "Low"

    explanations = {
        "NB": "Need-blind for internationals — meets full demonstrated need.",
        "NA": "Meets full need if admitted, but requesting large aid may lower admission odds.",
        "ML": "Merit aid plus limited need-based support.",
        "ME": "No need-based aid for internationals — merit scholarships only.",
        "NO": "No financial aid available for international students.",
    }
    explanation = explanations.get(aid_status, "Aid policy unknown.")
    if admission_risk:
        explanation += " High aid request — notable admission risk."

    return {
        "score": score,
        "label": label,
        "explanation": explanation,
        "admission_risk": admission_risk,
    }


def tier_match(sat, act, uni):
    """
    ШАГ 1 — Определение тира университета (Reach/Match/Safety) ПО SAT/ACT,
    когда тесты сданы. Использует sat_25/sat_75 (или act_25/act_75 как fallback).
    """
    sat_25, sat_75 = uni.get("sat_25"), uni.get("sat_75")
    act_25, act_75 = uni.get("act_25"), uni.get("act_75")

    if sat and sat_25 and sat_75:
        if sat < sat_25:
            return "Reach"
        elif sat <= sat_75:
            return "Match"
        else:
            return "Safety"

    if act and act_25 and act_75:
        if act < act_25:
            return "Reach"
        elif act <= act_75:
            return "Match"
        else:
            return "Safety"

    return "Unknown"


def match_universities(universities, user):
    """
    Главная функция матчинга — реализует ШАГ 1-5 алгоритма Арсения.

    user: dict с полями:
        sat (int | None)
        act (int | None)
        gpa4 (float)                — уже нормализован к /4.0
        family_can_pay (int, USD/год)
        citizenship (str)           — собирается, не используется в MVP
        grant_needed_pct (int)      — 0-100, пока не влияет на скоринг напрямую
        extracurricular_score (float | None) — 0.0-1.0, из Step 5 (Haiku); None пока не подключено

    Возвращает dict: {"reach": [...], "match": [...], "safety": [...]}
    Каждый вуз отсортирован по grant.score по убыванию внутри своей группы.
    """
    sat = user.get("sat")
    act = user.get("act")
    gpa4 = user.get("gpa4", 0)
    family_can_pay = user.get("family_can_pay", 0)
    extracurricular_score = user.get("extracurricular_score")  # None пока Haiku не подключён

    no_test_scores = (sat is None or sat == 0) and (act is None or act == 0)

    results = {"Reach": [], "Match": [], "Safety": [], "Unknown": []}

    for uni in universities:
        cost = uni.get("cost_attendance") or 0
        gap = max(0, cost - family_can_pay)
        aid_status = uni.get("aid_status", "NO")

        # Фильтр: вуз не помогает иностранцам и семья не покрывает стоимость — пропускаем
        if gap > 0 and aid_status == "NO":
            continue

        # ШАГ 1 — определение тира
        if no_test_scores:
            # Без тестов — всё reach, КРОМЕ guaranteed-вузов (tier == 5)
            if uni.get("tier") == TIER_GUARANTEED:
                match_tier = "Safety"
            else:
                match_tier = "Reach"
        else:
            match_tier = tier_match(sat, act, uni)

        # ШАГ 3 — grant probability
        grant = grant_probability(uni, family_can_pay, sat, act, gpa4, extracurricular_score)

        # Фильтр: слишком низкий шанс гранта при реальной нужде — пропускаем
        if gap > 0 and grant["score"] < 20:
            continue

        result = {
            **uni,
            "match_tier": match_tier,
            "grant": grant,
        }
        results[match_tier].append(result)

    # Сортировка внутри каждой группы — выше шанс гранта, выше в списке
    for tier in results:
        results[tier].sort(key=lambda x: x["grant"]["score"], reverse=True)

    return {
        "reach": results["Reach"],
        "match": results["Match"],
        "safety": results["Safety"],
    }