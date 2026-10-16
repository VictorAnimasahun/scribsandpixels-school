"""Synthetic datasets for the Machine Learning course (fixed seed: rerunning gives the same files).

    .venv-ml/bin/python src/content/courses/machine-learning/datasets/generate.py

The lessons' "Check" answers are computed from these files, so don't change this script
without recomputing them. The data is made up but realistic: real listing and banking data
can't be copied or published.

lagos_housing.csv   3,000 Lagos property listings for sale (Weeks 2-3, 10)
    Like Geron's California data, it has deliberate problems to find and fix: missing sizes and
    bathrooms, inconsistent area spellings, a few size typos (an extra zero), and prices capped
    at N500m (anything above was recorded as 500).
naija_transactions.csv   4,000 card/POS/transfer payments, about 2.5% fraud (Week 4)
"""
import csv
import math
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
rng = np.random.default_rng(20261016)

# area: (latitude, longitude, price per m2 in N millions, mix of property types)
AREAS = {
    "Ikoyi":           (6.4520, 3.4350, 1.90, {"flat": .55, "terrace": .20, "detached duplex": .15, "semi-detached duplex": .10}),
    "Victoria Island": (6.4281, 3.4219, 1.65, {"flat": .65, "terrace": .20, "detached duplex": .10, "semi-detached duplex": .05}),
    "Lekki Phase 1":   (6.4474, 3.4723, 1.05, {"flat": .40, "terrace": .25, "semi-detached duplex": .20, "detached duplex": .15}),
    "Ikeja GRA":       (6.5806, 3.3543, 0.90, {"flat": .35, "detached duplex": .30, "semi-detached duplex": .20, "terrace": .15}),
    "Magodo":          (6.6213, 3.3819, 0.70, {"detached duplex": .35, "semi-detached duplex": .25, "flat": .25, "bungalow": .15}),
    "Gbagada":         (6.5532, 3.3887, 0.55, {"flat": .55, "terrace": .15, "semi-detached duplex": .15, "self-contain": .15}),
    "Yaba":            (6.5095, 3.3781, 0.50, {"flat": .55, "self-contain": .30, "terrace": .15}),
    "Surulere":        (6.5000, 3.3550, 0.45, {"flat": .55, "self-contain": .25, "bungalow": .10, "terrace": .10}),
    "Ojodu":           (6.6400, 3.3700, 0.40, {"flat": .45, "bungalow": .25, "self-contain": .15, "semi-detached duplex": .15}),
    "Festac":          (6.4680, 3.2830, 0.35, {"flat": .45, "bungalow": .30, "self-contain": .15, "terrace": .10}),
    "Ajah":            (6.4680, 3.5660, 0.35, {"bungalow": .30, "flat": .30, "semi-detached duplex": .20, "terrace": .20}),
    "Ikorodu":         (6.6150, 3.5080, 0.15, {"bungalow": .50, "self-contain": .25, "flat": .15, "detached duplex": .10}),
}
# How often each area appears (busy markets have more listings).
AREA_WEIGHTS = {"Ikoyi": 6, "Victoria Island": 5, "Lekki Phase 1": 14, "Ikeja GRA": 8, "Magodo": 6, "Gbagada": 9,
                "Yaba": 10, "Surulere": 10, "Ojodu": 7, "Festac": 6, "Ajah": 12, "Ikorodu": 7}
# type: (size range m2, bedrooms range, price factor)
TYPES = {
    "self-contain":         ((22, 45), (1, 1), 0.95),
    "flat":                 ((55, 190), (1, 4), 1.00),
    "terrace":              ((150, 280), (3, 4), 1.05),
    "bungalow":             ((90, 260), (2, 4), 0.85),
    "semi-detached duplex": ((200, 360), (4, 5), 1.10),
    "detached duplex":      ((250, 600), (4, 6), 1.20),
}
SPELLINGS = {"Lekki Phase 1": ["Lekki Ph 1", "lekki phase 1"], "Ikeja GRA": ["Ikeja G.R.A", "Ikeja Gra"],
             "Victoria Island": ["V.I.", "Victoria island"], "Surulere": ["surulere"], "Ajah": ["Ajah "]}
CAP = 500


