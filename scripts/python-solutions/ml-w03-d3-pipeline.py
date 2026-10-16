import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.read_csv("lagos_housing.csv")
df["bed_cat"] = df["bedrooms"].clip(upper=5)
train_idx, test_idx = next(StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42).split(df, df["bed_cat"]))
train_set = df.iloc[train_idx].drop(columns="bed_cat")
test_set = df.iloc[test_idx].drop(columns="bed_cat")
X, y = train_set.drop(columns=["price_m", "listing_id"]), train_set["price_m"].copy()
X_test, y_test = test_set.drop(columns=["price_m", "listing_id"]), test_set["price_m"].copy()

AREA_FIX = {"surulere": "Surulere", "Ikeja Gra": "Ikeja GRA", "Ikeja G.R.A": "Ikeja GRA", "lekki phase 1": "Lekki Phase 1",
            "Lekki Ph 1": "Lekki Phase 1", "V.I.": "Victoria Island", "Victoria island": "Victoria Island", "Ajah ": "Ajah"}
NUM_COLS = ["latitude", "longitude", "bedrooms", "bathrooms", "toilets", "size_sqm", "building_age", "parking_spaces"]

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

sizes = X["size_sqm"].dropna()
minmax = (sizes - sizes.min()) / (sizes.max() - sizes.min())
SHARE_BELOW_02 = (minmax < 0.2).mean()
standard = (sizes - sizes.mean()) / sizes.std()
print("min-max: share below 0.2 =", round(SHARE_BELOW_02, 3), " median =", round(minmax.median(), 3))
print("standardized: median =", round(standard.median(), 3))

num_pipeline = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
preprocess = ColumnTransformer([
    ("num", num_pipeline, NUM_COLS + ["km_to_ikoyi"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["area", "property_type", "serviced"]),
])
full_pipeline = Pipeline([("clean", AreaCleaner()), ("distance", AddDistance()), ("prepare", preprocess)])
X_prepared = full_pipeline.fit_transform(X)
print("prepared:", X_prepared.shape)
