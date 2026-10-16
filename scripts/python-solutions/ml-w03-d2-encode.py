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
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import OrdinalEncoder, OneHotEncoder

X = train_set.drop(columns=["price_m", "listing_id"])
areas = X[["area"]].replace(AREA_FIX)

ordinal = OrdinalEncoder().fit(areas)
cats = list(ordinal.categories_[0])
print(cats)
CODE_IKORODU = cats.index("Ikorodu")
CODE_IKOYI = cats.index("Ikoyi")

onehot = OneHotEncoder().fit(areas)
AREA_COLUMNS = onehot.transform(areas).shape[1]

class AreaCleaner(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        X = X.copy()
        X["area"] = X["area"].replace(AREA_FIX)
        return X

class AddDistance(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        X = X.copy()
        X["km_to_ikoyi"] = np.sqrt(((X["latitude"] - 6.452) * 111) ** 2 + ((X["longitude"] - 3.435) * 110) ** 2)
        return X

print(AddDistance().fit_transform(AreaCleaner().fit_transform(X))[["area", "km_to_ikoyi"]].head())
