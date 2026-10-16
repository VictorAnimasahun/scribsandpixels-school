CARS = [
    {"year": 2012, "mileage_km": 145000, "transmission": "automatic", "location": "Ikeja", "price_m": 4.8},
    {"year": 2015, "mileage_km": 98000, "transmission": "automatic", "location": "Lekki", "price_m": 7.2},
    {"year": 2010, "mileage_km": 190000, "transmission": "manual", "location": "Yaba", "price_m": 3.1},
    {"year": 2014, "mileage_km": 120000, "transmission": "automatic", "location": "Surulere", "price_m": 6.0},
    {"year": 2009, "mileage_km": 210000, "transmission": "manual", "location": "Ikeja", "price_m": 2.7},
]

def split_features_label(rows, label):
    X, y = [], []
    for row in rows:
        y.append(row[label])
        X.append({k: v for k, v in row.items() if k != label})
    return X, y

X, y = split_features_label(CARS, "price_m")
print("First car's features:", X[0])
print("Labels:", y)

KINDS = {
    "Predict tomorrow's danfo fare from Oshodi to CMS": "regression",
    "Decide whether an SMS is spam": "classification",
    "Group 10,000 customers by how they shop (no groups given)": "clustering",
    "Flag a card payment that looks nothing like the owner's usual ones": "anomaly detection",
    "Teach a robot to walk by rewarding every step forward": "reinforcement",
    "Predict a Lekki flat's yearly rent in naira": "regression",
    "Say whether a cassava leaf photo shows disease (photos already labelled)": "classification",
}
