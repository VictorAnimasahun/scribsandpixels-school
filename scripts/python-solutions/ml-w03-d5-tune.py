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
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import mean_squared_error

num_pipeline = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
preprocess = ColumnTransformer([
    ("num", num_pipeline, NUM_COLS + ["km_to_ikoyi"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["area", "property_type", "serviced"]),
])
full_pipeline = Pipeline([("clean", AreaCleaner()), ("distance", AddDistance()), ("prepare", preprocess)])
X_prepared = full_pipeline.fit_transform(X)

param_grid = {"n_estimators": [20, 40], "max_features": [4, 8, 12]}
grid = GridSearchCV(RandomForestRegressor(random_state=42), param_grid, cv=3, scoring="neg_mean_squared_error").fit(X_prepared, y)
BEST_PARAMS = grid.best_params_
best = grid.best_estimator_
print("best:", BEST_PARAMS, " cross-validated RMSE:", round(float(np.sqrt(-grid.best_score_)), 2))

names = NUM_COLS + ["km_to_ikoyi"] + list(full_pipeline.named_steps["prepare"].named_transformers_["cat"].get_feature_names_out(["area", "property_type", "serviced"]))
ranked = sorted(zip(best.feature_importances_, names), reverse=True)
TOP_FEATURES = [name for _, name in ranked[:3]]
print("top features:", [(n, round(v, 3)) for v, n in ranked[:6]])

X_test_prepared = full_pipeline.transform(X_test)
pred = best.predict(X_test_prepared)
TEST_RMSE = float(np.sqrt(mean_squared_error(y_test, pred)))
SHARE_WITHIN_20 = float((abs(pred - y_test) / y_test <= 0.20).mean())
print("TEST RMSE:", round(TEST_RMSE, 2), " within 20%:", round(SHARE_WITHIN_20, 3))
