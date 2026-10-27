import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split, cross_val_score, cross_val_predict
from sklearn.linear_model import SGDClassifier
from sklearn.multiclass import OneVsOneClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix, f1_score

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.2, random_state=42, stratify=digits.target)

# 1. Train on all ten labels (y_train, not y_train_5). scikit-learn quietly trains 10 detectors.
sgd = SGDClassifier(random_state=42).fit(X_train, y_train)
GUESS = sgd.predict([X_train[0]])[0]
N_SCORES = len(sgd.decision_function([X_train[0]])[0])
ovo = OneVsOneClassifier(SGDClassifier(random_state=42)).fit(X_train, y_train)
N_DUELS = len(ovo.estimators_)

# 2. Accuracy (3-fold), raw pixels vs scaled pixels.
ACC_RAW = cross_val_score(SGDClassifier(random_state=42), X_train, y_train, cv=3).mean()
X_train_scaled = StandardScaler().fit_transform(X_train)
ACC_SCALED = cross_val_score(SGDClassifier(random_state=42), X_train_scaled, y_train, cv=3).mean()

# 3. Error analysis on the scaled version.
y_pred = cross_val_predict(SGDClassifier(random_state=42), X_train_scaled, y_train, cv=3)
cm = confusion_matrix(y_train, y_pred)
print(cm)
# Rows are the TRUE digit, columns what it was CALLED. Turn counts into rates per row, then hide the correct answers.
rates = cm / cm.sum(axis=1, keepdims=True)
np.fill_diagonal(rates, 0)
plt.matshow(rates, cmap="gray"); plt.xlabel("called"); plt.ylabel("true digit"); plt.show()

WORST = np.unravel_index(rates.argmax(), rates.shape)
MOST_CALLED_WRONGLY = int((cm.sum(axis=0) - np.diag(cm)).argmax())

# 4. Multilabel: two yes/no answers per image (is it 7 or more? is it odd?).
y_multilabel = np.c_[y_train >= 7, y_train % 2 == 1]
knn = KNeighborsClassifier().fit(X_train, y_multilabel)
TWO_LABELS = knn.predict([X_train[0]])[0].tolist()
MACRO_F1 = f1_score(y_multilabel, cross_val_predict(KNeighborsClassifier(), X_train, y_multilabel, cv=3), average="macro")
