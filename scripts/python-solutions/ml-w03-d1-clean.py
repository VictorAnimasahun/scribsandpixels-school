import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedShuffleSplit

df = pd.read_csv("lagos_housing.csv")
df["bed_cat"] = df["bedrooms"].clip(upper=5)
train_idx, test_idx = next(StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42).split(df, df["bed_cat"]))
train_set = df.iloc[train_idx].drop(columns="bed_cat")
test_set = df.iloc[test_idx].drop(columns="bed_cat")

AREA_FIX = {"surulere": "Surulere", "Ikeja Gra": "Ikeja GRA", "Ikeja G.R.A": "Ikeja GRA", "lekki phase 1": "Lekki Phase 1",
            "Lekki Ph 1": "Lekki Phase 1", "V.I.": "Victoria Island", "Victoria island": "Victoria Island", "Ajah ": "Ajah"}
NUM_COLS = ["latitude", "longitude", "bedrooms", "bathrooms", "toilets", "size_sqm", "building_age", "parking_spaces"]
from sklearn.impute import SimpleImputer

X = train_set.drop(columns=["price_m", "listing_id"])
y = train_set["price_m"].copy()
X["area"] = X["area"].replace(AREA_FIX)

MISSING_SIZE_TRAIN = X["size_sqm"].isna().sum()

imputer = SimpleImputer(strategy="median")
imputer.fit(X[NUM_COLS])
SIZE_MEDIAN = imputer.statistics_[NUM_COLS.index("size_sqm")]
print(dict(zip(NUM_COLS, imputer.statistics_)))

X_num = imputer.transform(X[NUM_COLS])
print("gaps left:", np.isnan(X_num).sum())
