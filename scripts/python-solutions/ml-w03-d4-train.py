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
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.metrics import mean_squared_error

num_pipeline = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
preprocess = ColumnTransformer([
    ("num", num_pipeline, NUM_COLS + ["km_to_ikoyi"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["area", "property_type", "serviced"]),
])
full_pipeline = Pipeline([("clean", AreaCleaner()), ("distance", AddDistance()), ("prepare", preprocess)])
X_prepared = full_pipeline.fit_transform(X)

def rmse(model, X_, y_):
    return float(np.sqrt(mean_squared_error(y_, model.predict(X_))))

lin = LinearRegression().fit(X_prepared, y)
tree = DecisionTreeRegressor(random_state=42).fit(X_prepared, y)
LIN_TRAIN = rmse(lin, X_prepared, y)
TREE_TRAIN = rmse(tree, X_prepared, y)

def cv_rmse(model):
    scores = cross_val_score(model, X_prepared, y, scoring="neg_mean_squared_error", cv=5)
    return float(np.sqrt(-scores).mean())

LIN_CV = cv_rmse(LinearRegression())
TREE_CV = cv_rmse(DecisionTreeRegressor(random_state=42))
FOREST_CV = cv_rmse(RandomForestRegressor(n_estimators=30, random_state=42))
print("train:", round(LIN_TRAIN, 2), round(TREE_TRAIN, 2), " cross-validated:", round(LIN_CV, 2), round(TREE_CV, 2), round(FOREST_CV, 2))
