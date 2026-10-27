import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split, cross_val_predict
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import f1_score, precision_score, recall_score, precision_recall_curve

# 1. F1: the harmonic mean of precision and recall.
def f1(p, r):
    return 2 * p * r / (p + r)

# Eight transactions, sorted by the alarm's score (1 = fraud).
SCORES = [-3.1, -2.0, -1.2, -0.4, 0.3, 0.9, 1.8, 2.6]
FRAUD  = [0,    0,    1,    0,    1,   0,   1,   1]

def precision_recall_at(threshold):
    # Flag every transaction whose score is >= threshold. Return (precision, recall).
    flagged = [f for s, f in zip(SCORES, FRAUD) if s >= threshold]
    return sum(flagged) / len(flagged), sum(flagged) / sum(FRAUD)

for t in (-1.5, 0, 0.5, 1.0):
    print("threshold", t, "→ (precision, recall) =", precision_recall_at(t))

# 2. The 5-detector: scores instead of yes/no answers.
digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.2, random_state=42, stratify=digits.target)
y_train_5 = (y_train == 5)
sgd = SGDClassifier(random_state=42)
y_train_pred = cross_val_predict(sgd, X_train, y_train_5, cv=3)
F1 = f1_score(y_train_5, y_train_pred)

y_scores = cross_val_predict(sgd, X_train, y_train_5, cv=3, method="decision_function")
precisions, recalls, thresholds = precision_recall_curve(y_train_5, y_scores)

# The LOWEST threshold that gives 100% precision, and the recall you're left with.
THRESHOLD_100 = thresholds[np.argmax(precisions >= 1.0)]
RECALL_AT_100 = recall_score(y_train_5, y_scores >= THRESHOLD_100)

# 3. Now the other way: a very low threshold of -500.
PRECISION_LOW = precision_score(y_train_5, y_scores >= -500)
RECALL_LOW = recall_score(y_train_5, y_scores >= -500)

# Draw it: precision and recall as the threshold moves.
plt.plot(thresholds, precisions[:-1], "b--", label="Precision")
plt.plot(thresholds, recalls[:-1], "g-", label="Recall")
plt.xlabel("Threshold"); plt.legend(); plt.show()
