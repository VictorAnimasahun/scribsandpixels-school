import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.linear_model import SGDClassifier

digits = load_digits()        # ships with scikit-learn: no download
X, y = digits.data, digits.target

# 1. How many images, and how many numbers (pixels) describe each one?
N_IMAGES = X.shape[0]
N_PIXELS = X.shape[1]

# 2. Lock away a test set FIRST (20%, the same share of every digit).
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Look at the first training image: 64 numbers from 0 (blank) to 16 (full ink).
print(X_train[0].reshape(8, 8).astype(int))
print("label:", y_train[0])
plt.imshow(X_train[0].reshape(8, 8), cmap="binary")
plt.axis("off")
plt.show()

# 3. Turn the labels into yes/no answers: True for 5s, False for every other digit.
y_train_5 = (y_train == 5)
y_test_5 = (y_test == 5)
N_FIVES = int(y_train_5.sum())

# 4. Train a 5-detector and ask it about the first training image.
sgd = SGDClassifier(random_state=42).fit(X_train, y_train_5)
FIRST_GUESS = sgd.predict([X_train[0]])[0]
FIRST_SCORE = sgd.decision_function([X_train[0]])[0]
