import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_predict
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, confusion_matrix

df = pd.read_csv("naija_transactions.csv")
print(df.head())
print(df.groupby("foreign")["is_fraud"].mean())     # fraud rate for local vs foreign cards

# 1. How rare is fraud? Split with the same fraud share on both sides, then measure the lazy baseline.
FRAUD_RATE = df["is_fraud"].mean()
train, test = train_test_split(df, test_size=0.2, stratify=df["is_fraud"], random_state=42)
X, y = train.drop(columns=["txn_id", "is_fraud"]), train["is_fraud"].values
X_test, y_test = test.drop(columns=["txn_id", "is_fraud"]), test["is_fraud"].values
NEVER_ACCURACY = 1 - y.mean()

# 2. Two models, each with its own preparation, compared on honest cross-validated scores.
NUM = ["amount_naira", "hour", "distance_km", "new_device", "foreign", "txns_last_24h", "account_age_days"]
prep = ColumnTransformer([("num", StandardScaler(), NUM), ("cat", OneHotEncoder(), ["merchant"])])
sgd = Pipeline([("prep", prep), ("clf", SGDClassifier(random_state=42))])
forest = Pipeline([("prep", prep), ("clf", RandomForestClassifier(n_estimators=100, min_samples_leaf=5, random_state=42))])

scores_sgd = cross_val_predict(sgd, X, y, cv=3, method="decision_function")
probas = cross_val_predict(forest, X, y, cv=3, method="predict_proba")[:, 1]
AUC_SGD = roc_auc_score(y, scores_sgd)
AUC_FOREST = roc_auc_score(y, probas)
CAUGHT_AT_HALF = int(((probas >= 0.5) & (y == 1)).sum())

# 3. Choose the threshold by money. A missed fraud costs its full amount (the bank refunds the customer).
#    A false alarm costs ₦1,000 (a verification call, and an annoyed customer).
amounts = X["amount_naira"].values
FALSE_ALARM = 1000

def cost(flags, y_true, amounts):
    # flags: True where the alarm rings. Return the naira cost of missed frauds plus false alarms.
    missed = (y_true == 1) & ~flags
    false_alarms = (y_true == 0) & flags
    return int(amounts[missed].sum() + FALSE_ALARM * false_alarms.sum())

COST_NOTHING = cost(np.zeros(len(y), dtype=bool), y, amounts)
THRESHOLDS = np.round(np.arange(0.01, 0.60, 0.01), 2)
BEST_THRESHOLD = min(THRESHOLDS, key=lambda t: cost(probas >= t, y, amounts))
COST_BEST = cost(probas >= BEST_THRESHOLD, y, amounts)

# 4. The one honest test: train the forest on the whole training set, flag the test set at your threshold.
test_flags = forest.fit(X, y).predict_proba(X_test)[:, 1] >= BEST_THRESHOLD
CAUGHT = int((test_flags & (y_test == 1)).sum())
FALSE_ALARMS = int((test_flags & (y_test == 0)).sum())
TEST_COST = cost(test_flags, y_test, X_test["amount_naira"].values)
TEST_COST_NOTHING = cost(np.zeros(len(y_test), dtype=bool), y_test, X_test["amount_naira"].values)

print(f"threshold {BEST_THRESHOLD}: caught {CAUGHT} of {int(y_test.sum())}, {FALSE_ALARMS} false alarms, cost ₦{TEST_COST:,} vs ₦{TEST_COST_NOTHING:,} doing nothing")
