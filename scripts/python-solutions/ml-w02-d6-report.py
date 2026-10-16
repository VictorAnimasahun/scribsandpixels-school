import pandas as pd

df = pd.read_csv("lagos_housing.csv")
print(sorted(df["area"].unique()))

AREA_FIX = {
    "surulere": "Surulere",
    "Ikeja Gra": "Ikeja GRA",
    "Ikeja G.R.A": "Ikeja GRA",
    "lekki phase 1": "Lekki Phase 1",
    "Lekki Ph 1": "Lekki Phase 1",
    "V.I.": "Victoria Island",
    "Victoria island": "Victoria Island",
    "Ajah ": "Ajah",
}
df["area_clean"] = df["area"].replace(AREA_FIX)

BY_AREA = df.groupby("area_clean")["price_m"].median().sort_values(ascending=False)
BY_TYPE = df.groupby("property_type")["price_m"].median()

N_CAPPED = (df["price_m"] == 500).sum()
SHARE_CAPPED = N_CAPPED / len(df)
N_HUGE = (df["size_sqm"] > 1000).sum()

print(BY_AREA)
print(BY_TYPE)
print("capped:", N_CAPPED, f"({SHARE_CAPPED:.1%})", " huge sizes:", N_HUGE)
