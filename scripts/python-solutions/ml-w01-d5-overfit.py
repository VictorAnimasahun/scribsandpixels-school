import numpy as np

TRAIN_X = [50, 65, 80, 95, 110]
TRAIN_Y = [1.4, 1.9, 2.0, 2.7, 2.9]
TEST_X = [55, 70, 88, 100, 115]
TEST_Y = [1.6, 2.0, 2.4, 2.7, 3.1]

def fit(degree):
    return np.poly1d(np.polyfit(TRAIN_X, TRAIN_Y, degree))

def mae(model, xs, ys):
    return sum(abs(model(x) - y) for x, y in zip(xs, ys)) / len(xs)

line = fit(1)
curve = fit(4)

for name, model in [("line ", line), ("curve", curve)]:
    print(name, "error on the 5 training flats:", mae(model, TRAIN_X, TRAIN_Y))
    print(name, "error on the 5 NEW flats:     ", mae(model, TEST_X, TEST_Y))

print("Curve's rent for a 130 m² flat:", curve(130))
print("Line's rent for a 130 m² flat:", line(130))
