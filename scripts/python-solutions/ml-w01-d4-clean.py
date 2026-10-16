import statistics

ROWS = [
    {"area": "Lekki", "size": 120, "rent": 6_500_000},
    {"area": "lekki ", "size": None, "rent": 7_200_000},
    {"area": "Leki", "size": 95, "rent": 5_800_000},
    {"area": "LEKKI", "size": 150, "rent": 9_000_000},
    {"area": "Yaba", "size": 60, "rent": 1_600_000},
    {"area": "yaba", "size": 70, "rent": 5},
    {"area": "Yabba", "size": None, "rent": 1_900_000},
    {"area": "Yaba", "size": 55, "rent": 1_450_000},
    {"area": "Ikeja", "size": 85, "rent": 3_100_000},
    {"area": " ikeja", "size": None, "rent": 2_800_000},
    {"area": "Ikeja", "size": 90, "rent": 250_000_000},
    {"area": "Ikeja", "size": 100, "rent": 3_600_000},
]

def count_missing(rows, field):
    return sum(1 for r in rows if r[field] is None)

FIX = {"lekki": "Lekki", "leki": "Lekki", "yaba": "Yaba", "yabba": "Yaba", "ikeja": "Ikeja"}

def clean_area(name):
    return FIX[name.strip().lower()]

def drop_impossible(rows):
    return [r for r in rows if 300_000 <= r["rent"] <= 50_000_000]

def fill_with_median(rows):
    m = statistics.median([r["size"] for r in rows if r["size"] is not None])
    return [{**r, "size": m} if r["size"] is None else r for r in rows]

def fill_by_area(rows):
    known = {}
    for r in rows:
        if r["size"] is not None:
            known.setdefault(r["area"], []).append(r["size"])
    return [{**r, "size": statistics.median(known[r["area"]])} if r["size"] is None else r for r in rows]

print("Missing sizes:", count_missing(ROWS, "size"))
cleaned = [{**r, "area": clean_area(r["area"])} for r in ROWS]
kept = drop_impossible(cleaned)
print("Rows kept:", len(kept))