def housing(n=3000):
    names = list(AREAS)
    weights = np.array([AREA_WEIGHTS[a] for a in names], dtype=float)
    weights /= weights.sum()
    rows = []
    for i in range(n):
        area = names[rng.choice(len(names), p=weights)]
        lat, lon, per_m2, mix = AREAS[area]
        types, probs = list(mix), np.array(list(mix.values()))
        ptype = types[rng.choice(len(types), p=probs / probs.sum())]
        (smin, smax), (bmin, bmax), factor = TYPES[ptype]
        size = int(round(rng.uniform(smin, smax)))
        # Bigger homes have more bedrooms.
        share = (size - smin) / max(1, smax - smin)
        bedrooms = int(min(bmax, max(bmin, round(bmin + share * (bmax - bmin) + rng.normal(0, 0.5)))))
        bathrooms = int(max(1, min(bedrooms + 1, bedrooms - (1 if rng.random() < 0.25 else 0) + (1 if rng.random() < 0.15 else 0))))
        toilets = bathrooms + (1 if rng.random() < 0.7 and ptype != "self-contain" else 0)
        age = int(min(45, rng.gamma(2.2, 5.0)))
        serviced = "yes" if rng.random() < (0.55 if per_m2 >= 0.9 else 0.2) else "no"
        parking = int(min(6, max(0, round((size / 120) + rng.normal(0, 0.8)))))
        price = size * per_m2 * factor
        price *= max(0.6, 1 - 0.012 * age)
        price *= 1.12 if serviced == "yes" else 1.0
        price *= 1 + 0.02 * parking
        price *= math.exp(rng.normal(0, 0.18))
        price = round(price, 1)
        capped = min(price, CAP)
        rows.append({
            "listing_id": f"LH{i + 1:04d}",
            "area": area,
            "latitude": round(lat + rng.normal(0, 0.008), 5),
            "longitude": round(lon + rng.normal(0, 0.008), 5),
            "property_type": ptype,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "toilets": toilets,
            "size_sqm": size,
            "building_age": age,
            "serviced": serviced,
            "parking_spaces": parking,
            "price_m": capped,
        })
    # Deliberate problems, placed at random but reproducibly.
    idx = rng.permutation(n)
    for j in idx[:60]:
        rows[j]["size_sqm"] = ""                      # 60 missing sizes
    for j in idx[60:85]:
        rows[j]["bathrooms"] = ""                     # 25 missing bathrooms
    for j in idx[85:90]:
        if rows[j]["size_sqm"] != "":
            rows[j]["size_sqm"] = rows[j]["size_sqm"] * 10   # 5 typos: an extra zero
    k = 0
    for j in idx[90:]:
        a = rows[j]["area"]
        if a in SPELLINGS and k < 45:
            rows[j]["area"] = SPELLINGS[a][k % len(SPELLINGS[a])]   # 45 inconsistent spellings
            k += 1
    return rows


def transactions(n=4000):
    merchants = ["pos", "online", "transfer", "atm"]
    rows = []
    for i in range(n):
        merchant = merchants[rng.choice(4, p=[0.45, 0.25, 0.22, 0.08])]
        hour = int(rng.choice(24, p=np.array([1, .5, .4, .3, .3, .6, 2, 4, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 5, 4, 3, 2, 1.5]) / 99.6))
        amount = int(round(math.exp(rng.normal(9.6, 1.1)) / 50) * 50)  # mostly N5k-N60k
        distance = round(float(rng.exponential(6)), 1)
        new_device = int(rng.random() < 0.06)
        foreign = int(rng.random() < 0.03)
        txns_24h = int(rng.poisson(2.5))
        account_age_days = int(rng.gamma(2.0, 400))
        z = (-4.6 + 1.6 * new_device + 2.2 * foreign + 0.9 * (hour < 5) + 0.0035 * distance * 10
             + 0.55 * math.log1p(amount / 10000) + 0.18 * max(0, txns_24h - 3) + 0.8 * (merchant == "online")
             - 0.0008 * account_age_days)
        fraud = int(rng.random() < 1 / (1 + math.exp(-z)))
        rows.append({"txn_id": f"TX{i + 1:05d}", "amount_naira": amount, "hour": hour, "merchant": merchant,
                     "distance_km": distance, "new_device": new_device, "foreign": foreign,
                     "txns_last_24h": txns_24h, "account_age_days": account_age_days, "is_fraud": fraud})
    return rows


def write(name, rows):
    with open(HERE / name, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f"wrote {name}: {len(rows)} rows")


if __name__ == "__main__":
    write("lagos_housing.csv", housing())
    write("naija_transactions.csv", transactions())
