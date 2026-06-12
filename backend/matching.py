# matching.py — вся вычислительная логика Uniply MVP


def academic_strength(sat, gpa4, uni):
    """
    Считает насколько студент сильнее типичного поступившего в этот вуз.
    Возвращает число от 0 до 1.
    0.0 = намного слабее медианы вуза
    0.5 = на уровне медианы
    1.0 = сильнее 75-го перцентиля
    """
    parts = []

    if sat and uni.get("sat_75") and uni.get("sat_25"):
        lo = uni["sat_25"]
        hi = uni["sat_75"]
        if hi > lo:
            score = (sat - lo) / (hi - lo)
            parts.append(max(0.0, min(1.0, score)))
        else:
            parts.append(0.5)

    if gpa4 and uni.get("gpa_median"):
        parts.append(max(0.0, min(1.0, gpa4 / 4.0)))

    return sum(parts) / len(parts) if parts else 0.5


def grant_probability(uni, family_can_pay, sat, gpa4):
    """
    Считает персональный шанс гранта для конкретного студента в конкретном вузе.

    uni: dict из таблицы universities
    family_can_pay: сколько семья платит в год (USD)
    sat: суммарный SAT студента
    gpa4: GPA по шкале 4.0

    Возвращает dict:
    {
        "score": 0-100,
        "label": "High" / "Moderate" / "Low",
        "explanation": строка для UI,
        "admission_risk": True/False — риск что запрос помощи снизит шансы поступления
    }
    """
    cost = uni.get("cost_attendance") or 0
    gap = max(0, cost - family_can_pay)

    # Если семья покрывает полностью — помощь не нужна
    if gap == 0:
        return {
            "score": 100,
            "label": "High",
            "explanation": "Your family contribution covers full cost. No aid needed.",
            "admission_risk": False
        }

    need_ratio = gap / cost if cost > 0 else 1.0
    strength = academic_strength(sat, gpa4, uni)

    # aid_status определяет базовый шанс:
    # "NB" = need-blind для иностранцев (Harvard, MIT, Stanford, Amherst и др.)
    # "NA" = need-aware (принимают с учётом финансов, но покрывают полную нужду)
    # "ML" = merit + ограниченная need-based помощь
    # "ME" = только merit, без need-based
    # "NO" = нет помощи иностранцам
    aid_status = uni.get("aid_status", "NO")

    base_scores = {
        "NB": 90,
        "NA": 78,
        "ML": 45,
        "ME": 25,
        "NO": 5,
    }
    base = base_scores.get(aid_status, 5)

    # Для merit-вузов академическая сила двигает шанс сильно
    if aid_status in ("ME", "ML"):
        base += 45 * strength

    # Штраф если нужен почти фул-райд, а вуз его не даёт
    meets_full = uni.get("meets_full_need", False)
    if not meets_full and need_ratio > 0.8:
        base *= 0.45

    # Корректировка на щедрость вуза — какой % иностранцев реально получает помощь
    pct = uni.get("pct_intl_receiving_aid")
    if pct is not None:
        base *= (0.6 + 0.4 * pct / 100)

    score = max(0, min(100, round(base)))

    # Need-aware риск: большой запрос снижает шансы ПОСТУПЛЕНИЯ (не гранта)
    admission_risk = (aid_status == "NA" and need_ratio > 0.7)

    label = (
        "High" if score >= 70 else
        "Moderate" if score >= 40 else
        "Low"
    )

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
        "admission_risk": admission_risk
    }


def tier_match(sat, uni):
    """
    Определяет тир студента относительно вуза.

    Логика:
    - SAT ниже sat_25 вуза → Reach (тяжело)
    - SAT между sat_25 и sat_75 → Match (реально)
    - SAT выше sat_75 → Safety (высокие шансы)
    - Нет данных SAT → Unknown
    """
    sat_25 = uni.get("sat_25")
    sat_75 = uni.get("sat_75")

    if not sat_25 or not sat_75:
        return "Unknown"

    if sat < sat_25:
        return "Reach"
    elif sat <= sat_75:
        return "Match"
    else:
        return "Safety"


def match_universities(universities, user):
    """
    Главная функция матчинга.

    universities: список dict из таблицы universities
    user: dict с полями:
        sat (int)
        gpa4 (float)
        family_can_pay (int, USD в год)
        citizenship (str)
        preferences (list of str, опционально)

    Возвращает dict:
    {
        "reach": [...],
        "match": [...],
        "safety": [...]
    }
    Каждый элемент — dict вуза + поля match_tier, grant
    """
    sat = user.get("sat", 0)
    gpa4 = user.get("gpa4", 0)
    family_can_pay = user.get("family_can_pay", 0)

    results = {"Reach": [], "Match": [], "Safety": [], "Unknown": []}

    for uni in universities:
        # Фильтр: если вуз не даёт помощь иностранцам и семья не покрывает — пропускаем
        cost = uni.get("cost_attendance") or 0
        gap = max(0, cost - family_can_pay)
        aid_status = uni.get("aid_status", "NO")

        if gap > 0 and aid_status == "NO":
            continue

        # Определяем тир
        match_tier = tier_match(sat, uni)

        # Считаем шанс гранта
        grant = grant_probability(uni, family_can_pay, sat, gpa4)

        # Фильтр: если шанс гранта слишком низкий и нужда большая — пропускаем
        if gap > 0 and grant["score"] < 20:
            continue

        result = {
            **uni,
            "match_tier": match_tier,
            "grant": grant
        }

        results[match_tier].append(result)

    # Сортировка внутри каждого тира: сначала вузы с высоким шансом гранта
    for tier in results:
        results[tier].sort(key=lambda x: x["grant"]["score"], reverse=True)

    return {
        "reach": results["Reach"],
        "match": results["Match"],
        "safety": results["Safety"]
    }