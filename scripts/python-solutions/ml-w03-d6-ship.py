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
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error

num_pipeline = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
preprocess = ColumnTransformer([
    ("num", num_pipeline, NUM_COLS + ["km_to_ikoyi"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["area", "property_type", "serviced"]),
])
full_pipeline = Pipeline([("clean", AreaCleaner()), ("distance", AddDistance()), ("prepare", preprocess)])
X_prepared = full_pipeline.fit_transform(X)

model = RandomForestRegressor(n_estimators=40, max_features=12, random_state=42).fit(X_prepared, y)
pred = model.predict(full_pipeline.transform(X_test))
TEST_RMSE = float(np.sqrt(mean_squared_error(y_test, pred)))
SHARE_WITHIN_20 = float((abs(pred - y_test) / y_test <= 0.20).mean())
mask = (y_test == 500).values
CAPPED_MAE = float(np.abs(pred[mask] - y_test.values[mask]).mean())
OTHER_MAE = float(np.abs(pred[~mask] - y_test.values[~mask]).mean())

NEW = pd.DataFrame([{"area": "Yaba", "latitude": 6.5095, "longitude": 3.3781, "property_type": "flat", "bedrooms": 3,
                     "bathrooms": 3, "toilets": 4, "size_sqm": 160, "building_age": 8, "serviced": "yes", "parking_spaces": 1}])
NEW_PRICE = float(model.predict(full_pipeline.transform(NEW))[0])
print("test RMSE", round(TEST_RMSE, 2), "| within 20%", round(SHARE_WITHIN_20, 3),
      "| capped MAE", round(CAPPED_MAE, 1), "vs others", round(OTHER_MAE, 1), "| Yaba flat ₦", round(NEW_PRICE, 1), "m")
