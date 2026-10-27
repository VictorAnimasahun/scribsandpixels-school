import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split, cross_val_score, cross_val_predict
from sklearn.linear_model import SGDClassifier
from sklearn.base import BaseEstimator
from sklearn.metrics import confusion_matrix, precision_score, recall_score

# 1. By hand first. The bank's fraud alarm: TP 15, FP 10, FN 5, TN 970.
def precision(tp, fp):
    # Of everything the alarm flagged, the share that really was fraud.
    return tp / (tp + fp)

def recall(tp, fn):
    # Of all the real frauds, the share the alarm caught.
    return tp / (tp + fn)

print("alarm precision:", precision(15, 10), " recall:", recall(15, 5))

# Same digits and split as yesterday.
digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.2, random_state=42, stratify=digits.target)
y_train_5 = (y_train == 5)
sgd = SGDClassifier(random_state=42)

# 2. Accuracy with 3-fold cross-validation, then a classifier that never says "5".
SGD_ACCURACY = cross_val_score(sgd, X_train, y_train_5, cv=3, scoring="accuracy").mean()

class Never5Classifier(BaseEstimator):
    def fit(self, X, y=None):
        return self
    def predict(self, X):
        return np.zeros(len(X), dtype=bool)

NEVER5_ACCURACY = cross_val_score(Never5Classifier(), X_train, y_train_5, cv=3, scoring="accuracy").mean()

# 3. Honest predictions for every training image (each made by a model that never saw it).
y_train_pred = cross_val_predict(sgd, X_train, y_train_5, cv=3)
CM = confusion_matrix(y_train_5, y_train_pred)
PRECISION = precision_score(y_train_5, y_train_pred)
RECALL = recall_score(y_train_5, y_train_pred)
print(CM)
