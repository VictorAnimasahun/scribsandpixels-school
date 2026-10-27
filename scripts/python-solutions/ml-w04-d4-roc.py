import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split, cross_val_predict
from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_curve, roc_auc_score, precision_score, recall_score

# 1. By hand. The bank's alarm: TP 15, FP 10, FN 5, TN 970.
def false_positive_rate(fp, tn):
    # Of all the INNOCENT transactions, the share the alarm wrongly flagged.
    return fp / (fp + tn)

print("alarm FPR:", false_positive_rate(10, 970))

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.2, random_state=42, stratify=digits.target)
y_train_5 = (y_train == 5)

# 2. SGD gives scores; the forest gives probabilities. Use the probability of "5" as its score.
y_scores_sgd = cross_val_predict(SGDClassifier(random_state=42), X_train, y_train_5, cv=3, method="decision_function")
y_probas_forest = cross_val_predict(RandomForestClassifier(random_state=42), X_train, y_train_5, cv=3, method="predict_proba")
y_scores_forest = y_probas_forest[:, 1]

AUC_SGD = roc_auc_score(y_train_5, y_scores_sgd)
AUC_FOREST = roc_auc_score(y_train_5, y_scores_forest)

# Draw both curves and the dashed line of a coin toss.
fpr, tpr, _ = roc_curve(y_train_5, y_scores_sgd)
fpr_f, tpr_f, _ = roc_curve(y_train_5, y_scores_forest)
plt.plot(fpr, tpr, "b:", label="SGD"); plt.plot(fpr_f, tpr_f, label="Random forest")
plt.plot([0, 1], [0, 1], "k--"); plt.xlabel("False positive rate"); plt.ylabel("True positive rate (recall)")
plt.legend(); plt.show()

# 3. The forest's precision and recall if you call it a 5 at probability 0.5 or more.
FOREST_PRECISION = precision_score(y_train_5, y_scores_forest >= 0.5)
FOREST_RECALL = recall_score(y_train_5, y_scores_forest >= 0.5)
